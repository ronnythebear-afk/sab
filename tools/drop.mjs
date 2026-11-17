// Turns what's in drop.txt into cards on the site.
//
//   node tools/drop.mjs
//
// drop.txt holds anything, with a blank line between things:
//   a link to a post on X          becomes a Posts card with the post's words and date
//   a link to an Instagram post    becomes a Posts card that opens the post
//   a Spotify playlist link        becomes a Music card with its cover
//   a link to an article            becomes a Words card. If Summer wrote it, the site keeps
//                                   a clean copy to read here; if not, it's a Shared card.
//   any other link                 becomes a Shared card with the page's title and picture
//   just words, no link            becomes a thought on the Posts deck
// Words written next to a link go on the card with it.
//
// Each thing is added to the top of site/content/feed.js and taken out of drop.txt. Pictures
// go in the drop folder instead (tools/pics.py). Needs Node 18 or newer, nothing to install.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { clipOne, outletOf, slugOf, decode, text } from './clip.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dropFile = path.join(root, 'drop.txt');
const feedFile = path.join(root, 'site', 'content', 'feed.js');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const URL_RE = /https?:\/\/[^\s<>"')]+/g;

export function readFeed() {
  if (!fs.existsSync(feedFile)) return [];
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(feedFile, 'utf8'), ctx);
  return ctx.window.SAB_FEED || [];
}
export function writeFeed(items) {
  const key = d => String(d || '').padEnd(10, '-');
  items.sort((a, b) => key(b.date).localeCompare(key(a.date)));
  fs.writeFileSync(feedFile, '// Made by tools/drop.mjs and tools/pics.py, newest first. One thing per line. Delete a line to take it out.\nwindow.SAB_FEED = [\n' + items.map(f => ' ' + JSON.stringify(f)).join(',\n') + '\n];\n');
}

async function getText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/json' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} from ${new URL(url).host}`);
  return { url: r.url, body: await r.text() };
}
async function saveImage(src, dir, name) {
  try {
    const r = await fetch(src, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    const type = r.headers.get('content-type') || '';
    if (!r.ok || !/^image\//.test(type)) return '';
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 3000) return '';
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('gif') ? 'gif' : 'jpg';
    fs.mkdirSync(path.join(root, 'site', 'media', dir), { recursive: true });
    fs.writeFileSync(path.join(root, 'site', 'media', dir, `${name}.${ext}`), buf);
    return `media/${dir}/${name}.${ext}`;
  } catch (e) { return ''; }
}
const meta = (html, name) => decode((html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i')) ||
  html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i')) || [])[1] || '');

// A post on X, through X's own embed service: the words and the date.
async function xPost(url, note) {
  const j = JSON.parse((await getText('https://publish.twitter.com/oembed?omit_script=1&url=' + encodeURIComponent(url))).body);
  const words = text((j.html.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '').replace(/\s*pic\.twitter\.com\/\S+/g, '').trim();
  const d = new Date(text((j.html.match(/<a[^>]*>([^<]*\d{4})<\/a>\s*<\/blockquote>/) || [])[1] || ''));
  return { id: 'x-' + hash(url), type: 'post', source: 'X', date: isNaN(d) ? today() : d.toISOString().slice(0, 10), text: words + (note ? `\n\n${note}` : ''), url: j.url || url };
}
async function playlist(url, note) {
  const id = (url.match(/playlist\/([A-Za-z0-9]{22})/) || [])[1];
  const j = JSON.parse((await getText('https://open.spotify.com/oembed?url=' + encodeURIComponent(`https://open.spotify.com/playlist/${id}`))).body);
  const img = j.thumbnail_url ? await saveImage(j.thumbnail_url, 'crate', id) : '';
  return { id: 'p-' + id, type: 'playlist', date: today(), title: j.title || 'Playlist', text: note, url: `https://open.spotify.com/playlist/${id}`, spotify: id, img };
}
// Any other page: an article by Summer gets a clean copy; anything else is shared.
async function page(url, note) {
  let html = '', final = url;
  try { ({ body: html, url: final } = await getText(url)); } catch (e) { /* still worth a card */ }
  const author = [meta(html, 'author'), meta(html, 'article:author'), meta(html, 'parsely-author'), (html.match(/"author"\s*:\s*(\{[^}]*\}|\[[^\]]*\]|"[^"]*")/) || [])[1] || ''].join(' ');
  const hers = /summer\s*anne\s*burton|summeranne/i.test(author) || /\/summeranne(\/|$)/i.test(new URL(url).pathname);
  if (hers) {
    try {
      const slug = slugOf(url);
      const clip = await clipOne(url, slug, {});
      return { id: 'a-' + slug, type: 'article', date: clip.date || today(), title: clip.title, outlet: clip.outlet || outletOf(url), url, slug, ...(clip.dek ? { dek: clip.dek } : {}), ...(note ? { text: note } : {}) };
    } catch (e) { console.log(`  couldn't copy it (${e.message}), adding it as a link to the original`); }
  }
  const host = new URL(final || url).hostname.replace(/^www\./, '');
  const title = meta(html, 'og:title') || text((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '') || host + new URL(url).pathname;
  const ogImg = meta(html, 'og:image');
  const img = ogImg ? await saveImage(new URL(ogImg, final || url).href, 'links', hash(url)) : '';
  if (hers) return { id: 'a-' + slugOf(url), type: 'article', date: (meta(html, 'article:published_time') || today()).slice(0, 10), title, outlet: meta(html, 'og:site_name') || outletOf(url), url, ...(note ? { text: note } : {}) };
  return { id: 'l-' + hash(url), type: 'link', date: today(), title, site: meta(html, 'og:site_name') || host, url, ...(img ? { img } : {}), ...(note ? { text: note } : {}) };
}

async function card(block) {
  const urls = block.match(URL_RE) || [];
  const note = block.replace(URL_RE, '').replace(/[ \t]+\n/g, '\n').trim();
  if (!urls.length) return { id: 't-' + hash(note), type: 'thought', date: today(), text: note };
  const url = urls[0].replace(/[.,;]+$/, '');
  const host = new URL(url).hostname.replace(/^(www|mobile)\./, '');
  if (/^(x|twitter)\.com$/.test(host) && /\/status\/\d+/.test(url)) return xPost(url, note);
  if (/instagram\.com$/.test(host)) return { id: 'g-' + hash(url), type: 'post', source: 'Instagram', date: today(), text: note, url };
  if (host === 'open.spotify.com' && /\/playlist\//.test(url)) return playlist(url, note);
  return page(url, note);
}

async function main() {
  if (!fs.existsSync(dropFile)) return console.log('No drop.txt.');
  const lines = fs.readFileSync(dropFile, 'utf8').split('\n');
  // the instructions at the top stay; everything under them is new
  const headEnd = lines.findIndex(l => l.trim() && !l.startsWith('#'));
  const head = headEnd < 0 ? lines : lines.slice(0, headEnd);
  const body = headEnd < 0 ? '' : lines.slice(headEnd).filter(l => !l.startsWith('#')).join('\n');
  const blocks = body.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  if (!blocks.length) return console.log('Nothing new in drop.txt.');
  const feed = readFeed();
  const seen = new Set(feed.map(f => f.url || f.text));
  let added = 0;
  const kept = [];
  for (const b of blocks) {
    try {
      const c = await card(b);
      if (seen.has(c.url || c.text)) { console.log('already on the site:', (c.url || c.text).slice(0, 70)); continue; }
      feed.push(c); seen.add(c.url || c.text); added++;
      console.log(`added a ${c.type}:`, (c.title || c.text || c.url).slice(0, 70));
    } catch (e) {
      console.log(`couldn't add this one (${e.message}), leaving it in drop.txt:`, b.slice(0, 70));
      kept.push(b);
    }
  }
  writeFeed(feed);
  fs.writeFileSync(dropFile, head.join('\n').replace(/\n*$/, '\n\n') + (kept.length ? kept.join('\n\n') + '\n' : ''));
  console.log(`${added} added.`);
}

if (process.argv[1] && import.meta.url === new URL('file://' + path.resolve(process.argv[1])).href) main().catch(e => { console.error(e); process.exit(1); });
