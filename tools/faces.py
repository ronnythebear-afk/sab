"""
Builds the photo booth on the front page from a folder of selfies.

    pip install "opencv-python-headless<5" pillow
    python3 tools/faces.py inbox/faces

For each photo it finds the face (or uses the box in faces-fix.json, for photos the
detector gets wrong), crops a square around it so every face lands in about the same
spot, saves it to site/media/faces/, and picks out the photo's strongest color, which
the page uses for its background. New photos are added to the ones already there, and
site/content/faces.js is rewritten in hair-color order, so moving across the page runs
through the colors. To take a photo out, delete its line from faces.js.

faces-fix.json, in the same folder as the photos, looks like this, with everything
measured as a share of the photo's width and height:
    { "IMG_0042.jpg": { "cx": 0.5, "cy": 0.4, "fw": 0.35, "color": "#e0218a" },
      "IMG_0043.jpg": { "color": "#2f6f73" }, "IMG_0044.jpg": "skip" }
cx and cy are the middle of the face, fw is how wide the face is. color is the hair color,
for when the one it picks isn't right.
"""
import colorsys
import json
import os
import sys

import cv2
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'site', 'media', 'faces')
LIST = os.path.join(ROOT, 'site', 'content', 'faces.js')
SIZE = 900
FACE_SHARE = 0.52  # how much of the square the face takes up


def detect(path):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    g = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = cascade.detectMultiScale(g, 1.08, 5, minSize=(int(min(w, h) * .12),) * 2)
    if len(faces) == 0:
        return None
    x, y, fw, fh = max(faces, key=lambda r: r[2] * r[3])
    return {'cx': (x + fw / 2) / w, 'cy': (y + fh / 2) / h, 'fw': fw / w}


def crop(im, box):
    w, h = im.size
    side = min(box['fw'] * w / FACE_SHARE, w, h)
    cx, cy = box['cx'] * w, box['cy'] * h
    left = min(max(0, cx - side / 2), w - side)
    top = min(max(0, cy - side / 2), h - side)
    return im.crop((round(left), round(top), round(left + side), round(top + side))).resize((SIZE, SIZE), Image.LANCZOS)


def strongest_color(im):
    """The most colorful common color in the top two thirds (where the hair is)."""
    small = im.resize((90, 90)).crop((0, 0, 90, 60)).convert('RGB')
    pal = small.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    colors = pal.getpalette()[:24]
    counts = sorted(pal.getcolors(), reverse=True)
    best, score = (40, 36, 38), -1
    for count, idx in counts:
        r, g, b = colors[idx * 3: idx * 3 + 3]
        hh, ll, ss = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        s = ss * (1 - abs(ll - .5) * 1.4) * (count ** .5)
        if s > score:
            best, score = (r, g, b), s
    r, g, b = best
    hh, ll, ss = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    # Keep it bold enough to be a background, and soft enough to sit behind type.
    ll = min(max(ll, .32), .62)
    ss = max(ss, .35) if ss > .12 else ss
    r, g, b = colorsys.hls_to_rgb(hh, ll, ss)
    return '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255)), hh, ss


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'inbox', 'faces')
    fix_path = os.path.join(src, 'faces-fix.json')
    fixes = json.load(open(fix_path)) if os.path.exists(fix_path) else {}
    os.makedirs(OUT, exist_ok=True)
    # Start from the photos already in the booth, so new ones are added to them.
    frames = []
    if os.path.exists(LIST):
        t = open(LIST).read()
        for x in json.loads(t[t.index('['):t.rindex(']') + 1]):
            r, g, b = (int(x['color'][i:i + 2], 16) / 255 for i in (1, 3, 5))
            hue, _, sat = colorsys.rgb_to_hls(r, g, b)
            frames.append({'src': x['src'], 'color': x['color'], 'hue': hue, 'sat': sat})
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        fix = fixes.get(f) or {}
        if fix == 'skip':
            print('skipped', f)
            continue
        box = fix if 'cx' in fix else detect(os.path.join(src, f))
        if box is None:
            print('skipped', f, '(no face found; add it to faces-fix.json)')
            continue
        im = ImageOps.exif_transpose(Image.open(os.path.join(src, f))).convert('RGB')
        sq = crop(im, box)
        name = os.path.splitext(f)[0].lower().replace(' ', '-') + '.jpg'
        sq.save(os.path.join(OUT, name), 'JPEG', quality=82, optimize=True, progressive=True)
        color, hue, sat = strongest_color(sq)
        if fix.get('color'):  # a hair color picked by hand wins
            color = fix['color']
            r, g, b = (int(color[i:i + 2], 16) / 255 for i in (1, 3, 5))
            hue, _, sat = colorsys.rgb_to_hls(r, g, b)
        frames = [x for x in frames if x['src'] != 'media/faces/' + name]
        frames.append({'src': 'media/faces/' + name, 'color': color, 'hue': hue, 'sat': sat})
        print('ok', f, color)
    # Colorful ones in hue order, starting at red, then the dark and plain ones at the end.
    bright = sorted([x for x in frames if x['sat'] > .3], key=lambda x: (x['hue'] + .04) % 1)
    plain = [x for x in frames if x['sat'] <= .3]
    ordered = [{'src': x['src'], 'color': x['color']} for x in bright + plain]
    with open(LIST, 'w') as out:
        out.write('// Made by tools/faces.py. The photo booth on the front page, in hair-color order.\n')
        out.write('window.SAB_FACES = ' + json.dumps(ordered, indent=1) + ';\n')
    print(len(ordered), 'frames')


if __name__ == '__main__':
    main()
