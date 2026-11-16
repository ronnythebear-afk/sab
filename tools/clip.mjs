// Makes a clean copy of an old article for the reading room: just the words and the pictures,
// no ads, with every image saved here so it can't break later.
//
//   node tools/clip.mjs --all
//     Clips every entry in site/content/content.js (under clippings) that has a slug and no
//     clean copy yet. Add the article there first, then run this.
//
//   node tools/clip.mjs <url> --slug some-name [--force]
//     Clips one article. --force makes a new copy even if there is one already.
//
// It tries the article's own page first. If that's gone or blocked, it asks the Internet
// Archive for its saved copy. Pictures that won't load from either place are left out.
// Needs Node 18 or newer. No packages to install.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'site');
const clipDir = path.join(site, 'content', 'clips');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const decode = s => String(s || '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const text = s => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Keep a few inline tags and links, drop everything else (scripts, styles, attributes).
const INLINE = new Set(['a', 'i', 'em', 'b', 'strong', 'br', 's', 'u', 'sup', 'sub', 'code', 'small']);
function clean(html, base) {
  let s = String(html || '').replace(/<(script|style|iframe|noscript|svg|form|button)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, name, attrs) => {
    name = name.toLowerCase();
    if (!INLINE.has(name)) return ' ';
    if (tag.startsWith('</')) return `</${name}>`;
    if (name === 'a') {
      const href = (attrs.match(/href\s*=\s*"([^"]*)"/i) || attrs.match(/href\s*=\s*'([^']*)'/i) || [])[1];
      let abs = '';
      try { abs = new URL(decode(href || ''), base).href; } catch (e) { abs = ''; }
      abs = abs.replace(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\//, '');
      return /^(https?:|mailto:)/.test(abs) ? `<a href="${abs.replace(/"/g, '&quot;')}">` : '<a>';
    }
    return name === 'br' ? '<br>' : `<${name}>`;
  });
  return s.replace(/\s+/g, ' ').replace(/<a>([\s\S]*?)<\/a>/g, '$1').trim();
}
const paragraphs = (html, base) => {
  const parts = String(html || '').split(/<\/p>|<p[^>]*>|<br\s*\/?>\s*<br\s*\/?>/i).map(p => clean(p, base)).filter(p => text(p));
  return parts.map(p => ({ t: 'p', html: p }));
};

async function get(url, binary) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: binary ? 'image/*,*/*' : 'text/html,application/xhtml+xml' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  if (binary) return { type: res.headers.get('content-type') || '', body: Buffer.from(await res.arrayBuffer()) };
  return { url: res.url, body: await res.text() };
}

async function wayback(url) {
  const info = await fetch('https://archive.org/wayback/available?url=' + encodeURIComponent(url)).then(r => r.json());
  const snap = info && info.archived_snapshots && info.archived_snapshots.closest;
  if (!snap || !snap.available) throw new Error('the Internet Archive has no copy');
  const raw = `https://web.archive.org/web/${snap.timestamp}id_/${url}`;
  const page = await get(raw);
  return { ...page, url, snapshot: snap.timestamp };
}

// BuzzFeed and BuzzFeed News pages carry the whole post as data. That's the cleanest way in.
function parseBuzzFeed(html, base) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  const buzz = (((JSON.parse(m[1]) || {}).props || {}).pageProps || {}).buzz;
  if (!buzz || !buzz.sub_buzzes) return null;
  const subs = buzz.sub_buzzes;
  // Longform posts keep their pictures as other sub-buzzes and mark where each goes with
  // [INSERT n] in the text. Those get placed where they're marked, and only there.
  const inserted = new Set();
  subs.forEach(sb => String(sb.description || '').replace(/\[INSERT (\d+)\]/g, (_, n) => inserted.add(+n)));
  const emit = (sb, blocks) => {
    const head = text(sb.header);
    if (head) blocks.push({ t: 'h', html: clean(sb.header, base) });
    const img = sb.images && (sb.images.original || sb.images.wide || sb.images.standard || sb.images.mobile);
    if (img && img.url) blocks.push({ t: 'img', src: img.url, w: +img.width || 0, h: +img.height || 0, alt: text(sb.alt_text), credit: text(sb.attribution), caption: text(sb.description) && !/\[INSERT/.test(sb.description) && sb.form === 'image' ? text(sb.description) : '' });
    if (sb.form === 'video' || sb.form === 'embed' || sb.form === 'tweet' || sb.form === 'instagram' || sb.form === 'youtube') {
      const link = sb.original_url || sb.url || sb.source_url || (String(sb.embed || '').match(/https?:\/\/[^"' ]+/) || [])[0];
      if (link) blocks.push({ t: 'link', url: link.replace(/&amp;/g, '&'), label: sb.form === 'tweet' ? 'A tweet' : sb.form === 'instagram' ? 'An Instagram post' : 'A video' });
    }
    if (img && img.url && sb.form === 'image') return; // its words went in the caption
    String(sb.description || '').split(/(\[INSERT \d+\])/).forEach(part => {
      const ins = part.match(/^\[INSERT (\d+)\]$/);
      if (ins) { if (subs[+ins[1]]) emit(subs[+ins[1]], blocks); }
      else blocks.push(...paragraphs(part.replace(/\[SUBBUZZ \d+\]/g, ''), base));
    });
  };
  const blocks = [];
  subs.forEach((sb, i) => { if (!inserted.has(i)) emit(sb, blocks); });
  return {
    title: text(buzz.title), dek: text(buzz.description),
    date: buzz.published ? new Date(+buzz.published * 1000).toISOString().slice(0, 10) : '',
    blocks
  };
}

// Everything else: blogs, Medium, WordPress. Take the article (or the page body), throw out
// the furniture, and keep paragraphs, headings, quotes, lists and pictures in order.
function parseGeneric(html, base) {
  const meta = name => decode((html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i')) || [])[1] || '');
  let body = (html.match(/<article[\s\S]*<\/article>/i) || html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  body = body.replace(/<(script|style|noscript|nav|footer|header|aside|form|svg|button|iframe)[\s\S]*?<\/\1>/gi, '');
  const blocks = [];
  const tagRe = /<(p|h2|h3|h4|blockquote|ul|ol|img|figcaption)\b([^>]*)>/gi;
  let m;
  while ((m = tagRe.exec(body))) {
    const name = m[1].toLowerCase(), attrs = m[2];
    if (name === 'img') {
      const src = (attrs.match(/\bsrc=["']([^"']+)["']/i) || attrs.match(/data-src=["']([^"']+)["']/i) || [])[1];
      if (!src || /^data:|pixel|spacer|gravatar|avatar|logo|\.svg/i.test(src)) continue;
      let abs; try { abs = new URL(decode(src), base).href; } catch (e) { continue; }
      blocks.push({ t: 'img', src: abs, alt: text((attrs.match(/alt=["']([^"']*)["']/i) || [])[1]) });
      continue;
    }
    const close = new RegExp(`</${name}>`, 'i');
    const rest = body.slice(tagRe.lastIndex);
    const end = rest.search(close);
    if (end < 0) continue;
    const inner = rest.slice(0, end);
    tagRe.lastIndex += end;
    if (name === 'ul' || name === 'ol') {
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(x => clean(x[1], base)).filter(x => text(x));
      if (items.length) blocks.push({ t: 'ul', items });
    } else if (name === 'figcaption') {
      const last = blocks[blocks.length - 1];
      if (last && last.t === 'img' && !last.caption) last.caption = text(inner);
    } else if (name === 'blockquote') {
      if (text(inner)) blocks.push({ t: 'quote', html: clean(inner, base) });
    } else if (name[0] === 'h') {
      if (text(inner)) blocks.push({ t: 'h', html: clean(inner, base) });
    } else {
      const c = clean(inner, base);
      if (text(c).length > 1) blocks.push({ t: 'p', html: c });
    }
  }
  // Drop the share-this, sign-up and related-posts lines that sneak in at either end.
  const junk = /^(share|tweet|sign up|subscribe|follow|related|advertisement|posted in|filed under|tags?:|comments?|leave a comment|you might also like)/i;
  const kept = blocks.filter(b => !(b.t === 'p' && (junk.test(text(b.html)) || (text(b.html).length < 30 && /<a /.test(b.html)))));
  return {
    title: text(meta('og:title')) || text((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]),
    dek: text(meta('og:description') || meta('description')),
    date: (meta('article:published_time') || (html.match(/<time[^>]+datetime=["']([^"']+)["']/i) || [])[1] || '').slice(0, 10),
    blocks: kept
  };
}

async function saveImages(slug, blocks, snapshot) {
  const dir = path.join(site, 'media', 'clips', slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  const out = [];
  for (const b of blocks) {
    if (b.t !== 'img') { out.push(b); continue; }
    const tries = [b.src, `https://web.archive.org/web/${snapshot || '2015'}im_/${b.src}`];
    let saved = '';
    for (const src of tries) {
      try {
        const img = await get(src, true);
        if (!/^image\//.test(img.type) || img.body.length < 600) continue;
        const ext = img.type.includes('png') ? 'png' : img.type.includes('gif') ? 'gif' : img.type.includes('webp') ? 'webp' : 'jpg';
        const name = String(++n).padStart(2, '0') + '.' + ext;
        fs.writeFileSync(path.join(dir, name), img.body);
        // On a Mac, shrink big photos with sips, which comes with macOS. GIFs stay as they are.
        if (process.platform === 'darwin' && ext !== 'gif') {
          try { execFileSync('sips', ['-Z', '1200', path.join(dir, name)], { stdio: 'ignore' }); } catch (e) { /* keep the original */ }
        }
        saved = `media/clips/${slug}/${name}`;
        break;
      } catch (e) { /* try the next place */ }
    }
    if (saved) out.push({ ...b, src: saved });
    else console.warn('  left out a picture that would not load:', b.src.slice(0, 90));
  }
  if (!n) fs.rmSync(dir, { recursive: true, force: true });
  return out;
}

function writeIndex() {
  const files = fs.readdirSync(clipDir).filter(f => f.endsWith('.js') && f !== 'index.js');
  const index = {};
  for (const f of files) {
    const ctx = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(clipDir, f), 'utf8'), ctx);
    const c = ctx.window.CLIP;
    if (!c) continue;
    const words = c.blocks.map(b => [b.html ? text(b.html) : '', b.caption || '', (b.items || []).map(text).join(' ')].join(' ')).join(' ').split(/\s+/).filter(Boolean).length;
    const pics = c.blocks.filter(b => b.t === 'img');
    // The first picture shows up when someone points at this clipping on the front page.
    index[c.slug] = { title: c.title, words, pics: pics.length, pic: pics.length ? pics[0].src : '' };
  }
  fs.writeFileSync(path.join(clipDir, 'index.js'), '// Made by tools/clip.mjs. Which clippings have a clean copy here.\nwindow.SAB_CLIPS = ' + JSON.stringify(index, null, 2) + ';\n');
}

async function clipOne(url, slug, extra = {}) {
  let page, source = 'original', parsed;
  try {
    // Some old sites now belong to someone else (The Hairpin's address sells casino ads).
    // Mark those archiveOnly in content.js and they go straight to the Internet Archive.
    if (extra.archiveOnly) throw new Error('marked archive only');
    page = await get(url);
    parsed = parseBuzzFeed(page.body, page.url) || parseGeneric(page.body, page.url);
    const words = parsed ? parsed.blocks.filter(b => b.t === 'p').length : 0, pics = parsed ? parsed.blocks.filter(b => b.t === 'img').length : 0;
    if (!parsed || (words < 2 && pics < 2)) throw new Error('nothing readable on the page');
  } catch (e) {
    console.log(`  the original didn't work (${e.message}), asking the Internet Archive`);
    page = await wayback(url);
    source = 'Internet Archive';
    parsed = parseBuzzFeed(page.body, page.url) || parseGeneric(page.body, page.url);
  }
  if (!parsed || !parsed.blocks.length) throw new Error('could not find the article on the page');
  const blocks = await saveImages(slug, parsed.blocks, page.snapshot);
  const clip = {
    slug, url, source, saved: new Date().toISOString().slice(0, 10),
    title: extra.title || parsed.title, dek: extra.dek || parsed.dek, outlet: extra.outlet || '', date: extra.date || parsed.date,
    blocks
  };
  fs.mkdirSync(clipDir, { recursive: true });
  fs.writeFileSync(path.join(clipDir, slug + '.js'), '// A clean copy made by tools/clip.mjs. Fix typos here if you like.\nwindow.CLIP = ' + JSON.stringify(clip, null, 1) + ';\n');
  console.log(`  saved "${clip.title}" (${blocks.length} pieces, from the ${source})`);
}

async function main() {
  const args = process.argv.slice(2);
  const flag = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : ''; };
  const force = args.includes('--force');
  const jobs = [];
  if (args.includes('--index')) { writeIndex(); console.log('Rebuilt the index.'); return; }
  if (args.includes('--all')) {
    const ctx = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(site, 'content', 'content.js'), 'utf8'), ctx);
    for (const c of ctx.window.SAB.clippings) {
      if (!c.slug || !c.url) continue;
      if (!force && fs.existsSync(path.join(clipDir, c.slug + '.js'))) continue;
      jobs.push([c.url, c.slug, c]);
    }
  } else if (args[0] && /^https?:/.test(args[0])) {
    const slug = flag('--slug') || new URL(args[0]).pathname.split('/').filter(Boolean).pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    jobs.push([args[0], slug, {}]);
  } else {
    console.log('Usage: node tools/clip.mjs --all   or   node tools/clip.mjs <url> --slug name');
    return;
  }
  let ok = 0;
  for (const [url, slug, extra] of jobs) {
    console.log(`${slug}:`);
    try { await clipOne(url, slug, extra); ok++; } catch (e) { console.log(`  couldn't make a copy: ${e.message}`); }
  }
  writeIndex();
  console.log(`Done. ${ok} of ${jobs.length} clipped.`);
}

main().catch(e => { console.error(e); process.exit(1); });
