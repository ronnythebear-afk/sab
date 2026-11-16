// Fills the record crate.
//
//   node tools/playlists.mjs
//     Reads playlists.txt, asks Spotify for each playlist's title and cover (no key needed),
//     saves the covers in site/media/crate/ and writes site/content/playlists.js.
//
//   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node tools/playlists.mjs --user summeranne
//     Also lists every public playlist on that Spotify account and adds any that aren't in
//     playlists.txt yet to the bottom of it, commented out, so you can pick which ones go in.
//     The keys come from an app at developer.spotify.com (the one Scotland uses works).
//
// Needs Node 18 or newer. No packages to install.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const listFile = path.join(root, 'playlists.txt');
const coverDir = path.join(root, 'site', 'media', 'crate');
const outFile = path.join(root, 'site', 'content', 'playlists.js');
const idOf = s => (String(s).match(/playlist[/:]([A-Za-z0-9]{22})/) || [])[1];

async function listAccount(user) {
  const id = process.env.SPOTIFY_CLIENT_ID, secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('--user needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET');
  const tok = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64') },
    body: 'grant_type=client_credentials'
  }).then(r => r.json());
  if (!tok.access_token) throw new Error('Spotify said no: ' + JSON.stringify(tok));
  const found = [];
  let url = `https://api.spotify.com/v1/users/${encodeURIComponent(user)}/playlists?limit=50`;
  while (url) {
    const page = await fetch(url, { headers: { Authorization: 'Bearer ' + tok.access_token } }).then(r => r.json());
    if (page.error) throw new Error('Spotify said no: ' + page.error.message);
    page.items.filter(p => p && p.owner && p.owner.id === user).forEach(p => found.push(p));
    url = page.next;
  }
  const have = new Set(fs.readFileSync(listFile, 'utf8').split('\n').map(idOf).filter(Boolean));
  const fresh = found.filter(p => !have.has(p.id));
  if (fresh.length) {
    fs.appendFileSync(listFile, `\n# Found on Spotify ${new Date().toISOString().slice(0, 10)}. Take the # off any you want in the crate.\n` +
      fresh.map(p => `# https://open.spotify.com/playlist/${p.id} |  | ${p.name.replace(/\|/g, '/')}`).join('\n') + '\n');
  }
  console.log(`${found.length} public playlists on ${user}, ${fresh.length} new ones added to playlists.txt (commented out).`);
}

async function main() {
  const u = process.argv.indexOf('--user');
  if (u > 0) await listAccount(process.argv[u + 1]);

  const lines = fs.readFileSync(listFile, 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  fs.mkdirSync(coverDir, { recursive: true });
  const out = [];
  for (const line of lines) {
    const [link, year = '', ...rest] = line.split('|').map(s => s.trim());
    const id = idOf(link);
    if (!id) { console.warn('Skipping, no playlist id in:', line); continue; }
    const url = `https://open.spotify.com/playlist/${id}`;
    const res = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
    if (!res.ok) { console.warn(`Skipping ${id}: Spotify answered ${res.status}. Is it public?`); continue; }
    const meta = await res.json();
    let cover = '';
    if (meta.thumbnail_url) {
      // Ask for the bigger version of the same picture when Spotify has one.
      const big = meta.thumbnail_url.replace('mosaic.scdn.co/300/', 'mosaic.scdn.co/640/').replace('ab67706c0000da84', 'ab67706c0000bebb');
      for (const src of [big, meta.thumbnail_url]) {
        const img = await fetch(src);
        if (img.ok) {
          fs.writeFileSync(path.join(coverDir, id + '.jpg'), Buffer.from(await img.arrayBuffer()));
          cover = `media/crate/${id}.jpg`;
          break;
        }
      }
    }
    out.push({ id, url, title: meta.title || 'Untitled', year, note: rest.join('|').trim(), cover });
    console.log('ok', meta.title);
  }
  fs.writeFileSync(outFile, '// Made by tools/playlists.mjs from playlists.txt. Edit that file, not this one.\n' +
    'window.SAB_PLAYLISTS = ' + JSON.stringify(out, null, 2) + ';\n');
  console.log(`Wrote ${out.length} playlists to site/content/playlists.js`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
