#!/bin/sh
# Puts in everything that's waiting: new links in articles.txt and playlists.txt, and new
# photos in add/photos and add/selfies. GitHub runs this by itself whenever one of those
# changes (see .github/workflows/add.yml). To run it on your own computer:
#   pip install pillow pillow-heif "opencv-python-headless<5"
#   sh tools/add.sh
cd "$(dirname "$0")/.." || exit 1
node tools/clip.mjs --all || echo "Some articles couldn't be copied. They're still listed and link to the original."
node tools/playlists.mjs || echo "The playlists didn't update."
python3 tools/photos.py || echo "The photos didn't go in."
