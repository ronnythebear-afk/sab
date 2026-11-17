# summeranneburton.com

Summer's website is a printed page with cards on it: paper, ink, hairline rules and one red for the numbers. A masthead runs across the top with the date in Austin, her name is set huge across the foot of the page like a title on a poster, and the decks are listed down the right side like a contents page. A small tag by the cursor says what a click will do. Everything is a card, in four decks, newest on top:

- **Work**: the work, Praytell and before
- **Words**: articles she wrote, posts from X, thoughts
- **Baseball drawings**: Every Hall of Famer
- **And more**: pictures, links she's sharing, Instagram posts, anything else

Coverage of her (`press` in content.js) is listed at the end of the CV.

Tap a deck to deal its next card. Drag a card to move it, flick it and it slides. Tap a card to open it, with arrows through the rest of its deck. When the page opens, the newest card from each deck is dealt, so the table starts with what's new.

**Pull a reading** clears the table and lays out five cards face down in a cross, like a tarot reading: Work in the middle, a baseball drawing above, words and an And more card either side, and any deck below. Tap a card to turn it over, tap it again to open it.

**Radio** plays a Spotify playlist on shuffle: a random track, then another when that one ends, with a Shuffle button to skip and a link out to the playlist. Visitors logged in to Spotify hear whole songs; everyone else hears Spotify's previews. If Spotify's player script can't load (some previews block it), the radio falls back to a plain Spotify embed of a random track, and Shuffle swaps in another.

At the top: her picture (tap it and the photo booth takes another), name, Radio, CV and Email.

Nothing on the site is written for her. Text is a plain fact (a name, a client, a year), her own words, or a quote from coverage with who said it.

There's no build step. The site is the `site/` folder, as is. HOSTING.md covers putting it online.

## Adding things

Everything can be done on github.com, in the browser or the GitHub app.

- **Links and words.** Open `drop.txt`, click the pencil, paste things in with a blank line between them, and Commit changes.
  - A link to a post on X becomes a Words card with the post's words and date.
  - A link to an Instagram post becomes an And more card that opens it. For the picture itself, drop the picture in the drop folder.
  - A link to an article you wrote becomes a Words card, with a clean copy to read on the site (words and pictures, no ads).
  - A link to anything else becomes a Shared card on And more, with the page's title and picture.
  - Words with no link become a thought on Words.
  - A Spotify playlist link switches what Radio plays.
  - Words next to a link go on the card with it.
- **Pictures.** Open the `drop` folder, then Add file, then Upload files. Drag them in and Commit changes. Name a file what you want its caption to say ("my tiny christmas tree.jpg"), or leave the camera's name for no caption. The date comes from the picture. They land on And more.

A couple of minutes after you commit, GitHub turns them into cards by itself (`.github/workflows/add.yml`), empties drop.txt and the drop folder, and the site updates.

To take something out, delete its line from `site/content/feed.js`. Work, the CV and the drawings are in `site/content/content.js`. The radio's playlist and track list are in `site/content/radio.js`; `node tools/radio.mjs` refreshes the track list after you change the playlist on Spotify.

`available` in content.js is for when you want to say you're open to work, in your own words ("Taking freelance projects for spring"). It shows next to Email. Empty, it doesn't show.

## On your own computer

```
npx serve site
```

To turn drop.txt and the drop folder into cards without GitHub (needs Node 18+ and Python 3 with `pip install pillow pillow-heif`):

```
node tools/drop.mjs
python3 tools/pics.py
```

`tools/clip.mjs` makes the clean copies of articles. `tools/faces.py` makes the photo booth pictures from a folder of selfies (`python3 tools/faces.py path/to/folder`).

## Where things came from

- The photo booth selfies and the first pictures on the And more deck are from Summer's Tumblr, 2009 to 2015, with her captions from then.
- Campaign photos for the parchment paper dress, Brynn Whitfield and Paige DeSorbo are from the brands' PR Newswire announcements. Visit Tomorrow and the BuzzFeed photos are from the old Squarespace site. The Whine About It still is the episode's YouTube thumbnail.
- The Hall of Famer drawings are from the old Squarespace site.
- Posts from X come through X's own embed service. Instagram doesn't offer one without an account key, so Instagram cards open the post, and pictures come from the drop folder.
- The radio uses Spotify's embed player.
- Anything cut from earlier versions of the site is in this repository's history.
