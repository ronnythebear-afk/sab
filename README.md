# summeranneburton.com

Summer's website. The front page is a list, "Some of the things I've done," and each line opens something real: a campaign, a clipping, a playlist, the Hall of Famer drawings, the back of a baseball card. Everything on it is hers. The photos are her photos and the campaigns' own press photos, the drawings are from Every Hall of Famer, the covers are her Spotify playlists, and the words are hers wherever they could be.

There's no build step. The site is the `site/` folder, as is.

## Look at it on your computer

```
npx serve site
```

Then open the address it prints. (Opening `site/index.html` by double-clicking mostly works too, but a few things, like the clean article copies, want a real address.)

## Change what it says

- The list is `site/content/list.js`. It's a plain block of text, one line per thing, and the top of the file explains the little marks (`==highlight==`, `~~cross out~~ {handwritten fix}`) and where a line can point. It's a draft written from your own words. Rewrite anything that doesn't sound like you.
- Everything else is `site/content/content.js`: the line under your name, each campaign's write-up, the career card, the drawings, the clippings, your links. Lines marked `CHECK` are things I found on the web and want you to confirm.
- Photos go in `site/media/`. A campaign gets a picture by adding it to that campaign's `images` in content.js.
- `lookingForWork` in content.js is `false`. Set it to `true` when you want the bottom of the page to say you're looking.

## The tools

They need Node 18 or newer and nothing else.

- `node tools/clip.mjs --all` makes a clean copy of every clipping in content.js that doesn't have one yet: the words and pictures, no ads, every image saved here so it can't break. It tries the original page first and the Internet Archive second. To add an article, put it in the `clippings` list in content.js and run this. Five of them (two NotGraphs posts, The Hairpin, and both Medium pieces) couldn't be reached from where this was built, and should work from your computer.
- `node tools/playlists.mjs` reads `playlists.txt` and fetches each playlist's title and cover from Spotify. To pull in every public playlist on your account, run it with `--user summeranne` and your Spotify app's keys (`SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`). New ones get added to playlists.txt commented out, so you choose.
- `node tools/shoebox.mjs ~/some-folder` adds photos to the random-photo pile, with the date the camera wrote on them stamped in the corner. On a Mac it also shrinks them and handles HEIC. Captions can go in a `captions.txt` in the same folder.

## Things on the page that aren't written down anywhere

Type `astros`. Type `maude` or `otis`. Try the Konami code. Click the drummer line with the sound on.

## Where things came from

- Campaign photos for the parchment paper dress, Brynn Whitfield and Paige DeSorbo are from the brands' PR Newswire announcements. Visit Tomorrow and Streak Shop are from the old Squarespace site. Swap in your own shots whenever you have them.
- The photo booth and shoebox selfies are from "these are my favorite selfies from the last ten years," on Tumblr in 2015. The watermelon is your dad's AP photo, from Tumblr in 2014. Vic Chesnutt is from 2009.
- The Hall of Famer drawings and the other artwork are from the old Squarespace site.
- The list inside the list (the 2014 line) is "Some of the things I did in 2014," from Tumblr.
- The 22 playlists are the ones you shared on Tumblr between 2011 and 2015, with your notes from then.

HOSTING.md covers putting it online at summeranneburton.com.
