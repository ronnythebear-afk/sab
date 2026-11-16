// Fills the shoebox ("a random photo from my early aughts hard drive").
//
//   node tools/shoebox.mjs ~/Pictures/old-hard-drive-picks
//
// Put the photos you want on the site in one folder (copies, not your only ones) and point
// this at it. For each photo it reads the date the camera wrote into it, makes a smaller copy
// in site/media/shoebox/, and adds it to site/content/shoebox.js with that date stamped on it.
// Photos already in the shoebox are skipped, so you can run it again whenever you add more.
//
// Captions are optional. Make a file called captions.txt in the same folder with lines like
//   IMG_0042.JPG | Barton Springs, the summer I turned 21
//
// On a Mac it uses sips (built in) to shrink photos and to turn HEIC into JPEG. Anywhere else
// it copies JPEGs and PNGs as they are. Needs Node 18 or newer. No packages to install.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'site', 'media', 'shoebox');
const listFile = path.join(root, 'site', 'content', 'shoebox.js');
const mac = process.platform === 'darwin';

// Reads DateTimeOriginal (or DateTime) out of a JPEG's EXIF block. Returns 'YYYY-MM-DD' or ''.
function exifDate(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return '';
  let i = 2;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xff) return '';
    const marker = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (marker === 0xe1 && buf.toString('latin1', i + 4, i + 8) === 'Exif') {
      const t = i + 10, le = buf.toString('latin1', t, t + 2) === 'II';
      const u16 = o => le ? buf.readUInt16LE(o) : buf.readUInt16BE(o);
      const u32 = o => le ? buf.readUInt32LE(o) : buf.readUInt32BE(o);
      const readIfd = (off, want) => {
        const n = u16(t + off), found = {};
        for (let k = 0; k < n; k++) {
          const e = t + off + 2 + k * 12, tag = u16(e);
          if (want.includes(tag)) found[tag] = tag === 0x8769 ? u32(e + 8) : buf.toString('latin1', t + u32(e + 8), t + u32(e + 8) + 19);
        }
        return found;
      };
      try {
        const ifd0 = readIfd(u32(t + 4), [0x0132, 0x8769]);
        const exif = ifd0[0x8769] ? readIfd(ifd0[0x8769], [0x9003]) : {};
        const raw = exif[0x9003] || ifd0[0x0132] || '';
        const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})/);
        return m && m[1] !== '0000' ? `${m[1]}-${m[2]}-${m[3]}` : '';
      } catch (e) { return ''; }
    }
    i += 2 + len;
  }
  return '';
}
const stampOf = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `'${y.slice(2)} ${+m} ${+dd}`; };

function main() {
  const src = process.argv[2];
  if (!src || !fs.existsSync(src)) { console.log('Usage: node tools/shoebox.mjs <folder of photos>'); return; }
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(listFile, 'utf8'), ctx);
  const box = ctx.window.SAB_SHOEBOX || [];
  const have = new Set(box.map(p => p.from).filter(Boolean));
  const captions = {};
  const capFile = path.join(src, 'captions.txt');
  if (fs.existsSync(capFile)) fs.readFileSync(capFile, 'utf8').split('\n').forEach(l => { const [f, ...c] = l.split('|'); if (f && c.length) captions[f.trim()] = c.join('|').trim(); });
  fs.mkdirSync(outDir, { recursive: true });
  let added = 0;
  for (const f of fs.readdirSync(src).sort()) {
    if (!/\.(jpe?g|png|heic|heif)$/i.test(f) || have.has(f)) continue;
    const from = path.join(src, f);
    const isHeic = /\.(heic|heif)$/i.test(f);
    if (isHeic && !mac) { console.warn('Skipping', f, '(HEIC needs a Mac, or save it as JPEG first)'); continue; }
    let date = /\.jpe?g$/i.test(f) ? exifDate(fs.readFileSync(from)) : '';
    if (!date && mac) {
      try { const out = execFileSync('mdls', ['-raw', '-name', 'kMDItemContentCreationDate', from]).toString(); const m = out.match(/^(\d{4}-\d{2}-\d{2})/); if (m) date = m[1]; } catch (e) { /* no date then */ }
    }
    const base = (date || 'undated') + '-' + f.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const ext = /\.png$/i.test(f) ? 'png' : 'jpg';
    const dest = path.join(outDir, base + '.' + ext);
    if (mac) execFileSync('sips', ['-s', 'format', ext === 'png' ? 'png' : 'jpeg', '-Z', '1200', from, '--out', dest], { stdio: 'ignore' });
    else fs.copyFileSync(from, dest);
    box.push({ src: `media/shoebox/${base}.${ext}`, stamp: stampOf(date), caption: captions[f] || '', from: f });
    added++;
    console.log('added', f, date || '(no date)');
  }
  fs.writeFileSync(listFile, '// The shoebox: "a random photo from my early aughts hard drive."\n' +
    '// tools/shoebox.mjs adds to this list from a folder of photos. You can also edit it by hand.\n' +
    '// stamp is what the orange date in the corner says. caption is optional.\n' +
    'window.SAB_SHOEBOX = ' + JSON.stringify(box, null, 2) + ';\n');
  console.log(`${added} new, ${box.length} in the shoebox.`);
}

main();
