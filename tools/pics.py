"""
Turns pictures in the drop folder into cards on the Posts deck.

    pip install pillow pillow-heif
    python3 tools/pics.py

Each picture is shrunk, saved in site/media/pics/, and added to the top of
site/content/feed.js with its date (from the camera, or from a date in the file name). If
the file has a name you gave it rather than one the camera gave it, that name is the
caption: "my tiny christmas tree.jpg" says "my tiny christmas tree". Pictures that go in are
taken out of the drop folder.
"""
import datetime
import hashlib
import json
import os
import re

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener  # iPhone photos (.heic)
    register_heif_opener()
except ImportError:
    pass

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INBOX = os.path.join(ROOT, 'drop')
OUT = os.path.join(ROOT, 'site', 'media', 'pics')
FEED = os.path.join(ROOT, 'site', 'content', 'feed.js')
PICS = ('.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp', '.gif', '.tif', '.tiff')
CAMERA = re.compile(r'^(img|dsc|dscn|dscf|dcim|pxl|mvimg|photo|image|screenshot|screen shot|scan|untitled|p\d|\d)', re.I)


def read_feed():
    if not os.path.exists(FEED):
        return []
    text = open(FEED, encoding='utf-8').read()
    return json.loads(text[text.index('['):text.rindex(']') + 1])


def write_feed(items):
    items.sort(key=lambda x: str(x.get('date') or '').ljust(10, '-'), reverse=True)
    rows = ',\n'.join(' ' + json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in items)
    open(FEED, 'w', encoding='utf-8').write(
        '// Made by tools/drop.mjs and tools/pics.py, newest first. One thing per line. Delete a line to take it out.\n'
        'window.SAB_FEED = [\n' + rows + '\n];\n')


def taken(im, name):
    """The date the picture was taken, as YYYY-MM-DD (or a year), or today."""
    try:
        exif = im.getexif()
        when = exif.get_ifd(0x8769).get(36867) or exif.get(306)
        if when:
            return datetime.datetime.strptime(str(when)[:10], '%Y:%m:%d').strftime('%Y-%m-%d')
    except Exception:
        pass
    m = re.search(r'(19[89]\d|20[0-4]\d)[-_. ]?([01]\d)[-_. ]?([0-3]\d)', name)
    if m and 1 <= int(m.group(2)) <= 12 and 1 <= int(m.group(3)) <= 31:
        return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
    m = re.search(r'\b(19[89]\d|20[0-4]\d)\b', name)
    return m.group(1) if m else datetime.date.today().isoformat()


def caption(name):
    stem = os.path.splitext(name)[0]
    stem = re.sub(r'(19[89]\d|20[0-4]\d)[-_. ]?[01]\d[-_. ]?[0-3]\d', ' ', stem)
    stem = re.sub(r'[-_]+', ' ', stem).strip()
    if not stem or CAMERA.match(stem) or re.fullmatch(r'[0-9a-f ]{8,}', stem, re.I):
        return ''
    return stem


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:40]


def main():
    if not os.path.isdir(INBOX):
        return print('No drop folder.')
    files = sorted(os.path.join(INBOX, f) for f in os.listdir(INBOX) if f.lower().endswith(PICS))
    if not files:
        return print('No new pictures.')
    feed = read_feed()
    os.makedirs(OUT, exist_ok=True)
    for path in files:
        name = os.path.basename(path)
        try:
            im = Image.open(path)
            date, words = taken(im, name), caption(name)
            im = ImageOps.exif_transpose(im).convert('RGB')
            im.thumbnail((1400, 1400))
            base = f"{date}-{slug(words) or hashlib.sha1(open(path, 'rb').read()).hexdigest()[:8]}"
            out, n = base, 1
            while os.path.exists(os.path.join(OUT, out + '.jpg')):
                n += 1
                out = f'{base}-{n}'
            im.save(os.path.join(OUT, out + '.jpg'), quality=82, optimize=True, progressive=True)
            feed.append({'id': 'i-' + out, 'type': 'pic', 'date': date, 'text': words, 'img': f'media/pics/{out}.jpg'})
            os.remove(path)
            print('added', name)
        except Exception as e:
            print('could not use', name, '-', e)
    write_feed(feed)


if __name__ == '__main__':
    main()
