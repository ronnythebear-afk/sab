# summeranneburton.com

Summer's website. The front page is a pile on hot pink. Her name lands first in cut-out letters, then everything else falls on top of it: photo booth strips, prints from campaigns, index cards, Hall of Famer drawings, clippings and playlist covers. Anything can be picked up and thrown. Tapping a thing opens it, and tapping a photo booth strip takes four new pictures. Tidy lines it all up in rows, Mess drops it again, Shake throws it in the air, and on a phone Tilt lets gravity follow the phone.

Nothing on the site is written for her. Text is a plain fact (a name, a client, a year), her own words, or a quote from coverage with who said it.

The physics is Matter.js, kept in `site/assets/vendor/`.

There's no build step. The site is the `site/` folder, as is.

## Look at it on your computer

```
npx serve site
```

## Change what it says

- `site/content/content.js` has the work, the CV, the drawings, the writing and your links. Each piece of work can have `words` (yours) and `quotes` (other people's, with `who`). Lines marked `CHECK` are things found on the web to confirm.
- `site/content/faces.js` is the photo booth pictures, made by `tools/faces.py`.
- What lands in the pile is picked in `things()` at the top of `site/assets/site.js`, by id.
- `site/content/playlists.js` is the playlists, made by `tools/playlists.mjs` from `playlists.txt`.
- `lookingForWork` and `lookingLine` in content.js are off and empty. They're for when you want to say you're looking, in your own words.

## Adding photos to the photo booth strips

Selfies work best when the face is clear and fills a good part of the frame. Put them in a folder and run:

```
pip install "opencv-python-headless<5" pillow
python3 tools/faces.py path/to/folder
```

It finds each face, crops a square so every face lands in about the same spot, and notes the hair color. If it gets a face wrong, or picks the wrong color, fix it in a `faces-fix.json` in the same folder (the top of `tools/faces.py` explains, and `tools/faces-fix.example.json` is the file used for the first 18). New photos are added to the ones already there. To take one out, delete its line from faces.js.

## The other tools

They need Node 18 or newer and nothing else.

- `node tools/clip.mjs --all` saves a clean copy of every article in content.js that doesn't have one yet: the words and pictures, no ads, every image kept here so it can't break. It tries the original page first and the Internet Archive second. Five (two NotGraphs posts, The Hairpin, both Medium pieces) need running from a computer that can reach the Internet Archive.
- `node tools/playlists.mjs` reads `playlists.txt` and fetches each playlist's title and cover from Spotify. With `--user summeranne` and a Spotify app's keys (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`), it also finds every public playlist on the account and adds new ones to playlists.txt, commented out.

## Where things came from

- The photo booth selfies are from Summer's own Tumblr posts, 2011 to 2015.
- Campaign photos for the parchment paper dress, Brynn Whitfield and Paige DeSorbo are from the brands' PR Newswire announcements. Visit Tomorrow, Streak Shop and the BuzzFeed photos are from the old Squarespace site.
- The Hall of Famer drawings and the other artwork are from the old Squarespace site.
- The playlists are ones shared on Tumblr between 2011 and 2015.

HOSTING.md covers putting it online at summeranneburton.com.
