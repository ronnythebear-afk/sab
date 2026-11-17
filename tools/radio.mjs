// The radio: the Spotify playlist the Radio button shuffles through.
//
//   node tools/radio.mjs                      refreshes the track list of the playlist there now
//   node tools/radio.mjs <playlist link>      switches the radio to another playlist
//
// It reads the playlist's public Spotify embed page for its tracks and writes
// site/content/radio.js. Pasting a playlist link into drop.txt does the same thing, and
// GitHub refreshes the track list once a week. Needs Node 18 or newer, nothing to install.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'site', 'content', 'radio.js');
const idOf = s => (String(s).match(/playlist[/:]([A-Za-z0-9]{22})/) || [])[1];

function current() {
  if (!fs.existsSync(out)) return '';
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(out, 'utf8'), ctx);
  return (ctx.window.SAB_RADIO || {}).playlist || '';
}

export async function radio(link) {
  const id = idOf(link) || current();
  if (!id) throw new Error('no playlist to read');
  const r = await fetch(`https://open.spotify.com/embed/playlist/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`Spotify answered ${r.status}`);
  const html = await r.text();
  const tracks = [...new Set((html.match(/spotify:track:[A-Za-z0-9]{22}/g) || []).map(t => t.slice(14)))];
  let title = '';
  try { title = (await (await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(`https://open.spotify.com/playlist/${id}`))).json()).title || ''; } catch (e) { /* fine without */ }
  fs.writeFileSync(out, '// Made by tools/radio.mjs. The playlist the Radio button shuffles through.\nwindow.SAB_RADIO = ' +
    JSON.stringify({ playlist: id, title, url: `https://open.spotify.com/playlist/${id}`, tracks }, null, 1) + ';\n');
  console.log(`radio: ${title || id}, ${tracks.length} tracks`);
  return { id, title, tracks };
}

if (process.argv[1] && import.meta.url === new URL('file://' + path.resolve(process.argv[1])).href) {
  radio(process.argv[2] || '').catch(e => { console.error(`couldn't update the radio: ${e.message}`); process.exit(1); });
}
