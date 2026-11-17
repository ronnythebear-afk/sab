/*
  Summer Anne Burton's site: a card table on a cutting mat.

  Everything is a card, in five decks along the bottom, newest on top:
    Work    the work, from content.js
    Posts   posts from X and Instagram, pictures, thoughts
    Words   articles, hers and ones she's sharing
    Art     Every Hall of Famer
    Music   playlists
  Tap a deck to deal its next card onto the mat. Drag a card to move it, flick it to send it
  sliding. Tap a card to open it, with arrows through the rest of its deck. When the page
  opens, the newest card from each deck is dealt, so the table starts with what's new.
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
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // A date as it's written on the card: "Nov 16, 2026", "2014", or "2019–2021" as given.
  const when = d => { const m = String(d || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/); return m ? `${MONTHS[+m[2] - 1]}${m[3] ? ' ' + +m[3] : ''}, ${m[1]}` : String(d || ''); };
  // Sorting: a full date as is; a year (or "2019–2021") as the middle of its last year.
  const sortKey = d => { const s = String(d || ''); if (/^\d{4}-\d{2}/.test(s)) return s.padEnd(10, '-15'); const y = s.match(/\d{4}/g); return y ? y[y.length - 1] + '-07-01' : '0000'; };

  /* ------------------------------------------------------------------ the decks */
  const SUITS = [
    { key: 'work', name: 'Work', pip: '★' },
    { key: 'posts', name: 'Posts', pip: '✱' },
    { key: 'words', name: 'Words', pip: '¶' },
    { key: 'art', name: 'Art', pip: '✎' },
    { key: 'music', name: 'Music', pip: '♪' }
  ];
  const suitOf = t => ({ work: 'work', post: 'posts', pic: 'posts', thought: 'posts', article: 'words', link: 'words', art: 'art', playlist: 'music' }[t] || 'posts');
  const CARDS = [
    ...S.work.map(w => ({ id: 'w-' + w.id, type: 'work', w, title: w.title, sub: w.client, date: w.year, img: ((w.images || [])[0] || {}).src })),
    ...FEED.filter(f => f && f.type),
    ...DRAW.map(([id, name, yr], i) => ({ id: 'd-' + id, type: 'art', title: name, date: yr, img: `media/hof/${id}.jpg`, i }))
  ].map(c => ({ ...c, suit: suitOf(c.type) }));
  const DECK = {};
  SUITS.forEach(s => {
    const cards = CARDS.filter(c => c.suit === s.key);
    // newest on top; the drawings keep their order, starting from Nolan Ryan
    const nr = cards.findIndex(c => c.id === 'd-nolan-ryan');
    const art = nr > 0 ? [...cards.slice(nr), ...cards.slice(0, nr)] : cards;
    DECK[s.key] = { suit: s, cards: s.key === 'art' ? art : cards.slice().sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date))), next: 0 };
  });

  /* ------------------------------------------------------------------ the faces */
  function face(c) {
    const pip = `<i class="pip">${SUITS.find(s => s.key === c.suit).pip}</i><i class="pip b">${SUITS.find(s => s.key === c.suit).pip}</i>`;
    let h = '';
    if (c.type === 'work') h = c.img
      ? `<span class="ph"><img src="${esc(c.img)}" alt="" draggable="false"></span><span class="lbl"><b>${esc(c.title)}</b><small>${esc(c.sub)} · ${esc(c.date)}</small></span>`
      : `<span class="slab"><b>${esc(c.title)}</b></span><span class="lbl"><small>${esc(c.sub)} · ${esc(c.date)}</small></span>`;
    else if (c.type === 'post') h = `<span class="who">${esc(c.source === 'Instagram' ? 'Instagram' : '@summeranne')}</span><span class="txt">${esc(c.text || '')}</span><span class="dt">${esc(when(c.date))}</span>`;
    else if (c.type === 'pic') h = `<span class="ph sq"><img src="${esc(c.img)}" alt="" draggable="false">${c.date ? `<span class="stamp">${esc(stamp(c.date))}</span>` : ''}</span><span class="cap">${esc(c.text || '')}</span>`;
    else if (c.type === 'thought') h = `<span class="txt">${esc(c.text)}</span><span class="dt">${esc(when(c.date))}</span>`;
    else if (c.type === 'article') h = `<span class="mast-c"><span>${esc(c.outlet)}</span><span>${esc(String(c.date || '').slice(0, 4))}</span></span><span class="hl">${esc(c.title)}</span><span class="by">By Summer Anne Burton</span>`;
    else if (c.type === 'link') h = `<span class="shared">Shared</span>${c.img ? `<span class="ph wide"><img src="${esc(c.img)}" alt="" draggable="false"></span>` : ''}<span class="site">${esc(c.site || '')}</span><span class="hl">${esc(c.title)}</span>${c.text ? `<span class="note">${esc(c.text)}</span>` : ''}`;
    else if (c.type === 'art') h = `<span class="ph art"><img src="${esc(c.img)}" alt="" draggable="false"></span><span class="lbl"><b>${esc(c.title)}</b><small>Every Hall of Famer</small></span>`;
    else if (c.type === 'playlist') h = `<span class="ph sq"><img src="${esc(c.img)}" alt="" draggable="false"></span><span class="lbl"><b>${esc(c.title)}</b><small>Playlist · ${esc(c.date)}</small></span>`;
    return `${pip}<span class="in">${h}</span>`;
  }
  const stamp = d => { const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/); return m ? [`'${m[1].slice(2)}`, m[2] && +m[2], m[3] && +m[3]].filter(Boolean).join(' ') : ''; };
  const label = c => ({ work: `${c.title}, ${c.sub}`, post: `Post: ${(c.text || '').slice(0, 80)}`, pic: c.text || 'A picture', thought: (c.text || '').slice(0, 80), article: c.title, link: `Shared: ${c.title}`, art: `Drawing of ${c.title}`, playlist: `Playlist: ${c.title}` }[c.type] || c.title || '');

  /* ------------------------------------------------------------------ the masthead */
  const LIGHT = new Set([2, 7, 11, 14]);
  $('#name').innerHTML = S.name.toUpperCase().split(' ').map((w, wi) => `<span class="word">${[...w].map((ch, i) => `<span class="ltr${LIGHT.has(wi * 6 + i) ? ' white' : ''}" style="--r:${rand(-5, 5).toFixed(1)}deg;--y:${rand(-3, 3).toFixed(1)}px">${esc(ch)}</span>`).join('')}</span>`).join(' ');
  $('#name').setAttribute('aria-label', S.name);
  $('#role').textContent = `${S.role} · ${S.city}`;
  $('#mail').href = `mailto:${S.email}`;
  if (S.available) { $('#avail').textContent = S.available; $('#avail').hidden = false; }

  // The photo booth strip: tap it and it takes three new pictures, with a flash each.
  const strip = $('#strip');
  const facePics = () => shuffle(FACES).slice(0, 3).map(f => f.src);
  strip.innerHTML = facePics().map(src => `<img src="${esc(src)}" alt="" draggable="false">`).join('');
  strip.addEventListener('click', () => {
    if (strip.dataset.busy || !FACES.length) return;
    strip.dataset.busy = '1';
    const pics = facePics(), f = $('#flash');
    $$('img', strip).forEach((img, i) => setTimeout(() => {
      if (!reduced) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
      img.src = pics[i];
      if (i === 2) setTimeout(() => { delete strip.dataset.busy; }, 300);
    }, reduced ? 0 : 200 + i * 480));
  });

  /* ------------------------------------------------------------------ the mat and the decks */
  const table = $('#cards'), decks = $('#decks');
  decks.innerHTML = SUITS.map(s => `<button class="deck d-${s.key}" type="button" data-suit="${s.key}" aria-label="${s.name}: deal a card">
      <span class="stack"><i></i><i></i><i class="top"><b>${s.pip}</b></i></span><span class="dname">${s.name}</span><span class="count" id="n-${s.key}"></span></button>`).join('');
  const counts = () => SUITS.forEach(s => { const d = DECK[s.key]; $('#n-' + s.key).textContent = `${Math.min(d.next, d.cards.length)}/${d.cards.length}`; $(`.d-${s.key}`).classList.toggle('done', d.next >= d.cards.length); });

  let L = {};
  function layout() {
    const W = innerWidth, H = innerHeight, phone = W < 700;
    const top = $('.mast').getBoundingClientRect().bottom + (phone ? 10 : 18);
    const bottom = decks.getBoundingClientRect().top - (phone ? 8 : 14);
    const cw = Math.round(clamp(Math.min(W * (phone ? .36 : .13), (bottom - top) * .56 * 5 / 7), phone ? 118 : 140, 210));
    L = { W, H, phone, top, bottom, cw, ch: Math.round(cw * 7 / 5), max: phone ? 8 : 12 };
    document.documentElement.style.setProperty('--cw', cw + 'px');
    // ruler numbers along the top and left edges of the mat, one every five squares
    $('#ruler-top').innerHTML = Array.from({ length: Math.ceil(W / 120) }, (_, i) => `<span style="left:${i * 120}px">${i}</span>`).join('');
    $('#ruler-left').innerHTML = Array.from({ length: Math.ceil(H / 120) }, (_, i) => `<span style="top:${i * 120}px">${i}</span>`).join('');
    onTable.forEach(t => { t.x = clamp(t.x, 4, W - L.cw - 4); t.y = clamp(t.y, L.top - L.ch * .3, L.bottom - L.ch * .7); place(t); });
  }

  /* ------------------------------------------------------------------ cards on the table */
  const onTable = []; // { c, el, x, y, a, vx, vy, va }
  let z = 10;
  const place = t => { t.el.style.transform = `translate(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px) rotate(${t.a.toFixed(2)}deg)`; };

  // Somewhere on the mat that isn't already covered much.
  function spot() {
    let best = null, bestScore = Infinity;
    for (let n = 0; n < 16; n++) {
      const x = rand(8, L.W - L.cw - 8), y = rand(L.top, Math.max(L.top + 1, L.bottom - L.ch));
      const score = onTable.reduce((s, t) => s + Math.max(0, L.cw - Math.abs(t.x - x)) * Math.max(0, L.ch - Math.abs(t.y - y)), 0);
      if (score < bestScore) { best = { x, y }; bestScore = score; }
    }
    return best;
  }

  function deal(key, opts = {}) {
    const d = DECK[key];
    if (!d.cards.length) return;
    if (d.next >= d.cards.length) d.next = 0; // back to the top of the deck
    const c = d.cards[d.next++];
    counts();
    // a card that's already out moves to the top instead of being dealt twice
    const already = onTable.find(t => t.c.id === c.id);
    if (already) { already.el.style.zIndex = ++z; bump(already); return; }
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `card t-${c.type} s-${c.suit}${c.type === 'work' && !c.img ? ' noimg' : ''}`;
    el.setAttribute('aria-label', label(c));
    el.innerHTML = face(c);
    el.style.zIndex = ++z;
    table.appendChild(el);
    const to = opts.at || spot();
    const t = { c, el, x: to.x, y: to.y, a: rand(-11, 11), vx: 0, vy: 0, va: 0 };
    onTable.push(t);
    const from = $(`.d-${key} .top`).getBoundingClientRect();
    if (reduced) place(t);
    else {
      el.animate([
        { transform: `translate(${from.left}px, ${from.top}px) rotate(0deg) scale(${from.width / L.cw})` },
        { transform: `translate(${t.x}px, ${t.y}px) rotate(${t.a}deg) scale(1)` }
      ], { duration: 520, easing: 'cubic-bezier(.2, .8, .25, 1)' });
      place(t);
    }
    // too many out: the one at the bottom of the pile goes back
    if (onTable.length > L.max) {
      const old = onTable.reduce((a, b) => (+a.el.style.zIndex < +b.el.style.zIndex ? a : b));
      sendBack(old);
    }
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
  const bump = t => { if (!reduced) t.el.animate([{ scale: '1' }, { scale: '1.06' }, { scale: '1' }], { duration: 260 }); };

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
  const letGo = () => {
    if (!held) return;
    const { t, moved, t0, trail } = held;
    held = null;
    t.el.classList.remove('held');
    if (moved < 6 && performance.now() - t0 < 400) return open(t.c);
    const [a, b] = [trail[0], trail[trail.length - 1]], dt = Math.max(16, b[2] - a[2]);
    t.vx = (b[0] - a[0]) / dt * 16; t.vy = (b[1] - a[1]) / dt * 16;
    t.va = clamp(t.vx * .12, -4, 4);
    if (!reduced) slide();
  };
  table.addEventListener('pointerup', letGo);
  table.addEventListener('pointercancel', letGo);
  table.addEventListener('click', e => { if (e.detail === 0) { const t = onTable.find(x => x.el === e.target.closest('.card')); if (t) open(t.c); } });

  // Flicked cards slide across the mat, slow down and bounce off its edges.
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
        t.vx *= .93; t.vy *= .93; t.va *= .9;
        const minX = 2, maxX = L.W - L.cw - 2, minY = L.top - L.ch * .3, maxY = L.bottom - L.ch * .55;
        if (t.x < minX || t.x > maxX) { t.x = clamp(t.x, minX, maxX); t.vx *= -.5; }
        if (t.y < minY || t.y > maxY) { t.y = clamp(t.y, minY, maxY); t.vy *= -.5; }
        place(t);
      });
      if (moving) requestAnimationFrame(step); else sliding = false;
    };
    requestAnimationFrame(step);
  }

  decks.addEventListener('click', e => { const b = e.target.closest('.deck'); if (b) deal(b.dataset.suit); });

  /* ------------------------------------------------------------------ a card, up close */
  const big = $('#big');
  let at = null;
  function open(c) {
    at = c;
    const d = DECK[c.suit], i = d.cards.indexOf(c), s = d.suit;
    big.innerHTML = `<article class="bigcard s-${c.suit} t-${c.type}">
      <button class="close" type="button" aria-label="Close">×</button>
      <div class="big-in">${inside(c)}</div>
      <nav class="big-nav"><button type="button" data-by="-1" aria-label="Previous ${s.name.toLowerCase()} card">←</button><span><i class="pip-s">${s.pip}</i> ${s.name} · ${i + 1} of ${d.cards.length}</span><button type="button" data-by="1" aria-label="Next ${s.name.toLowerCase()} card">→</button></nav>
    </article>`;
    $('.close', big).addEventListener('click', () => big.close());
    $$('.big-nav button', big).forEach(b => b.addEventListener('click', () => {
      const n = d.cards[(i + +b.dataset.by + d.cards.length) % d.cards.length];
      open(n);
    }));
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
    if (c.type === 'pic') return `<figure class="pic"><img src="${esc(c.img)}" alt="${esc(c.text || '')}">${c.date ? `<span class="stamp">${esc(stamp(c.date))}</span>` : ''}</figure>${c.text ? `<p class="say small">${esc(c.text)}</p>` : ''}<p class="meta">${esc(when(c.date))}</p>${c.url ? `<p class="links">${out(c.url, 'Original')}</p>` : ''}`;
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
      <button class="close" type="button" aria-label="Close">×</button>
      <div class="big-in"><div class="bb-back">
        <div class="bb-head"><h2>${esc(S.name)}</h2><span class="bb-pos">${esc(C.position)}</span></div>
        <div class="bb-vitals">${C.vitals.map(([k, v]) => `<span><b>${esc(k)}:</b> ${esc(v)}</span>`).join('')}</div>
        <table class="bb-table"><thead><tr><th>Year</th><th>Club</th><th>Position</th></tr></thead>
          <tbody>${C.rows.slice().reverse().map(r => `<tr>${r.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <div class="bb-totals">${C.totals.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
        ${C.fact ? `<p class="bb-fact">${esc(C.fact)}</p>` : ''}
      </div>
      <p class="links center"><a class="go solid" href="mailto:${esc(S.email)}">Email</a>${S.resume ? `<a class="go" href="${esc(S.resume)}">Résumé (PDF)</a>` : ''}${S.links.filter(l => l.label !== 'Every Hall of Famer').map(l => out(l.url, l.label)).join('')}</p></div>
    </article>`;
    $('.close', big).addEventListener('click', () => big.close());
    if (!big.open) big.showModal();
  }
  const route = () => { if (location.hash === '#cv') openCV(); };
  addEventListener('hashchange', route);
  $('#cv-link').addEventListener('click', e => { if (location.hash === '#cv') { e.preventDefault(); openCV(); } });

  /* ------------------------------------------------------------------ deal */
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layout, 120); });
  function start() {
    layout();
    counts();
    // the opening hand: the newest card from each deck, then one more piece of work and one more post
    const hand = ['work', 'posts', 'words', 'music', 'art', 'work', 'posts'].filter(k => DECK[k].cards.length);
    hand.forEach((k, n) => setTimeout(() => deal(k), reduced ? 0 : 250 + n * 170));
    route();
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start, start);
})();
