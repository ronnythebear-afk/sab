# summeranneburton.com

Summer's website, all on one page. It starts as a pile on hot pink: her name in cut-out letters, photo booth strips, a photo from the old hard drive, work, writing, Hall of Famer drawings, playlists, and index cards for the CV and email. Anything can be picked up and thrown, and tapping a thing opens it. Tidy lines it all up in rows, which is also the index. Mess drops it again, and Shake throws it in the air.

Nothing on the site is written for her. Text is a plain fact (a name, a client, a year), her own words, or a quote from coverage with who said it.

There's no build step. The site is the `site/` folder, as is. HOSTING.md covers putting it online.

## Adding things

Everything can be done on github.com, in the browser.

- **An article.** Open `articles.txt`, click the pencil, paste the link on a new line, and Commit changes. The site makes its own clean copy (words and pictures, no ads) and adds it to Writing. The first five are in the pile.
- **A playlist.** Same thing in `playlists.txt`, with a Spotify playlist link. The first five are in the pile.
- **Old photos.** Open the `add/photos` folder, then Add file, then Upload files. Drag them in and Commit changes. Name a file what you want its caption to say ("my tiny christmas tree.jpg"), or leave the camera's name for no caption. The date comes from the photo.
- **Selfies.** Same, in `add/selfies`. They go in the photo booth strips.

A couple of minutes after you commit, GitHub puts the new things in by itself (`.github/workflows/add.yml`) and the site updates. The order of the lines in the two .txt files is the order on the site.

To take something out: delete its line from `articles.txt` or `playlists.txt`, or its line from `site/content/drive.js` (old photos) or `site/content/faces.js` (selfies).

## Changing words

`site/content/content.js` has the work, the CV card and the drawings. Each piece of work can have `words` (yours) and `quotes` (other people's, with `who`).

## On your own computer

```
npx serve site
```

To put new things in without GitHub (needs Node 18+ and Python 3):

```
pip install pillow pillow-heif "opencv-python-headless<5"
sh tools/add.sh
```

The tools it runs: `tools/clip.mjs` (articles), `tools/playlists.mjs` (playlists), `tools/photos.py` (old photos and selfies, using `tools/faces.py` for the booth). The top of each file says more.

## Where things came from

- The old hard drive and photo booth photos are from Summer's Tumblr, 2009 to 2015, with her captions from then.
- Campaign photos for the parchment paper dress, Brynn Whitfield and Paige DeSorbo are from the brands' PR Newswire announcements. Visit Tomorrow and the BuzzFeed photo are from the old Squarespace site.
- The Hall of Famer drawings are from the old Squarespace site.
- The playlists are ones shared on Tumblr, with her notes from then.
- Anything cut from earlier versions of the site is in this repository's history (commit 565715b has the last of it).
