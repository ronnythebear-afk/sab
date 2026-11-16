"""
Puts new photos on the site.

    pip install pillow pillow-heif "opencv-python-headless<5"
    python3 tools/photos.py

Photos in add/photos/ go on the old hard drive: the video board on the scoreboard shows
them in turn, with the selfies. Each photo is shrunk, saved in site/media/drive/ and
listed in site/content/drive.js with its date (from the camera, or from a date in the file
name). If the file has a name you gave it, rather than one the camera gave it, that name
is its caption: "my tiny christmas tree.jpg" says "my tiny christmas tree".

Photos in add/selfies/ go on the video board too, through tools/faces.py.

Photos that go in are taken out of add/. A selfie with no face the booth can find stays
there, so you can see which ones didn't work.
"""
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener  # iPhone photos (.heic)
    register_heif_opener()
except ImportError:
    pass

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INBOX = os.path.join(ROOT, 'add', 'photos')
SELFIES = os.path.join(ROOT, 'add', 'selfies')
OUT = os.path.join(ROOT, 'site', 'media', 'drive')
LIST = os.path.join(ROOT, 'site', 'content', 'drive.js')
PICS = ('.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp', '.gif', '.tif', '.tiff')
CAMERA = re.compile(r'^(img|dsc|dscn|dscf|dcim|pxl|mvimg|photo|image|screenshot|screen shot|scan|untitled|p\d|\d)', re.I)


def read_list():
    if not os.path.exists(LIST):
        return []
    text = open(LIST, encoding='utf-8').read()
    return json.loads(text[text.index('['):text.rindex(']') + 1])


def write_list(items):
    rows = ',\n'.join(' ' + json.dumps(x, ensure_ascii=False) for x in items)
    open(LIST, 'w', encoding='utf-8').write(
        '// Made by tools/photos.py. The old hard drive: one photo per line. Delete a line to take one out.\n'
        'window.SAB_DRIVE = [\n' + rows + '\n];\n')


def taken(im, name):
    """The date the photo was taken, as YYYY-MM-DD, or ''."""
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
    return m.group(1) if m else ''


def caption(name):
    stem = os.path.splitext(name)[0]
    stem = re.sub(r'(19[89]\d|20[0-4]\d)[-_. ]?[01]\d[-_. ]?[0-3]\d', ' ', stem)
    stem = re.sub(r'[-_]+', ' ', stem).strip()
    if not stem or CAMERA.match(stem) or re.fullmatch(r'[0-9a-f ]{8,}', stem, re.I):
        return ''
    return stem


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:40]


def add_photo(path, date=None, words=None):
    """Shrinks one photo into site/media/drive/ and returns its line for drive.js."""
    name = os.path.basename(path)
    im = Image.open(path)
    date = taken(im, name) if date is None else date
    words = caption(name) if words is None else words
    im = ImageOps.exif_transpose(im).convert('RGB')
    im.thumbnail((1200, 1200))
    os.makedirs(OUT, exist_ok=True)
    tag = slug(words) or hashlib.sha1(open(path, 'rb').read()).hexdigest()[:8]
    base = f"{date or 'undated'}-{tag}"
    out, n = base, 1
    while os.path.exists(os.path.join(OUT, out + '.jpg')):
        n += 1
        out = f'{base}-{n}'
    im.save(os.path.join(OUT, out + '.jpg'), quality=82, optimize=True, progressive=True)
    return {'src': f'media/drive/{out}.jpg', 'date': date, 'words': words}


def files_in(folder):
    if not os.path.isdir(folder):
        return []
    return sorted(os.path.join(folder, f) for f in os.listdir(folder) if f.lower().endswith(PICS))


def main():
    items = read_list()
    added = 0
    for path in files_in(INBOX):
        try:
            items.append(add_photo(path))
            os.remove(path)
            added += 1
            print('hard drive:', os.path.basename(path))
        except Exception as e:
            print('could not use', os.path.basename(path), '-', e)
    if added:
        items.sort(key=lambda x: x.get('date') or '9999')
        write_list(items)
    print(added, 'photos added to the old hard drive,', len(items), 'in all')

    selfies = files_in(SELFIES)
    if not selfies:
        return
    # The booth names each crop after its file, so give every new selfie a name of its own
    # (two phones can both make an IMG_0001), and make it a JPEG, which is what faces.py reads.
    # Files named in faces-fix.json keep their names so the fixes still find them.
    fix_path = os.path.join(SELFIES, 'faces-fix.json')
    fixed = set(json.load(open(fix_path))) if os.path.exists(fix_path) else set()
    for path in selfies:
        name = os.path.basename(path)
        if name in fixed:
            continue
        try:
            im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
        except Exception as e:
            print('could not open', name, '-', e)
            continue
        new = os.path.join(SELFIES, 'selfie-' + hashlib.sha1(open(path, 'rb').read()).hexdigest()[:10] + '.jpg')
        im.save(new, quality=92)
        if new != path:
            os.remove(path)
    run = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'faces.py'), SELFIES], capture_output=True, text=True)
    print(run.stdout + run.stderr)
    for line in run.stdout.splitlines():
        if line.startswith('ok '):
            done = os.path.join(SELFIES, line[3:].rsplit(' ', 1)[0])
            if os.path.exists(done):
                os.remove(done)


if __name__ == '__main__':
    main()
