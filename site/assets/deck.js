/*
  Summer Anne Burton's site: a page with cards on it.

  Everything is a card, in four decks:
    I    Work               the work, from content.js, newest on top
    II   Words              articles she wrote, posts from X, thoughts, newest on top
    III  Baseball drawings  Every Hall of Famer, from Nolan Ryan
    IV   And more           pictures, links she's sharing, Instagram posts, anything else, newest on top
  Tap a deck to deal its next card. Drag a card to move it, flick it and it slides. Tap a
  card to open it, with arrows through the rest of its deck. When the page opens, the newest
  card from each deck is dealt. Pull a reading clears the page and lays out five cards face
  down in a cross: tap one to turn it over, tap again to open it. A small tag by the pointer
  says what a click will do.
*/
(function () {
  const S = window.SAB, FEED = window.SAB_FEED || [], FACES = window.SAB_FACES || [];
  const DRAW = (S.hof && S.hof.drawings) || [];
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // A date as it's written on a card: "Nov 16, 2026", "2014", or "2019–2021" as given.
  const when = d => { const m = String(d || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? `${MONTHS[+m[2] - 1]}${m[3] ? ' ' + +m[3] : ''}, ${m[1]}` : String(d || ''); };
  // Sorting: a full date as is; a year (or "2019–2021") as the middle of its last year.
  const sortKey = d => { const s = String(d || ''); if (/^\d{4}-\d{2}/.test(s)) return s.padEnd(10, '-15'); const y = s.match(/\d{4}/g); return y ? y[y.length - 1] + '-07-01' : '0000'; };

  /* ------------------------------------------------------------------ the decks */
  const SUITS = [
    { key: 'work', num: 'I', name: 'Work' },
    { key: 'words', num: 'II', name: 'Words' },
    { key: 'drawings', num: 'III', name: 'Baseball drawings' },
    { key: 'more', num: 'IV', name: 'And more' }
  ];
  const SUIT = Object.fromEntries(SUITS.map(s => [s.key, s]));
  const suitOf = c => c.type === 'work' ? 'work' : c.type === 'art' ? 'drawings'
    : c.type === 'article' || c.type === 'thought' || (c.type === 'post' && c.source !== 'Instagram') ? 'words' : 'more';
  const CARDS = [
    ...S.work.map(w => ({ id: 'w-' + w.id, type: 'work', w, title: w.title, sub: w.client, date: w.year, img: ((w.images || [])[0] || {}).src })),
    ...FEED.filter(f => f && f.type && f.type !== 'playlist'),
    ...DRAW.map(([id, name, yr]) => ({ id: 'd-' + id, type: 'art', title: name, date: yr, img: `media/hof/${id}.jpg` }))
  ].map(c => ({ ...c, suit: suitOf(c) }));
  const DECK = {};
  SUITS.forEach(s => {
    const cards = CARDS.filter(c => c.suit === s.key);
    // newest on top; the drawings keep their order, starting from Nolan Ryan
    const nr = cards.findIndex(c => c.id === 'd-nolan-ryan');
    const drawings = nr > 0 ? [...cards.slice(nr), ...cards.slice(0, nr)] : cards;
    DECK[s.key] = { suit: s, cards: s.key === 'drawings' ? drawings : cards.slice().sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date))), next: 0 };
  });

  /* ------------------------------------------------------------------ the faces */
  // Every card has the same caption line across the top: its number, its deck, its date.
  function front(c) {
    const s = SUIT[c.suit];
    const head = `<span class="hdr"><b>${s.num}</b><span>${esc(s.name)}</span><i>${esc(['work', 'art'].includes(c.type) ? c.date : when(c.date))}</i></span>`;
    let h = '';
    if (c.type === 'work') h = c.img
      ? `<span class="ph"><img src="${esc(c.img)}" alt="" draggable="false"></span><span class="ttl">${esc(c.title)}</span><span class="cap">${esc(c.sub)}</span>`
      : `<span class="ttl big">${esc(c.title)}</span><span class="cap">${esc(c.sub)}</span>`;
    else if (c.type === 'pic') h = `<span class="ph"><img src="${esc(c.img)}" alt="" draggable="false"></span>${c.text ? `<span class="ttl sm">${esc(c.text)}</span>` : ''}`;
    else if (c.type === 'post') h = `<span class="txt">${esc(c.text || '')}</span><span class="cap">${c.source === 'Instagram' ? 'Instagram' : '@summeranne on X'}</span>`;
    else if (c.type === 'thought') h = `<span class="txt big">${esc(c.text)}</span>`;
    else if (c.type === 'article') h = `<span class="cap">${esc(c.outlet)}</span><span class="ttl">${esc(c.title)}</span><span class="cap end">By Summer Anne Burton</span>`;
    else if (c.type === 'link') h = `<span class="cap">Shared from ${esc(c.site || '')}</span>${c.img ? `<span class="ph wide"><img src="${esc(c.img)}" alt="" draggable="false"></span>` : ''}<span class="ttl">${esc(c.title)}</span>${c.text ? `<span class="note">${esc(c.text)}</span>` : ''}`;
    else if (c.type === 'art') h = `<span class="ph drawn"><img src="${esc(c.img)}" alt="" draggable="false"></span><span class="ttl sm">${esc(c.title)}</span>`;
    return `<span class="face front">${head}<span class="in">${h}</span></span>`;
  }
  // The back, like an old tarot deck: crosshatching, and the deck's number in a ring.
  const back = c => `<span class="face back"><i class="hatch"></i><span class="medal"><b>${SUIT[c.suit].num}</b></span></span>`;
  const label = c => ({ work: `${c.title}, ${c.sub}`, post: (c.text || '').slice(0, 80), pic: c.text || 'A picture', thought: (c.text || '').slice(0, 80), article: c.title, link: `Shared: ${c.title}`, art: `Drawing of ${c.title}` }[c.type] || c.title || '');

  /* ------------------------------------------------------------------ the masthead */
  const name = $('#bigname'), parts = S.name.split(' ');
  name.innerHTML = `<span>${esc(parts.slice(0, -1).join(' '))}</span> <span>${esc(parts.slice(-1)[0])}</span>`;
  $('#role').textContent = `${S.role}, ${S.city}`;
  $('#dateline').textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  $('#mail').href = `mailto:${S.email}`;
  if (S.available) { $('#avail').textContent = S.available; $('#avail').hidden = false; }
  // The photo booth: tap the picture and it takes a new one, with a flash.
  const me = $('#me'), meImg = $('#me-img');
  let meAt = -1;
  const nextMe = () => { if (!FACES.length) return; let n = meAt; while (n === meAt && FACES.length > 1) n = Math.floor(Math.random() * FACES.length); meAt = n; meImg.src = FACES[n].src; };
  nextMe();
  me.addEventListener('click', () => {
    const f = $('#flash');
    if (!reduced) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
    setTimeout(nextMe, reduced ? 0 : 120);
  });

  /* ------------------------------------------------------------------ the page and the decks */
  const table = $('#cards'), decks = $('#decks');
  decks.innerHTML = SUITS.map(s => `<button class="deck d-${s.key}" type="button" data-suit="${s.key}" aria-label="${s.name}: deal a card">
      <span class="stack"><i></i><i></i><i class="top"><b>${s.num}</b></i></span>
      <span class="dl"><b>${s.num}</b><span class="dname">${s.name}</span><span class="count" id="n-${s.key}"></span></span></button>`).join('');
  const counts = () => SUITS.forEach(s => { $('#n-' + s.key).textContent = DECK[s.key].cards.length; });

  let L = {};
  function layout() {
    const W = innerWidth, H = innerHeight, phone = W < 760;
    const top = $('.top').getBoundingClientRect().bottom + (phone ? 6 : 10);
    const dock = $('.dock').getBoundingClientRect();
    const right = phone ? W : dock.left - 10, bottom = phone ? dock.top - 6 : H - 8;
    const cw = Math.round(clamp(Math.min(right * (phone ? .33 : .165), (bottom - top) * .52 * 5 / 7), phone ? 108 : 150, 225));
    L = { W, H, phone, top, bottom, right, cw, ch: Math.round(cw * 7 / 5), max: phone ? 8 : 12 };
    document.documentElement.style.setProperty('--cw', cw + 'px');
    // the name is as wide as the page allows: one line on a computer, two on a phone
    name.style.fontSize = '100px';
    const widest = Math.max(...$$('span', name).map(s => s.getBoundingClientRect().width));
    const lineW = phone ? widest : name.scrollWidth;
    name.style.fontSize = Math.floor(100 * (right - (phone ? 24 : 36)) / Math.max(1, lineW)) + 'px';
    onTable.forEach(t => { t.x = clamp(t.x, 4, L.right - L.cw - 4); t.y = clamp(t.y, L.top - L.ch * .2, L.bottom - L.ch * .7); place(t); });
  }

  /* ------------------------------------------------------------------ cards on the page */
  const onTable = []; // { c, el, x, y, a, s, vx, vy, va }
  let z = 10;
  const place = t => { t.el.style.transform = `translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px) rotate(${t.a.toFixed(2)}deg)${t.s && t.s !== 1 ? ` scale(${t.s.toFixed(3)})` : ''}`; };

  // Somewhere on the page that isn't already covered much.
  function spot() {
    let best = null, bestScore = Infinity;
    for (let n = 0; n < 16; n++) {
      const x = rand(10, L.right - L.cw - 10), y = rand(L.top, Math.max(L.top + 1, L.bottom - L.ch));
      const score = onTable.reduce((s, t) => s + Math.max(0, L.cw - Math.abs(t.x - x)) * Math.max(0, L.ch - Math.abs(t.y - y)), 0);
      if (score < bestScore) { best = { x, y }; bestScore = score; }
    }
    return best;
  }

  function lay(c, opts = {}) {
    const already = onTable.find(t => t.c.id === c.id);
    if (already) { already.el.style.zIndex = ++z; if (opts.down) already.el.classList.add('down'); return already; }
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `card t-${c.type} s-${c.suit}${c.type === 'work' && !c.img ? ' noimg' : ''}${opts.down ? ' down' : ''}`;
    el.setAttribute('aria-label', opts.down ? `${SUIT[c.suit].name}, face down: turn it over` : label(c));
    el.innerHTML = `<span class="flip">${front(c)}${back(c)}</span>`;
    el.style.zIndex = ++z;
    table.appendChild(el);
    const to = opts.at || spot();
    const t = { c, el, x: to.x, y: to.y, a: opts.a != null ? opts.a : rand(-7, 7), s: opts.s || 1, vx: 0, vy: 0, va: 0 };
    onTable.push(t);
    const from = $(`.d-${c.suit} .top`).getBoundingClientRect();
    place(t);
    if (!reduced) el.animate([
      { transform: `translate(${from.left}px, ${from.top}px) rotate(0deg) scale(${from.width / L.cw})` },
      { transform: el.style.transform }
    ], { duration: 560, delay: opts.delay || 0, fill: 'backwards', easing: 'cubic-bezier(.16, 1, .3, 1)' });
    // too many out: the one at the bottom of the pile goes back
    if (onTable.length > L.max) sendBack(onTable.reduce((a, b) => (+a.el.style.zIndex < +b.el.style.zIndex ? a : b)));
    return t;
  }
  function deal(key) {
    const d = DECK[key];
    if (!d.cards.length) return;
    if (d.next >= d.cards.length) d.next = 0; // back to the top of the deck
    lay(d.cards[d.next++]);
  }
  function sendBack(t) {
    onTable.splice(onTable.indexOf(t), 1);
    if (reduced) return t.el.remove();
    const to = $(`.d-${t.c.suit} .top`).getBoundingClientRect();
    t.el.animate([
      { transform: t.el.style.transform, opacity: 1 },
      { transform: `translate(${to.left}px, ${to.top}px) rotate(0deg) scale(${to.width / L.cw})`, opacity: .2 }
    ], { duration: 420, easing: 'cubic-bezier(.5, 0, .7, .4)' }).onfinish = () => t.el.remove();
  }

  // A reading: the page clears and five cards land face down in a cross.
  function reading() {
    [...onTable].forEach(sendBack);
    // the cards shrink if the page is too short for a cross of them
    const s = Math.min(1, (L.bottom - L.top) / (L.ch * 3.15)), w = L.cw * s, h = L.ch * s;
    const cx = L.right / 2 - L.cw / 2, cy = (L.top + L.bottom) / 2 - L.ch / 2;
    const dx = Math.min(w * 1.14, (L.right - w) / 2 - 8), dy = Math.min(h * 1.05, (L.bottom - L.top - h) / 2);
    // work in the middle, a drawing above, words and something else either side, and any deck below
    const spread = [['work', 0, 0], ['drawings', 0, -dy], ['words', -dx, 0], ['more', dx, 0], [pick(['work', 'words', 'drawings', 'more']), 0, dy]];
    const used = new Set();
    spread.forEach(([key, ox, oy], n) => {
      const d = DECK[key];
      if (!d.cards.length) return;
      const fresh = d.cards.filter(c => !used.has(c.id)), c = pick(fresh.length ? fresh : d.cards);
      used.add(c.id);
      setTimeout(() => lay(c, { down: true, at: { x: cx + ox, y: cy + oy }, a: 0, s }), reduced ? 0 : 380 + n * 160);
    });
  }
  function turnOver(t) {
    if (tagEl.classList.contains('on')) tagEl.textContent = 'Open';
    t.el.classList.remove('down');
    t.el.setAttribute('aria-label', label(t.c));
  }

  /* the tag by the pointer */
  const tagEl = $('#tag'), fine = matchMedia('(pointer: fine)').matches;
  let frame = 0, pointer = { x: 0, y: 0 };
  function say(target) {
    if (!fine) return;
    const card = target.closest && target.closest('.card'), deck = target.closest && target.closest('.deck');
    const words = held ? 'Throw' : card ? (card.classList.contains('down') ? 'Turn over' : 'Open') : deck ? 'Deal' : '';
    tagEl.textContent = words;
    tagEl.classList.toggle('on', !!words);
  }
  addEventListener('pointermove', e => {
    pointer = { x: e.clientX, y: e.clientY };
    if (fine && !frame) frame = requestAnimationFrame(() => { frame = 0; tagEl.style.transform = `translate(${pointer.x + 14}px, ${pointer.y + 16}px)`; });
    say(e.target);
  }, { passive: true });
  document.addEventListener('pointerleave', () => tagEl.classList.remove('on'));

  /* picking up, moving and flicking */
  let held = null;
  table.addEventListener('pointerdown', e => {
    const el = e.target.closest('.card');
    const t = el && onTable.find(x => x.el === el);
    if (!t) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.style.zIndex = ++z;
    el.classList.add('held');
    t.vx = t.vy = t.va = 0;
    held = { t, dx: e.clientX - t.x, dy: e.clientY - t.y, x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: 0, trail: [[e.clientX, e.clientY, performance.now()]] };
  });
  table.addEventListener('pointermove', e => {
    if (!held) return;
    const t = held.t;
    t.x = e.clientX - held.dx; t.y = e.clientY - held.dy;
    held.moved = Math.max(held.moved, Math.hypot(e.clientX - held.x0, e.clientY - held.y0));
    held.trail.push([e.clientX, e.clientY, performance.now()]);
    if (held.trail.length > 6) held.trail.shift();
    place(t);
  });
  const tap = t => (t.el.classList.contains('down') ? turnOver(t) : open(t.c));
  const letGo = () => {
    if (!held) return;
    const { t, moved, t0, trail } = held;
    held = null;
    t.el.classList.remove('held');
    if (moved < 6 && performance.now() - t0 < 400) return tap(t);
    const [a, b] = [trail[0], trail[trail.length - 1]], dt = Math.max(16, b[2] - a[2]);
    t.vx = (b[0] - a[0]) / dt * 16; t.vy = (b[1] - a[1]) / dt * 16;
    t.va = clamp(t.vx * .1, -3, 3);
    if (!reduced) slide();
  };
  table.addEventListener('pointerup', letGo);
  table.addEventListener('pointercancel', letGo);
  table.addEventListener('click', e => { if (e.detail === 0) { const t = onTable.find(x => x.el === e.target.closest('.card')); if (t) tap(t); } });

  // Flicked cards slide, slow down and stop at the edges of the page.
  let sliding = false;
  function slide() {
    if (sliding) return;
    sliding = true;
    const step = () => {
      let moving = false;
      onTable.forEach(t => {
        if (Math.abs(t.vx) + Math.abs(t.vy) + Math.abs(t.va) < .05) { t.vx = t.vy = t.va = 0; return; }
        moving = true;
        t.x += t.vx; t.y += t.vy; t.a += t.va;
        t.vx *= .92; t.vy *= .92; t.va *= .9;
        const minX = 2, maxX = L.right - L.cw - 2, minY = L.top - L.ch * .2, maxY = L.bottom - L.ch * .55;
        if (t.x < minX || t.x > maxX) { t.x = clamp(t.x, minX, maxX); t.vx *= -.4; }
        if (t.y < minY || t.y > maxY) { t.y = clamp(t.y, minY, maxY); t.vy *= -.4; }
        place(t);
      });
      if (moving) requestAnimationFrame(step); else sliding = false;
    };
    requestAnimationFrame(step);
  }

  decks.addEventListener('click', e => { const b = e.target.closest('.deck'); if (b) deal(b.dataset.suit); });
  $('#reading').addEventListener('click', reading);

  /* ------------------------------------------------------------------ a card, up close */
  const big = $('#big');
  function open(c) {
    const d = DECK[c.suit], i = d.cards.indexOf(c), s = d.suit;
    big.innerHTML = `<article class="bigcard s-${c.suit} t-${c.type}">
      <button class="close" type="button" aria-label="Close">Close</button>
      <div class="big-in">${inside(c)}</div>
      <nav class="big-nav"><button type="button" data-by="-1" aria-label="Previous">← Previous</button><span>${s.num} · ${s.name} · ${i + 1} of ${d.cards.length}</span><button type="button" data-by="1" aria-label="Next">Next →</button></nav>
    </article>`;
    $('.close', big).addEventListener('click', () => big.close());
    $$('.big-nav button', big).forEach(b => b.addEventListener('click', () => open(d.cards[(i + +b.dataset.by + d.cards.length) % d.cards.length])));
    if (!big.open) big.showModal();
    $('.big-in', big).scrollTop = 0;
  }
  big.addEventListener('click', e => { if (e.target === big) big.close(); });
  big.addEventListener('keydown', e => { if (e.key === 'ArrowRight') $('.big-nav [data-by="1"]', big)?.click(); if (e.key === 'ArrowLeft') $('.big-nav [data-by="-1"]', big)?.click(); });
  big.addEventListener('close', () => { if (location.hash === '#cv') history.replaceState(null, '', location.pathname + location.search); });

  const out = (url, text) => `<a class="go" href="${esc(url)}" target="_blank" rel="noopener">${esc(text)} ↗</a>`;
  function inside(c) {
    if (c.type === 'work') {
      const w = c.w;
      return `<p class="meta">${esc(w.client)} · ${esc(w.year)}</p><h2>${esc(w.title)}</h2>
        ${(w.images || []).map(im => `<figure><img src="${esc(im.src)}" alt="${esc(im.alt || '')}">${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ''}</figure>`).join('')}
        ${(w.words || []).map(p => `<p class="words">${esc(p)}</p>`).join('')}
        ${(w.quotes || []).map(q => `<blockquote><p>“${esc(q.text)}”</p><cite>${esc(q.who)}</cite></blockquote>`).join('')}
        ${(w.links || []).length ? `<p class="links">${w.links.map(l => /^https?:/.test(l.url) ? out(l.url, l.label) : `<a class="go" href="${esc(l.url)}">${esc(l.label)}</a>`).join('')}</p>` : ''}`;
    }
    if (c.type === 'post') return `<p class="meta">${esc(c.source || 'X')} · ${esc(when(c.date))}</p><p class="say">${esc(c.text || '')}</p>${c.img ? `<figure><img src="${esc(c.img)}" alt=""></figure>` : ''}${c.url ? `<p class="links">${out(c.url, c.source === 'Instagram' ? 'On Instagram' : 'On X')}</p>` : ''}`;
    if (c.type === 'pic') return `<figure class="pic"><img src="${esc(c.img)}" alt="${esc(c.text || '')}"></figure>${c.text ? `<p class="say small">${esc(c.text)}</p>` : ''}<p class="meta">${esc(when(c.date))}</p>${c.url ? `<p class="links">${out(c.url, 'Original')}</p>` : ''}`;
    if (c.type === 'thought') return `<p class="meta">${esc(when(c.date))}</p><p class="say">${esc(c.text)}</p>`;
    if (c.type === 'article') return `<p class="meta">${esc(c.outlet)} · ${esc(when(c.date))}</p><h2 class="serif">${esc(c.title)}</h2>${c.dek ? `<p class="words">${esc(c.dek)}</p>` : ''}
        <p class="links">${c.slug ? `<a class="go solid" href="read.html?c=${esc(c.slug)}">Read it</a>` : ''}${out(c.url, 'Original')}</p>`;
    if (c.type === 'link') return `<p class="meta">Shared · ${esc(c.site || '')} · ${esc(when(c.date))}</p><h2 class="serif">${esc(c.title)}</h2>${c.img ? `<figure><img src="${esc(c.img)}" alt=""></figure>` : ''}${c.text ? `<p class="say small">${esc(c.text)}</p>` : ''}<p class="links">${out(c.url, 'Read it')}</p>`;
    if (c.type === 'art') return `<figure class="drawn"><img src="${esc(c.img)}" alt="Summer’s drawing of ${esc(c.title)}"></figure><p class="meta">${esc(c.title)}, ${esc(c.date)}</p><p class="links">${out(S.hof.url, 'Every Hall of Famer')}</p>`;
    if (c.type === 'playlist') return `<div class="pl"><img src="${esc(c.img)}" alt="Cover of ${esc(c.title)}"><div><p class="meta">Playlist · ${esc(c.date)}</p><h2>${esc(c.title)}</h2>${c.text ? `<p class="words">${esc(c.text)}</p>` : ''}</div></div>
        ${c.spotify ? `<iframe class="spotify" title="${esc(c.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(c.spotify)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>` : ''}`;
    return '';
  }

  // The CV is the back of a baseball card.
  function openCV() {
    const C = S.card;
    big.innerHTML = `<article class="bigcard cv">
      <button class="close" type="button" aria-label="Close">Close</button>
      <div class="big-in"><div class="bb-back">
        <div class="bb-head"><h2>${esc(S.name)}</h2><span class="bb-pos">${esc(C.position)} · ${esc(C.home || S.city)}</span></div>
        <ol class="bb-rows">${C.rows.slice().reverse().map(([yr, where, title]) => `<li><span class="yr">${esc(yr)}</span><div><b>${esc(where)}</b><span class="pos">${esc(title)}</span></div></li>`).join('')}</ol>
        ${(S.press || []).length ? `<h3 class="bb-sub">Press</h3><ul class="bb-press">${S.press.slice().reverse().map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener"><span>${esc(x.year)}</span><span>${esc(x.title)}&nbsp;↗ <i>${esc(x.outlet)}</i></span></a></li>`).join('')}</ul>` : ''}
      </div>
      <p class="links center"><a class="go solid" href="mailto:${esc(S.email)}">Email</a>${S.resume ? `<a class="go" href="${esc(S.resume)}">Résumé (PDF)</a>` : ''}${S.links.filter(l => l.label !== 'Every Hall of Famer').map(l => out(l.url, l.label)).join('')}</p></div>
    </article>`;
    $('.close', big).addEventListener('click', () => big.close());
    if (!big.open) big.showModal();
  }
  const route = () => { if (location.hash === '#cv') openCV(); };
  addEventListener('hashchange', route);
  $('#cv-link').addEventListener('click', e => { if (location.hash === '#cv') { e.preventDefault(); openCV(); } });

  /* ------------------------------------------------------------------ the radio */
  // Radio plays the playlist in radio.js on shuffle: a random track, then another random one
  // when that ends. Spotify's own player does the playing, through its embed API.
  const R = window.SAB_RADIO || {}, radioBtn = $('#radio'), player = $('#player');
  let ctrl = null, last = { position: 0, duration: 0 }, wantPlay = false;
  const randomTrack = () => (R.tracks && R.tracks.length ? `spotify:track:${pick(R.tracks)}` : `spotify:playlist:${R.playlist}`);
  let nextTrack = () => { if (!ctrl) return; ctrl.loadUri(randomTrack()); ctrl.play(); };
  function radioOn(on) {
    wantPlay = on;
    radioBtn.setAttribute('aria-pressed', String(on));
    player.hidden = !on;
    if (!on) { if (ctrl) ctrl.pause(); return; }
    if (ctrl) return ctrl.resume ? ctrl.resume() : ctrl.play();
    window.onSpotifyIframeApiReady = api => {
      api.createController($('#spot'), { uri: randomTrack(), width: '100%', height: 80 }, c => {
        ctrl = c;
        c.addListener('ready', () => { if (wantPlay) c.play(); });
        c.addListener('playback_update', e => {
          const { isPaused, position, duration } = e.data;
          radioBtn.classList.toggle('playing', !isPaused);
          // a track that just finished: on to another one
          if (isPaused && wantPlay && last.duration && last.position > last.duration - 1500) { last = { position: 0, duration: 0 }; nextTrack(); return; }
          last = { position, duration };
        });
      });
    };
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    s.onerror = plain;
    document.body.appendChild(s);
    setTimeout(() => { if (!ctrl) plain(); }, 6000);
  }
  // Without Spotify's player API: a plain embed of a random track, and Shuffle loads another.
  let usingPlain = false;
  function plain() {
    if (ctrl || usingPlain) return;
    usingPlain = true;
    const embed = () => { const t = R.tracks && R.tracks.length ? `track/${pick(R.tracks)}` : `playlist/${R.playlist}`; $('#spot').outerHTML = `<iframe id="spot" title="Radio" src="https://open.spotify.com/embed/${t}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`; };
    embed();
    nextTrack = embed;
  }
  if (R.playlist) {
    radioBtn.hidden = false;
    radioBtn.addEventListener('click', () => radioOn(radioBtn.getAttribute('aria-pressed') !== 'true'));
    $('#shuffle').addEventListener('click', () => nextTrack());
    $('#spot-out').href = R.url || `https://open.spotify.com/playlist/${R.playlist}`;
  }

  /* ------------------------------------------------------------------ deal */
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layout, 120); });
  function start() {
    layout();
    counts();
    // the opening hand: the newest card from each deck, then one more piece of work and one more of words
    ['work', 'words', 'drawings', 'more', 'work', 'words'].filter(k => DECK[k].cards.length)
      .forEach((k, n) => setTimeout(() => deal(k), reduced ? 0 : 250 + n * 170));
    route();
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start, start);
})();
