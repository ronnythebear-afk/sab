# summeranneburton.com

Summer's website is a ballpark seen from home plate, under the Austin sky at whatever time it is in Austin: blue in the day, golden at sunset, lights on at night. Pitches keep coming. Tap to swing, and the ball goes where you tapped.

- The billboards on the outfield wall are the work.
- The ticker under the scoreboard runs the writing. A hit there opens the headline that's running.
- The plaques along the stands are Every Hall of Famer.
- Over the wall is a home run, and a home run plays a playlist.
- The video board shows the selfies and the old hard drive photos. A hit there sets off the photo booth.
- The name in lights is the CV.

The scoreboard also has the Austin weather and time, and the Astros score when they're playing. Every hit is a card, and the Cards binder (bottom right) holds all of them, face down until they're hit. Any card can be opened from the binder, so nothing needs a hit to be seen. CV and Email are always at the top right.

Nothing on the site is written for her. Text is a plain fact (a name, a client, a year), her own words, or a quote from coverage with who said it.

There's no build step. The site is the `site/` folder, as is. HOSTING.md covers putting it online.

## Adding things

Everything can be done on github.com, in the browser.

- **An article.** Open `articles.txt`, click the pencil, paste the link on a new line, and Commit changes. The site makes its own clean copy (words and pictures, no ads) and puts it on the ticker.
- **A playlist.** Same thing in `playlists.txt`, with a Spotify playlist link.
- **Old photos.** Open the `add/photos` folder, then Add file, then Upload files. Drag them in and Commit changes. Name a file what you want its caption to say ("my tiny christmas tree.jpg"), or leave the camera's name for no caption. The date comes from the photo.
- **Selfies.** Same, in `add/selfies`.

A couple of minutes after you commit, GitHub puts the new things in by itself (`.github/workflows/add.yml`) and the site updates.

To take something out: delete its line from `articles.txt` or `playlists.txt`, or its line from `site/content/drive.js` (old photos) or `site/content/faces.js` (selfies).

## Changing words

`site/content/content.js` has the work (the billboards), the CV card and the drawings. Each piece of work can have `words` (yours) and `quotes` (other people's, with `who`).

## On your own computer

```
npx serve site
```

Add `?alt=-15` to the address to see the park at night, `?alt=2` for sunset (it's the sun's height over Austin, in degrees).

To put new things in without GitHub (needs Node 18+ and Python 3):

```
pip install pillow pillow-heif "opencv-python-headless<5"
sh tools/add.sh
```

The tools it runs: `tools/clip.mjs` (articles), `tools/playlists.mjs` (playlists), `tools/photos.py` (old photos and selfies, using `tools/faces.py` for the selfies). The top of each file says more.

## Where things came from

- The old hard drive photos and selfies are from Summer's Tumblr, 2009 to 2015, with her captions from then.
- Campaign photos for the parchment paper dress, Brynn Whitfield and Paige DeSorbo are from the brands' PR Newswire announcements. The Visit Tomorrow photo is from the old Squarespace site.
- The Hall of Famer drawings are from the old Squarespace site.
- The playlists are ones shared on Tumblr, with her notes from then.
- The weather is from Open-Meteo and the Astros score from MLB's public stats feed, both fetched by the visitor's browser.
- Anything cut from earlier versions of the site is in this repository's history.
