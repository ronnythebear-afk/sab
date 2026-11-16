/* The front page is the list in content/list.js. This builds it, and the rooms it opens. */
(function () {
  const S = window.SAB;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover)').matches;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* fine */ } } };
  let toastTimer;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 3000); };
  const PLAYLISTS = window.SAB_PLAYLISTS || [], SHOEBOX = window.SAB_SHOEBOX || [], CLIPS = window.SAB_CLIPS || {};
  const work = id => S.work.find(w => w.id === id);
  document.body.classList.add('js');

  /* ------------------------------------------------------------------ top of the page */
  function mast() {
    const el = $('#name');
    let i = 0;
    el.innerHTML = S.name.split(' ').map(w => `<span class="word">${[...w].map(ch => `<span class="l" data-l="${esc(ch)}" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`).join(' ');
    el.setAttribute('aria-label', S.name);
    // Tap the name and it goes through the press again, a little out of line each time.
    el.addEventListener('click', () => $$('.l', el).forEach(l => {
      l.style.setProperty('--mx', ((Math.random() * .12) - .03).toFixed(3) + 'em');
      l.style.setProperty('--my', ((Math.random() * .09) - .02).toFixed(3) + 'em');
      if (!reduced) { l.classList.remove('hop'); void l.offsetWidth; l.classList.add('hop'); }
    }));
    $('#intro').textContent = S.intro;

    // Box-dye shades for every photo on the site. (I helped Clairol turn 95.)
    const shades = [['natural', 'Natural', '#6b4a33'], ['pink', 'Hot pink', '#ff48b0'], ['copper', 'Copper', '#c8642d'], ['blue', 'Blue black', '#1f2d55'], ['platinum', 'Platinum', '#ece6d6']];
    $('#dye').innerHTML = '<span class="dye-label">Try a new shade:</span>' + shades.map(([id, label, c]) =>
      `<button class="chip-dye" data-dye="${id}" style="--c:${c}" aria-pressed="${id === 'natural'}" title="${label}"><span>${label}</span></button>`).join('');
    $$('#dye .chip-dye').forEach(b => b.addEventListener('click', () => {
      document.body.dataset.dye = b.dataset.dye;
      $$('#dye .chip-dye').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      if (b.dataset.dye !== 'natural') toast(`Every photo on the site is now ${b.title.toLowerCase()}. Rinse with Natural.`);
    }));

    booth(false);
    $('#booth').addEventListener('click', () => booth(true));
  }

  // A photo booth strip of four real selfies. Tap it and the booth goes off again.
  function booth(flash) {
    const selfies = SHOEBOX.filter(p => /selfie/.test(p.src));
    const four = shuffle(selfies.length >= 4 ? selfies : SHOEBOX).slice(0, 4);
    const draw = () => { $('#booth').innerHTML = four.map(p => `<span class="frame"><img class="photo" src="${esc(p.src)}" alt=""></span>`).join(''); };
    if (!flash || reduced) return draw();
    const f = $('#flash');
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    setTimeout(draw, 160);
  }

  /* ------------------------------------------------------------------ the list */
  // Turns ==this==, ~~this~~ {that} and {that} into highlighter, a crossing-out with a fix
  // written above it, and a handwritten addition.
  function marks(text) {
    return esc(text)
      .replace(/==(.+?)==/g, '<mark>$1</mark>')
      .replace(/~~(.+?)~~\s*\{(.+?)\}/g, '<span class="fix"><s>$1</s><ins>$2</ins></span>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      .replace(/\{(.+?)\}/g, '<ins class="add">$1</ins>');
  }

  const ITEMS = String(window.SAB_LIST || '').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map((line, n) => {
    const parts = line.split('|');
    const year = (parts[0] || '').trim(), kind = (parts[1] || '').trim().toLowerCase();
    let rest = parts.slice(2).join('|').trim(), target = '';
    const arrow = rest.lastIndexOf(' -> ');
    if (arrow >= 0) { target = rest.slice(arrow + 4).trim(); rest = rest.slice(0, arrow).trim(); }
    return { n: n + 1, year, kind, html: marks(rest), target, sortYear: /^\d{4}/.test(year) ? +year.slice(0, 4) : 9999 };
  });

  // Where a line goes, and what picture pops up when you point at it.
  function resolve(it) {
    const t = it.target;
    if (!t) return {};
    if (work(t)) return { href: `#w/${t}`, peek: () => ((work(t).images || [])[0] || {}).src };
    if (t === '#drawings') return { href: t, peek: () => `media/hof/${pick(S.hof.drawings)[0]}.jpg` };
    if (t === '#playlists') return { href: t, peek: () => (pick(PLAYLISTS) || {}).cover };
    if (t === '#career') return { href: t, peek: () => 'media/me/jump.jpg' };
    if (t.startsWith('#')) return { href: t };
    if (t.startsWith('clip:')) {
      const slug = t.slice(5), c = S.clippings.find(x => x.slug === slug);
      return CLIPS[slug] ? { href: `read.html?c=${encodeURIComponent(slug)}`, peek: () => CLIPS[slug].pic } : { href: c ? c.url : '#clippings', ext: !!c };
    }
    if (t.startsWith('playlist:')) { const p = PLAYLISTS.find(x => x.id === t.slice(9)); return { button: 'playlist', p, peek: () => p && p.cover }; }
    if (t.startsWith('trick:')) return { button: t.slice(6), peek: t === 'trick:photo' ? () => (pick(SHOEBOX) || {}).src : null };
    if (t === 'mailto') return { href: `mailto:${S.email}` };
    if (/^https?:/.test(t)) return { href: t, ext: true };
    return {};
  }

  let order = 'written', kind = 'all';
  const liked = new Set(store.get('sab-likes', []));
  function list() {
    const sorts = [['written', 'as written'], ['newest', 'newest'], ['oldest', 'oldest'], ['shuffle', 'shuffle']];
    const kinds = ['all', ...new Set(ITEMS.map(i => i.kind).filter(Boolean))];
    $('#sort').innerHTML = '<span class="tool-label">order:</span>' + sorts.map(([k, l]) => `<button class="chip" data-k="${k}" aria-pressed="${k === order}">${l}</button>`).join('<span class="slash" aria-hidden="true">/</span>');
    $('#kinds').innerHTML = '<span class="tool-label">show:</span>' + kinds.map(k => `<button class="chip" data-k="${k}" aria-pressed="${k === kind}">${k}</button>`).join('<span class="slash" aria-hidden="true">/</span>');
    $$('#sort .chip').forEach(b => b.addEventListener('click', () => { order = b.dataset.k; list(); if (order === 'shuffle') toast('Definitively ranked.'); }));
    $$('#kinds .chip').forEach(b => b.addEventListener('click', () => { kind = b.dataset.k; list(); }));

    let items = ITEMS.filter(i => kind === 'all' || i.kind === kind);
    if (order === 'newest') items = items.slice().sort((a, b) => b.sortYear - a.sortYear);
    if (order === 'oldest') items = items.slice().sort((a, b) => a.sortYear - b.sortYear);
    if (order === 'shuffle') items = shuffle(items);

    const ol = $('#the-list');
    // Every eight lines, tape down the pictures from those lines, so there's something to look
    // at without pointing (phones can't point).
    const collage = chunk => {
      const pics = chunk.map(it => ({ it, r: resolve(it) })).filter(x => x.r.peek && x.r.href).map(x => ({ src: x.r.peek(), href: x.r.href })).filter(x => x.src);
      const seen = new Set(), uniq = pics.filter(p => !seen.has(p.src) && seen.add(p.src)).slice(0, 5);
      return uniq.length < 2 ? '' : `<li class="collage" aria-hidden="true">${uniq.map(p => `<a href="${esc(p.href)}" tabindex="-1" style="--r:${(Math.random() * 10 - 5).toFixed(1)}deg"><img class="photo" src="${esc(p.src)}" alt="" loading="lazy"></a>`).join('')}</li>`;
    };
    ol.innerHTML = items.map((it, k) => {
      const r = resolve(it);
      const inner = `<span class="num">${String(it.n).padStart(2, '0')}</span><span class="text"><span class="hl">${it.html}</span></span><span class="yr">${esc(it.year)}</span>`;
      const row = r.button ? `<button class="row" data-trick="${esc(r.button)}">${inner}</button>`
        : r.href ? `<a class="row" href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
          : `<div class="row still">${inner}</div>`;
      const after = (k + 1) % 8 === 0 ? collage(items.slice(k - 7, k + 1)) : '';
      return `<li class="item" data-n="${it.n}">${row}<button class="heart" aria-pressed="${liked.has(it.n)}" aria-label="Like this">${liked.has(it.n) ? '♥' : '♡'}</button><div class="drawer"></div></li>${after}`;
    }).join('');
    if (!reduced) $$('.item', ol).forEach((li, k) => { li.style.animationDelay = `${Math.min(k, 20) * 18}ms`; li.classList.add('in'); });

    $$('.item', ol).forEach(li => {
      const it = ITEMS.find(x => x.n === +li.dataset.n), r = resolve(it), row = $('.row', li);
      if (r.peek && canHover) {
        row.addEventListener('mouseenter', e => peekShow(r.peek(), e));
        row.addEventListener('mousemove', peekMove);
        row.addEventListener('mouseleave', peekHide);
      }
      if (r.button) row.addEventListener('click', () => trick(r.button, li, r));
      if (r.button === 'blink') row.addEventListener('mouseenter', () => { if (!reduced) { li.classList.remove('blink'); void li.offsetWidth; li.classList.add('blink'); } });
      $('.heart', li).addEventListener('click', e => heart(e.currentTarget, it.n));
    });
    tally();
  }

  // I like liking things. Your likes stay in your browser and nowhere else.
  function heart(btn, n) {
    if (liked.has(n)) liked.delete(n); else liked.add(n);
    btn.setAttribute('aria-pressed', String(liked.has(n)));
    btn.textContent = liked.has(n) ? '♥' : '♡';
    if (liked.has(n) && !reduced) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    store.set('sab-likes', [...liked]);
    tally();
  }
  function tally() {
    const n = liked.size;
    $('#likes').textContent = n ? `You’ve liked ${n} thing${n === 1 ? '' : 's'} on this list. I like that.` : '';
  }

  /* the picture that pops up next to a line, taped on at a slant */
  const peek = $('#peek');
  function peekShow(src, e) {
    if (!src) return;
    $('img', peek).src = src;
    peek.style.setProperty('--r', (Math.random() * 10 - 5).toFixed(1) + 'deg');
    peek.classList.add('on');
    peekMove(e);
  }
  function peekMove(e) {
    const w = peek.offsetWidth || 260, h = peek.offsetHeight || 260;
    let x = e.clientX + 28, y = e.clientY - h * .55;
    if (x + w > innerWidth - 12) x = e.clientX - w - 28;
    y = Math.max(12, Math.min(innerHeight - h - 12, y));
    peek.style.left = x + 'px';
    peek.style.top = y + 'px';
  }
  function peekHide() { peek.classList.remove('on'); }

  /* ------------------------------------------------------------------ tricks */
  function trick(name, li, r) {
    const drawer = $('.drawer', li);
    if (name === '1997') {
      document.body.classList.toggle('y1997');
      toast(document.body.classList.contains('y1997') ? 'It’s 1997. Click the line again to come back.' : 'Welcome back.');
    }
    if (name === 'drums') { rimshot(); if (!reduced) { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); } }
    if (name === 'blink') toast('Did you catch me?');
    if (name === 'photo') shoebox();
    if (name === '2014') {
      if (li.classList.contains('open')) { li.classList.remove('open'); drawer.innerHTML = ''; return; }
      const fill = () => {
        drawer.innerHTML = `<ol class="sub">${shuffle(S.receipt.items).slice(0, 6).map(t => `<li>${esc(t)}</li>`).join('')}</ol>
          <p class="sub-foot">${esc(S.receipt.footer)}. <button class="more">more</button></p>`;
        $('.more', drawer).addEventListener('click', fill);
      };
      li.classList.add('open'); fill();
    }
    if (name === 'playlist') {
      if (li.classList.contains('open')) { li.classList.remove('open'); drawer.innerHTML = ''; return; }
      const p = r.p;
      if (!p) return;
      li.classList.add('open');
      drawer.innerHTML = `<iframe class="spotify" title="${esc(p.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(p.id)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }
  }

  // Ba dum tss, made on the spot with the Web Audio API. No sound files.
  function rimshot() {
    const AC = window.AudioContext || window.webkitAudioContext;
    toast('Ba dum tss.');
    if (!AC) return;
    const ac = new AC(), t = ac.currentTime;
    const noise = len => { const b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = b; return s; };
    const hit = (when, src, peak, decay, filterType, freq) => {
      const g = ac.createGain(); g.gain.setValueAtTime(peak, when); g.gain.exponentialRampToValueAtTime(.001, when + decay);
      let node = src;
      if (filterType) { const f = ac.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; src.connect(f); node = f; }
      node.connect(g); g.connect(ac.destination); src.start(when); src.stop(when + decay + .05);
    };
    const kick = ac.createOscillator(); kick.frequency.setValueAtTime(150, t); kick.frequency.exponentialRampToValueAtTime(40, t + .15);
    hit(t, kick, .9, .22);
    hit(t + .2, noise(.2), .6, .14, 'highpass', 1400);
    const tone = ac.createOscillator(); tone.type = 'triangle'; tone.frequency.value = 190; hit(t + .2, tone, .3, .08);
    hit(t + .42, noise(.8), .35, .7, 'highpass', 7000);
    setTimeout(() => ac.close(), 1500);
  }

  // A random photo from the early aughts hard drive, with the date burned into the corner.
  function shoebox() {
    if (!SHOEBOX.length) return;
    let at = Math.floor(Math.random() * SHOEBOX.length);
    const d = $('#lightbox');
    const draw = () => {
      const p = SHOEBOX[at];
      d.innerHTML = `<div class="lb lb-print"><button class="close" aria-label="Close">✕</button>
        <figure class="print"><img class="photo" src="${esc(p.src)}" alt="${esc(p.caption || 'An old photo from the hard drive')}"><span class="datestamp">${esc(p.stamp || '')}</span></figure>
        <p>${esc(p.caption || '')}</p><button class="btn" id="another">Another one</button></div>`;
      $('.close', d).addEventListener('click', () => d.close());
      $('#another', d).addEventListener('click', () => { at = (at + 1 + Math.floor(Math.random() * (SHOEBOX.length - 1))) % SHOEBOX.length; draw(); });
    };
    draw();
    if (!d.open) d.showModal();
  }

  function lightbox(src, caption, alt) {
    const d = $('#lightbox');
    d.innerHTML = `<div class="lb"><button class="close" aria-label="Close">✕</button><img src="${esc(src)}" alt="${esc(alt || caption)}"><p>${esc(caption)}</p></div>`;
    $('.close', d).addEventListener('click', () => d.close());
    d.showModal();
  }

  /* ------------------------------------------------------------------ the work */
  function workRoom() {
    const card = w => {
      const img = (w.images || [])[0];
      return `<a class="wcard ${img ? '' : 'no-pic'}" href="#w/${esc(w.id)}" style="--tilt:${(Math.random() * 3 - 1.5).toFixed(1)}deg">
        ${img ? `<span class="wpic"><img class="photo" src="${esc(img.src)}" alt="" loading="lazy"></span>` : `<span class="wpaper">${esc(w.blurb)}</span>`}
        <span class="wtitle">${esc(w.title)}</span><span class="wmeta">${esc(w.client)} · ${esc(w.year)}</span></a>`;
    };
    $('#work-box').innerHTML = [['lately', 'Lately'], ['before', 'Before that']].map(([era, label]) =>
      `<h3 class="sub-h era">${label}</h3><div class="wgrid">${S.work.filter(w => w.era === era).map(card).join('')}</div>`).join('') +
      `<p class="clients"><b>Also made things for</b> ${S.clients.map(esc).join(' <span aria-hidden="true">✦</span> ')}</p>`;
  }

  let sheetReturn = '';
  function openWork(id) {
    const i = S.work.findIndex(w => w.id === id), t = S.work[i];
    if (!t) return;
    const prev = S.work[i - 1], next = S.work[i + 1];
    const dlg = $('#liner');
    const pics = (t.images || []).map(im => `<figure><img class="photo" src="${esc(im.src)}" alt="${esc(im.alt || '')}" loading="lazy">${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ''}</figure>`).join('');
    dlg.innerHTML = `
      <div class="sheet">
        <button class="close" aria-label="Close">✕</button>
        <div class="sheet-in ${pics ? '' : 'no-pics'}">
          <div>
            <p class="ln-kicker">${esc(t.era === 'lately' ? 'Lately' : 'Before that')} · ${esc(t.year)}</p>
            <h2>${esc(t.title)}</h2>
            <div class="ln-meta"><span><b>${esc(t.client)}</b></span>${t.role ? `<span>${esc(t.role)}</span>` : ''}</div>
            <div class="ln-notes">${t.notes.map(p => `<p>${esc(p)}</p>`).join('')}</div>
            ${t.quote ? `<blockquote class="ln-quote"><p>“${esc(t.quote.text)}”</p><cite>${esc(t.quote.who)}</cite></blockquote>` : ''}
            ${t.links && t.links.length ? `<div class="ln-links">${t.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}
          </div>
          ${pics ? `<div class="ln-pics">${pics}</div>` : ''}
        </div>
        <div class="ln-nav">
          ${prev ? `<a href="#w/${esc(prev.id)}">← ${esc(prev.title)}</a>` : '<span></span>'}
          ${next ? `<a href="#w/${esc(next.id)}">${esc(next.title)} →</a>` : '<span></span>'}
        </div>
      </div>`;
    $('.close', dlg).addEventListener('click', () => dlg.close());
    if (!dlg.open) dlg.showModal();
    $('.sheet', dlg).scrollTop = 0;
  }
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  $('#liner').addEventListener('close', () => { if (location.hash.startsWith('#w/')) history.replaceState(null, '', sheetReturn || location.pathname + location.search); });

  /* ------------------------------------------------------------------ rooms */
  const rooms = $$('.room');
  const roomIds = rooms.map(r => r.id);
  let listScroll = 0;
  rooms.forEach(r => { r.hidden = true; });
  rooms.forEach(r => {
    r.insertAdjacentHTML('afterbegin', `<div class="room-bar"><a class="back" href="#list">← back to the list</a><span class="room-name">${esc(r.dataset.name)}</span><a class="next" href="#hi">say hi →</a></div>`);
  });
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('w/')) {
      const current = roomIds.find(id => document.body.classList.contains('in-room') && !document.getElementById(id).hidden);
      sheetReturn = current ? '#' + current : '';
      openWork(h.slice(2));
      return;
    }
    if ($('#liner').open) $('#liner').close();
    const room = roomIds.includes(h) ? h : '';
    if (room && !document.body.classList.contains('in-room')) listScroll = window.scrollY;
    document.body.classList.toggle('in-room', !!room);
    rooms.forEach(r => { r.hidden = r.id !== room; });
    if (room) {
      window.scrollTo(0, 0);
      const r = document.getElementById(room);
      r.classList.remove('arrive'); void r.offsetWidth; r.classList.add('arrive');
      document.title = `${r.dataset.name} · ${S.name}`;
    } else {
      document.title = S.name;
      if (h === 'hi') $('#hi').scrollIntoView();
      else if (h === 'list') window.scrollTo(0, listScroll || $('#list').offsetTop - 20);
      else window.scrollTo(0, listScroll);
    }
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('in-room') && !$('dialog[open]')) location.hash = 'list';
  });

  /* ------------------------------------------------------------------ clippings */
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
          <span class="clip-foot"><span class="clip-kind">${esc(c.kind)}</span><span>${here ? 'read it here →' : 'original ↗'}</span></span></a>`;
      }).join('');
    };
    draw();
    $('#press').innerHTML = S.press.map(p => `<li><a href="${esc(p.url)}" target="_blank" rel="noopener"><b>${esc(p.outlet)}, ${esc(p.year)}</b><span>${esc(p.title)}</span></a></li>`).join('');
  }

  /* ------------------------------------------------------------------ drawings */
  function drawings() {
    const H = S.hof;
    $('#hof-intro').innerHTML = `${esc(H.intro)} <a href="${esc(H.url)}" target="_blank" rel="noopener">See the rest ↗</a>`;
    const tile = (src, cap, alt) => `<figure class="tile" style="--tilt:${(Math.random() * 3 - 1.5).toFixed(1)}deg"><button aria-label="${esc(cap)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></button><figcaption>${esc(cap)}</figcaption></figure>`;
    $('#hof').innerHTML = H.drawings.map(([id, nm, yr]) => tile(`media/hof/${id}.jpg`, `${nm}, ’${String(yr).slice(2)}`, `Summer’s drawing of ${nm}`)).join('');
    $('#sketchbook').innerHTML = H.sketchbook.map(([src, cap]) => tile(src, cap, cap)).join('');
    $$('.wall .tile button').forEach(b => b.addEventListener('click', () => { const img = $('img', b); lightbox(img.src, b.getAttribute('aria-label'), img.alt); }));
  }

  /* ------------------------------------------------------------------ playlists */
  function playlists() {
    if (!PLAYLISTS.length) { $('#covers').innerHTML = '<p>Run <code>node tools/playlists.mjs</code> to fill this.</p>'; return; }
    $('#covers').innerHTML = `<div class="now" id="now"></div><div class="cover-grid">${PLAYLISTS.map((p, i) =>
      `<button class="cover" data-i="${i}" style="--tilt:${(Math.random() * 4 - 2).toFixed(1)}deg"><img src="${esc(p.cover)}" alt="" loading="lazy"><span>${esc(p.title)}</span></button>`).join('')}</div>`;
    const show = (i, play) => {
      const p = PLAYLISTS[i];
      $$('.cover').forEach(b => b.setAttribute('aria-current', String(+b.dataset.i === i)));
      $('#now').innerHTML = `<img src="${esc(p.cover)}" alt="Cover of ${esc(p.title)}"><div><span class="yr">${esc(p.year)}</span><h3>${esc(p.title)}</h3><p>${esc(p.note)}</p>
        ${play ? `<iframe class="spotify" title="${esc(p.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(p.id)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>` : `<button class="btn ink" id="play">▶ Play it</button> <a class="link" href="${esc(p.url)}" target="_blank" rel="noopener">open in Spotify ↗</a>`}</div>`;
      const pb = $('#play'); if (pb) pb.addEventListener('click', () => show(i, true));
    };
    $$('.cover').forEach(b => b.addEventListener('click', () => { show(+b.dataset.i, true); $('#now').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }));
    show(0, false);
  }

  /* ------------------------------------------------------------------ career */
  function career() {
    const C = S.card;
    $('#bbcard').innerHTML = `
      <div class="bb-back">
        <div class="bb-head"><div><h3>${esc(S.name)}</h3><span class="bb-pos">${esc(C.position)}</span></div><span class="bb-no">No. 97</span></div>
        <div class="bb-vitals">${C.vitals.map(([k, v]) => `<span><b>${esc(k)}:</b> ${esc(v)}</span>`).join('')}</div>
        <table class="bb-table"><thead><tr><th>Year</th><th>Club</th><th>Pos.</th><th>Notes</th></tr></thead>
          <tbody>${C.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <div class="bb-totals">${C.totals.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
        <p class="bb-fact"><b>Fun fact:</b> ${esc(C.cartoon)}</p>
      </div>
      <p class="card-foot">${S.resume ? `<a class="link" href="${esc(S.resume)}">résumé (PDF)</a>` : ''}<a class="link" href="https://www.linkedin.com/in/summeranne" target="_blank" rel="noopener">the LinkedIn version ↗</a></p>`;
  }

  /* ------------------------------------------------------------------ say hi */
  function hi() {
    $('#hi-msg').textContent = S.lookingForWork ? S.lookingLine : S.notLookingLine;
    const m = $('#hi-mail'); m.href = `mailto:${S.email}`; m.textContent = S.email;
    $('#hi-links').innerHTML = S.links.map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a></li>`).join('');
    $('#foot-line').textContent = S.footer;
    $('#copy').addEventListener('click', () => {
      (navigator.clipboard ? navigator.clipboard.writeText(S.email) : Promise.reject()).then(() => toast('Copied. Talk soon.'), () => toast(S.email));
    });
  }

  /* ------------------------------------------------------------------ hidden things */
  function hidden() {
    let typed = '';
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let k = 0;
    const y97 = document.createElement('div');
    y97.className = 'y97'; y97.innerHTML = '<span>🚧 Welcome to my homepage! Best viewed in Netscape Navigator. 🚧</span>';
    document.body.appendChild(y97);
    document.addEventListener('keydown', e => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      k = (e.key === konami[k] || e.key.toLowerCase() === konami[k]) ? k + 1 : (e.key === konami[0] ? 1 : 0);
      if (k === konami.length) { k = 0; document.body.classList.toggle('y1997'); }
      if (e.key.length !== 1) return;
      typed = (typed + e.key.toLowerCase()).slice(-12);
      if (typed.endsWith('astros')) { typed = ''; const s = document.createElement('div'); s.className = 'sunrise'; document.body.appendChild(s); toast('Go ’Stros!'); setTimeout(() => s.remove(), 3600); }
      if (typed.endsWith('maude')) { typed = ''; dog('Maude'); }
      if (typed.endsWith('otis')) { typed = ''; dog('Otis'); }
    });
  }
  function dog(nm) {
    const d = document.createElement('div');
    d.className = 'dog';
    d.innerHTML = `<b>${nm}</b><span aria-hidden="true">🐕</span>`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 6200);
  }

  /* ------------------------------------------------------------------ go */
  mast(); list(); workRoom(); clippings(); drawings(); playlists(); career(); hi(); hidden();
  route();
  console.log('%cHi. Summer made her first website in 1997. If you’re hiring, she’s at ' + S.email, 'font: 700 14px monospace; color: #ff48b0');
})();
