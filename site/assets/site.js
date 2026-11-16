/*
  The front page is a photo booth: move across the page and it flips through Summer's
  selfies, in hair-color order, and the page takes on each one's color. Click to take a
  picture; four pictures print a strip you can keep. The four small frames are the way in
  to everything else, and pointing at one runs its pictures through the booth instead.
*/
(function () {
  const S = window.SAB;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const FACES = window.SAB_FACES || [], PLAYLISTS = window.SAB_PLAYLISTS || [], CLIPS = window.SAB_CLIPS || {};
  const root = document.documentElement;

  // Black or white type, whichever reads better on a color.
  const ink = hex => { const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#141213' : '#ffffff'; };
  const paint = hex => { root.style.setProperty('--bg', hex); root.style.setProperty('--fg', ink(hex)); $('meta[name="theme-color"]').content = hex; };

  /* ------------------------------------------------------------------ reels */
  // What each small frame on the front page holds, and where it goes.
  const REELS = [
    { id: 'work', label: 'Work', fit: 'cover', pics: S.work.flatMap(w => (w.images || []).slice(0, 1).map(i => i.src)) },
    { id: 'drawings', label: 'Drawings', fit: 'contain', pics: S.hof.drawings.map(d => `media/hof/${d[0]}.jpg`) },
    { id: 'clippings', label: 'Writing', fit: 'cover', pics: Object.values(CLIPS).map(c => c.pic).filter(Boolean) },
    { id: 'playlists', label: 'Playlists', fit: 'cover', pics: PLAYLISTS.map(p => p.cover) }
  ];
  const faceReel = { id: 'faces', fit: 'cover', pics: FACES.map(f => f.src) };

  /* ------------------------------------------------------------------ the booth */
  const frame = $('#frame'), stage = $('#stage');
  let reel = faceReel, at = Math.floor(FACES.length * .55), lastMove = 0;
  const preload = srcs => srcs.forEach(s => { const i = new Image(); i.src = s; });
  preload(faceReel.pics);
  setTimeout(() => REELS.forEach(r => preload(r.pics.slice(0, 12))), 1500);

  function show(i) {
    if (!reel.pics.length) return;
    at = (i + reel.pics.length) % reel.pics.length;
    frame.src = reel.pics[at];
    frame.style.objectFit = reel.fit;
    stage.classList.toggle('paper', reel.fit === 'contain');
    if (reel === faceReel && FACES[at]) paint(FACES[at].color);
    $('#count').textContent = `${String(at + 1).padStart(2, '0')}/${String(reel.pics.length).padStart(2, '0')}`;
  }

  // Moving across the page flips through the reel, left to right.
  const home = $('#home');
  home.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    lastMove = Date.now();
    const i = Math.min(reel.pics.length - 1, Math.floor(e.clientX / innerWidth * reel.pics.length));
    if (i !== at) show(i);
  });
  // On a phone, drag sideways across the photo.
  let dragX = null, dragAt = 0, dragged = false;
  stage.addEventListener('pointerdown', e => { dragged = false; if (e.pointerType === 'touch') { dragX = e.clientX; dragAt = at; lastMove = Date.now(); } });
  stage.addEventListener('pointermove', e => {
    if (dragX === null) return;
    lastMove = Date.now();
    const step = Math.round((e.clientX - dragX) / 22);
    if (step) dragged = true;
    if (dragAt + step !== at) show(dragAt + step);
  });
  ['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, () => { dragX = null; }));
  document.addEventListener('keydown', e => {
    if (!home.offsetParent) return;
    if (e.key === 'ArrowRight') { lastMove = Date.now(); show(at + 1); }
    if (e.key === 'ArrowLeft') { lastMove = Date.now(); show(at - 1); }
  });
  // Left alone, the booth keeps going on its own.
  if (!reduced) setInterval(() => { if (home.offsetParent && Date.now() - lastMove > 2200) show(at + 1); }, 650);

  /* taking pictures */
  const SHOTS = 4;
  let shots = [];
  const flash = () => { if (reduced) return; const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };
  const dots = () => { $('#shots').innerHTML = Array.from({ length: SHOTS }, (_, k) => `<i class="${k < shots.length ? 'on' : ''}"></i>`).join(''); };
  stage.addEventListener('click', () => {
    if (reel !== faceReel) { location.hash = reel.id; return; }
    if (dragged) return;
    flash();
    shots.push(FACES[at]);
    dots();
    if (shots.length === SHOTS) setTimeout(printStrip, 450);
  });

  function printStrip() {
    const strip = $('#strip');
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    strip.innerHTML = `<div class="paper">${shots.map(s => `<img src="${esc(s.src)}" alt="">`).join('')}<span class="strip-date">${esc(date)}</span></div>
      <div class="strip-tools"><button class="tool" id="save">Save</button><button class="tool" id="again">Again</button></div>`;
    strip.hidden = false;
    requestAnimationFrame(() => strip.classList.add('out'));
    $('#save').addEventListener('click', saveStrip);
    $('#again').addEventListener('click', () => { strip.classList.remove('out'); setTimeout(() => { strip.hidden = true; }, 400); shots = []; dots(); });
  }

  // The strip as a picture: four frames down a white strip, like the real thing.
  function saveStrip() {
    const W = 600, pad = 30, side = W - pad * 2, H = pad + SHOTS * (side + pad) + 40;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#fbf8f1'; x.fillRect(0, 0, W, H);
    let left = SHOTS;
    shots.forEach((s, k) => {
      const img = new Image();
      img.onload = () => {
        x.drawImage(img, pad, pad + k * (side + pad), side, side);
        if (--left === 0) {
          x.fillStyle = '#4a4245'; x.font = '700 18px "Space Mono", monospace'; x.textAlign = 'center';
          x.fillText($('.strip-date').textContent, W / 2, H - 26);
          const a = document.createElement('a');
          a.download = 'summer-anne-burton-photo-booth.png';
          a.href = c.toDataURL('image/png');
          a.click();
        }
      };
      img.src = s.src;
    });
  }

  /* ------------------------------------------------------------------ the side */
  function side() {
    $('#nm').innerHTML = S.name.split(' ').map(w => `<span>${esc(w)}</span>`).join('');
    $('#role').textContent = `${S.role} · ${S.city}`;
    // Each small frame keeps flipping through its own pictures, out of step with the others.
    $('#reels').innerHTML = REELS.map((r, k) => `<a class="reel" href="#${r.id}" data-k="${k}"><span class="reel-pic ${r.fit}"><img src="${esc(r.pics[0] || '')}" alt=""></span><span class="reel-label">${esc(r.label)}</span></a>`).join('');
    $$('.reel').forEach(a => {
      const r = REELS[+a.dataset.k];
      const order = shuffle(r.pics);
      let i = 0;
      const img = $('img', a);
      setTimeout(() => setInterval(() => { if (home.offsetParent && !reduced) { i = (i + 1) % order.length; img.src = order[i]; } }, 1700), +a.dataset.k * 420);
      a.addEventListener('mouseenter', () => { reel = r; show(Math.floor(Math.random() * r.pics.length)); });
      a.addEventListener('mouseleave', () => { reel = faceReel; show(Math.floor(FACES.length / 2)); });
    });
    $('#contact').innerHTML = [`<a href="mailto:${esc(S.email)}">Email</a>`, '<a href="#cv">CV</a>', ...S.links.filter(l => /LinkedIn|Instagram/.test(l.label)).map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)].join('');
  }

  /* ------------------------------------------------------------------ rooms */
  const rooms = $$('.room');
  const bar = document.createElement('header');
  bar.className = 'bar';
  bar.innerHTML = `<a class="bar-home" href="#">${esc(S.name)}</a><nav>${REELS.map(r => `<a href="#${r.id}" data-r="${r.id}">${esc(r.label)}</a>`).join('')}<a href="#cv" data-r="cv">CV</a></nav><a class="bar-mail" href="mailto:${esc(S.email)}">Email</a>`;
  $('#rooms').before(bar);
  rooms.forEach(r => { r.hidden = true; });

  let sheetReturn = '';
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('w/')) {
      sheetReturn = document.body.classList.contains('in-room') ? '#' + rooms.find(r => !r.hidden).id : '#work';
      if (!document.body.classList.contains('in-room')) enter('work');
      openWork(h.slice(2));
      return;
    }
    if ($('#sheet').open) $('#sheet').close();
    const room = rooms.find(r => r.id === h);
    if (room) enter(room.id);
    else {
      document.body.classList.remove('in-room');
      rooms.forEach(r => { r.hidden = true; });
      document.title = S.name;
      reel = faceReel; show(at);
    }
  }
  function enter(id) {
    document.body.classList.add('in-room');
    rooms.forEach(r => { r.hidden = r.id !== id; });
    $$('.bar nav a').forEach(a => a.classList.toggle('on', a.dataset.r === id));
    const r = document.getElementById(id);
    document.title = `${r.dataset.name} · ${S.name}`;
    window.scrollTo(0, 0);
    r.classList.remove('arrive'); void r.offsetWidth; r.classList.add('arrive');
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('in-room') && !$('dialog[open]')) location.hash = ''; });

  /* ------------------------------------------------------------------ work */
  function work() {
    const card = w => {
      const img = (w.images || [])[0];
      return `<a class="wcard" href="#w/${esc(w.id)}">${img ? `<span class="wpic"><img src="${esc(img.src)}" alt="" loading="lazy"></span>` : `<span class="wpic type"><span>${esc(w.title)}</span></span>`}
        <span class="wtitle">${esc(w.title)}</span><span class="wmeta">${esc(w.client)} · ${esc(w.year)}</span></a>`;
    };
    $('#work-box').innerHTML = [['lately', 'Lately'], ['before', 'Before']].map(([era, label]) =>
      `<h2 class="era">${label}</h2><div class="wgrid">${S.work.filter(w => w.era === era).map(card).join('')}</div>`).join('') +
      `<p class="clients"><b>Clients</b> ${S.clients.map(esc).join(' · ')}</p>`;
  }
  function openWork(id) {
    const i = S.work.findIndex(w => w.id === id), t = S.work[i];
    if (!t) return;
    const prev = S.work[i - 1], next = S.work[i + 1], dlg = $('#sheet');
    const pics = (t.images || []).map(im => `<figure><img src="${esc(im.src)}" alt="${esc(im.alt || '')}">${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ''}</figure>`).join('');
    dlg.innerHTML = `<div class="sheet">
      <button class="close" aria-label="Close">×</button>
      <div class="sheet-in ${pics ? '' : 'no-pics'}">
        <div class="sheet-text">
          <p class="sheet-meta">${esc(t.client)} · ${esc(t.year)}</p>
          <h2>${esc(t.title)}</h2>
          ${(t.words || []).map(p => `<p class="words">${esc(p)}</p>`).join('')}${t.wordsFrom ? `<p class="from">${esc(t.wordsFrom)}</p>` : ''}
          ${(t.quotes || []).map(q => `<blockquote><p>“${esc(q.text)}”</p><cite>${esc(q.who)}</cite></blockquote>`).join('')}
          ${(t.links || []).length ? `<p class="sheet-links">${t.links.map(l => `<a href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`).join('')}</p>` : ''}
        </div>
        ${pics ? `<div class="sheet-pics">${pics}</div>` : ''}
      </div>
      <nav class="sheet-nav">${prev ? `<a href="#w/${esc(prev.id)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="#w/${esc(next.id)}">${esc(next.title)} →</a>` : '<span></span>'}</nav>
    </div>`;
    $('.close', dlg).addEventListener('click', () => dlg.close());
    if (!dlg.open) dlg.showModal();
    $('.sheet', dlg).scrollTop = 0;
  }
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  $('#sheet').addEventListener('close', () => { if (location.hash.startsWith('#w/')) history.replaceState(null, '', sheetReturn); });

  /* ------------------------------------------------------------------ drawings */
  function lightbox(src, caption, alt) {
    const d = $('#lightbox');
    d.innerHTML = `<div class="lb"><button class="close" aria-label="Close">×</button><img src="${esc(src)}" alt="${esc(alt || caption)}"><p>${esc(caption)}</p></div>`;
    $('.close', d).addEventListener('click', () => d.close());
    d.showModal();
  }
  function drawings() {
    const H = S.hof;
    $('#hof-intro').innerHTML = `${esc(H.intro)} <a href="${esc(H.url)}" target="_blank" rel="noopener">everyhalloffamer.com</a>`;
    const tile = (src, cap, alt) => `<figure class="tile"><button aria-label="${esc(cap)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></button><figcaption>${esc(cap)}</figcaption></figure>`;
    $('#hof').innerHTML = H.drawings.map(([id, nm, yr]) => tile(`media/hof/${id}.jpg`, `${nm}, ${yr}`, `Summer’s drawing of ${nm}`)).join('');
    $('#sketchbook').innerHTML = H.sketchbook.map(([src, cap]) => tile(src, cap, cap)).join('');
    $$('.wall .tile button').forEach(b => b.addEventListener('click', () => { const img = $('img', b); lightbox(img.src, b.getAttribute('aria-label'), img.alt); }));
  }

  /* ------------------------------------------------------------------ writing */
  function clippings() {
    const outlets = ['All', ...new Set(S.clippings.map(c => c.outlet))];
    const kinds = { Essay: 'var(--pink)', Opinion: 'var(--orange)', List: 'var(--blue)', Animals: 'var(--pink)', Baseball: 'var(--blue)', Music: 'var(--orange)', AI: 'var(--blue)' };
    let filter = 'All';
    const draw = () => {
      $('#clip-filters').innerHTML = outlets.map(o => `<button class="chip" aria-pressed="${o === filter}">${esc(o)}</button>`).join('<span class="slash" aria-hidden="true">/</span>');
      $$('#clip-filters .chip').forEach(b => b.addEventListener('click', () => { filter = b.textContent; draw(); }));
      $('#clips').innerHTML = S.clippings.filter(c => filter === 'All' || c.outlet === filter).map((c, n) => {
        const here = CLIPS[c.slug];
        const href = here ? `read.html?c=${encodeURIComponent(c.slug)}` : (c.archiveOnly ? `https://web.archive.org/web/2014/${c.url}` : c.url);
        return `<a class="clip ${here ? 'is-here' : ''}" href="${esc(href)}" ${here ? '' : 'target="_blank" rel="noopener"'} style="--k:${kinds[c.kind] || 'var(--pink)'};--tilt:${[-1.2, .8, -.4, 1.1, -.9, .5][n % 6]}deg">
          <span class="clip-mast"><span>${esc(c.outlet)}</span><span>${esc((c.date || '').slice(0, 4))}</span></span>
          <span class="clip-h">${esc(c.title)}</span>
          <span class="clip-foot"><span class="clip-kind">${esc(c.kind)}</span><span>${here ? 'read →' : 'original ↗'}</span></span></a>`;
      }).join('');
    };
    draw();
    $('#press').innerHTML = S.press.map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener"><b>${esc(p.outlet)}, ${esc(p.year)}</b><span>${esc(p.title)}</span></a></li>`).join('');
  }

  /* ------------------------------------------------------------------ playlists */
  function playlists() {
    if (!PLAYLISTS.length) return;
    $('#covers').innerHTML = `<div class="now" id="now"></div><div class="cover-grid">${PLAYLISTS.map((p, i) =>
      `<button class="cover" data-i="${i}"><img src="${esc(p.cover)}" alt="" loading="lazy"><span>${esc(p.title)}</span></button>`).join('')}</div>`;
    const play = i => {
      const p = PLAYLISTS[i];
      $$('.cover').forEach(b => b.setAttribute('aria-current', String(+b.dataset.i === i)));
      $('#now').innerHTML = `<img src="${esc(p.cover)}" alt="Cover of ${esc(p.title)}"><div><h2>${esc(p.title)}</h2>
        <iframe class="spotify" title="${esc(p.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(p.id)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
    };
    $$('.cover').forEach(b => b.addEventListener('click', () => { play(+b.dataset.i); $('#now').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }));
    play(0);
  }

  /* ------------------------------------------------------------------ CV */
  function cv() {
    const C = S.card;
    $('#bbcard').innerHTML = `<div class="bb-back">
      <div class="bb-head"><div><h2>${esc(S.name)}</h2><span class="bb-pos">${esc(C.position)}</span></div></div>
      <div class="bb-vitals">${C.vitals.map(([k, v]) => `<span><b>${esc(k)}:</b> ${esc(v)}</span>`).join('')}</div>
      <table class="bb-table"><thead><tr><th>Year</th><th>Club</th><th>Position</th></tr></thead>
        <tbody>${C.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="bb-totals">${C.totals.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <p class="bb-fact">${esc(C.fact)}<span>${esc(C.factFrom)}</span></p>
    </div>
    <p class="card-foot">${S.resume ? `<a href="${esc(S.resume)}">Résumé (PDF)</a>` : ''}<a href="https://www.linkedin.com/in/summeranne" target="_blank" rel="noopener">LinkedIn</a></p>`;
  }

  /* ------------------------------------------------------------------ go */
  side(); dots(); show(at); work(); drawings(); clippings(); playlists(); cv();
  route();
})();
