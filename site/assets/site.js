/*
  Summer Anne Burton's site, all on one page. It starts as a pile of real things that fall
  in with real weight (Matter.js does the physics; the things are ordinary HTML). They can
  be picked up, thrown and tapped open. Tidy lines everything up, and that's the index.
*/
(function () {
  const S = window.SAB;
  const WRITING = window.SAB_WRITING || [], PLAYLISTS = window.SAB_PLAYLISTS || [], FACES = window.SAB_FACES || [], DRIVE = window.SAB_DRIVE || [];
  const DRAWINGS = S.hof.drawings; // [id, name, year]
  const M = window.Matter;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rand = (a, b) => a + Math.random() * (b - a);
  const year = d => (d || '').slice(0, 4);
  const work = id => S.work.find(w => w.id === id);
  const spotify = (S.links.find(l => l.label === 'Spotify') || {}).url;
  $('#top-mail').href = `mailto:${S.email}`;

  /* ------------------------------------------------------------------ what's in the pile */
  // w and h are sizes at full scale. Each thing knows how to draw itself and what opening it does.
  const inPile = { writing: 5, drawings: 5, playlists: 5 };
  const pileDrawings = ['nolan-ryan', 'willie-mays', 'satchel-paige', 'rollie-fingers', 'ted-williams'];
  function things(small) {
    const T = [];
    S.name.toUpperCase().split(' ').forEach((word, wi) => [...word].forEach(ch => T.push({ type: 'letter', ch, word: wi, h: 150 })));

    const faces = shuffle(FACES);
    for (let s = 0; s < (small ? 1 : 2); s++) T.push({ type: 'strip', group: 'strips', w: 96, h: 386, pics: [0, 1, 2, 3].map(k => faces[(s * 4 + k) % faces.length].src) });
    if (DRIVE.length) T.push({ type: 'drive', group: 'drive', w: 184, h: 222, k: Math.floor(Math.random() * DRIVE.length) });

    S.work.forEach(w => {
      const img = (w.images || [])[0];
      T.push(img ? { type: 'print', group: 'work', id: w.id, w: 170, h: 250, src: img.src, title: w.title }
        : { type: 'card', group: 'work', id: w.id, w: 236, h: 150, title: w.title, meta: `${w.client} · ${w.year}` });
    });
    WRITING.filter(a => a.here).slice(0, small ? 3 : inPile.writing).forEach(a => T.push({ type: 'clip', group: 'writing', a, w: 216, h: 156 }));
    pileDrawings.slice(0, small ? 2 : inPile.drawings).forEach(id => { const i = DRAWINGS.findIndex(d => d[0] === id); if (i >= 0) T.push({ type: 'drawing', group: 'drawings', i, w: 150, h: 192 }); });
    PLAYLISTS.slice(0, small ? 3 : inPile.playlists).forEach((p, i) => T.push({ type: 'record', group: 'playlists', i, w: 128, h: 128 }));

    T.push({ type: 'card', group: 'me', id: 'cv', w: 236, h: 150, title: 'CV', meta: S.card.rows.slice().reverse().slice(0, 3).map(r => r[1]).join(' · ') });
    T.push({ type: 'card', group: 'me', id: 'email', w: 236, h: 150, title: 'Email', meta: S.email });
    return T;
  }

  // A date stamp the way old cameras printed them: '11 3 20.
  const stamp = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return [`'${y.slice(2)}`, m && +m, dd && +dd].filter(Boolean).join(' '); };
  const drivePic = k => { const p = DRIVE[k]; return `<span class="ph"><img src="${esc(p.src)}" alt="" draggable="false"><span class="stamp">${esc(stamp(p.date))}</span></span><span class="cap">${esc(p.words)}</span>`; };

  // The HTML for each thing. Sizes inside use cqw, so everything scales with the thing.
  function inner(t) {
    if (t.type === 'letter') return `<span>${esc(t.ch)}</span>`;
    let h = '';
    if (t.type === 'strip') h = t.pics.map(p => `<img src="${esc(p)}" alt="" draggable="false">`).join('');
    if (t.type === 'drive') h = drivePic(t.k);
    if (t.type === 'print') h = `<img src="${esc(t.src)}" alt="" draggable="false"><span class="cap">${esc(t.title)}</span>`;
    if (t.type === 'card') h = `<b>${esc(t.title)}</b><span>${esc(t.meta)}</span>`;
    if (t.type === 'drawing') h = `<img src="media/hof/${esc(DRAWINGS[t.i][0])}.jpg" alt="" draggable="false">`;
    if (t.type === 'clip') h = `<span class="m"><span>${esc(t.a.outlet)}</span><span>${esc(year(t.a.date))}</span></span><span class="h">${esc(t.a.title)}</span>`;
    if (t.type === 'record') h = `<img src="${esc(PLAYLISTS[t.i].cover)}" alt="" draggable="false">`;
    return `<span class="in">${h}</span>`;
  }
  const label = t => ({
    letter: t.ch, strip: 'Photo booth strip', drive: 'A random photo from the old hard drive', print: t.title, card: t.title,
    drawing: DRAWINGS[t.i] && `Drawing of ${DRAWINGS[t.i][1]}`, clip: t.a && t.a.title, record: PLAYLISTS[t.i] && `Playlist: ${PLAYLISTS[t.i].title}`
  }[t.type] || '');

  // What happens when something is tapped.
  function open(t, el) {
    if (t.type === 'letter') return hop(el);
    if (t.type === 'strip') return newStrip(t, el);
    if (t.type === 'drive') return nextPhoto(t, el);
    if (t.id === 'cv') { location.hash = 'cv'; return; }
    if (t.id === 'email') { location.href = `mailto:${S.email}`; return; }
    if (work(t.id)) { location.hash = `w/${t.id}`; return; }
    if (t.type === 'drawing') return drawing(t.i);
    if (t.type === 'clip') return read(t.a);
    if (t.type === 'record') return playlist(t.i);
  }
  const read = a => { if (a.here) location.href = `read.html?c=${encodeURIComponent(a.slug)}`; else window.open(a.url, '_blank', 'noopener'); };

  /* ------------------------------------------------------------------ the pile */
  const pile = $('#pile'), tidyView = $('#tidy-view');
  const small = innerWidth < 700;
  const T = things(small);
  let k = 1, engine = null, walls = [], running = false, tidy = false, z = 1000;
  const items = []; // { t, el, body, w, h }

  // Scale everything so the pile covers a bit under half the screen, whatever its size.
  function scaleFor(list) {
    const area = list.reduce((a, t) => a + (t.type === 'letter' ? t.h * t.h * .55 : t.w * t.h), 0);
    return Math.max(.42, Math.min(1.2, Math.sqrt(.42 * innerWidth * innerHeight / area)));
  }

  let stacked = false;
  function build() {
    k = scaleFor(T);
    const probe = document.createElement('canvas').getContext('2d'), ref = document.createElement('canvas').getContext('2d');
    // How wide the name is at this size. If it won't fit across the screen in one row, the
    // letters get smaller and the three words stack instead.
    ref.font = '900 100px "Big Shoulders Display"';
    const capOf = ch => (ref.measureText(ch).actualBoundingBoxAscent || 70) / 100;
    const wOf = ch => { const m = ref.measureText(ch); return ((m.actualBoundingBoxRight + m.actualBoundingBoxLeft) || m.width) / 100 / capOf(ch) + .06; };
    const words = S.name.toUpperCase().split(' ');
    const lh = 150 * k, rowW = words.join('').split('').reduce((a, ch) => a + wOf(ch) * lh + 3, 0) + lh * .9;
    let letterH = lh, wordH = [];
    if (rowW > innerWidth * .9) letterH = lh * innerWidth * .9 / rowW;
    stacked = letterH < 70;
    if (stacked) {
      // Stacked, each word is as tall as it can be and still fit across. Short words are held
      // back a little and spread out, so every row is the same width and holds up the next.
      const fit = words.map(w => innerWidth * .9 / [...w].reduce((a, ch) => a + wOf(ch) + .02, 0));
      const cap = Math.min(...fit) * 1.3;
      wordH = fit.map(h => Math.min(h, cap));
    }
    T.forEach((t, n) => {
      let w = t.w * k, h = t.h * k;
      if (t.type === 'letter') {
        // The letter's box is the letter itself, so the pile stacks tight. The cap height
        // fills the box, and the glyph is shifted so its top sits on the box's top.
        h = stacked ? wordH[t.word] : letterH;
        const fs = h * .97 / capOf(t.ch);
        probe.font = `900 ${fs}px "Big Shoulders Display"`;
        const mm = probe.measureText(t.ch);
        w = Math.max(h * .3, (mm.actualBoundingBoxRight + mm.actualBoundingBoxLeft || mm.width) + h * .06);
        t.fs = fs;
        t.lift = (mm.fontBoundingBoxAscent || fs * .95) - mm.actualBoundingBoxAscent - h * .015;
      }
      const el = document.createElement(t.type === 'letter' ? 'span' : 'button');
      el.className = `o o-${t.type}`;
      if (t.type === 'letter') { el.setAttribute('aria-hidden', 'true'); el.classList.toggle('white', /[AEO]/.test(t.ch) && n % 3 === 0); el.style.fontSize = t.fs + 'px'; el.style.setProperty('--lift', -t.lift + 'px'); }
      else el.setAttribute('aria-label', label(t));
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.innerHTML = inner(t);
      el.hidden = true;
      pile.appendChild(el);
      items.push({ t, el, w, h, body: null });
    });
  }

  function makeWalls() {
    if (walls.length) M.Composite.remove(engine.world, walls);
    const W = innerWidth, H = innerHeight, o = { isStatic: true, friction: .6 };
    walls = [M.Bodies.rectangle(W / 2, H + 60, W * 4, 120, o), M.Bodies.rectangle(-60, H / 2 - 2000, 120, H * 2 + 4000, o), M.Bodies.rectangle(W + 60, H / 2 - 2000, 120, H * 2 + 4000, o)];
    M.Composite.add(engine.world, walls);
  }

  function bodyFor(it, x, y, angle) {
    const letter = it.t.type === 'letter';
    const b = M.Bodies.rectangle(x, y, it.w, it.h, {
      angle, chamfer: { radius: Math.min(6, it.w * .03) }, restitution: .1, frictionAir: .018, frictionStatic: .8,
      density: letter ? .004 : .0012, friction: letter ? .9 : .55, sleepThreshold: 40
    });
    // Letters are heavy and hard to knock over, so the name stays readable under the pile.
    if (letter) M.Body.setInertia(b, b.inertia * 6);
    return b;
  }
  // When the name first lands, each letter holds still once it has come to rest, so the pile
  // can't shove the letters apart. Picking a letter up or shaking lets it go again.
  function settle(it) {
    const b = it.body;
    it.still = b.speed < .15 && b.angularSpeed < .01 ? (it.still || 0) + 1 : 0;
    if (it.still > 12) { M.Body.setStatic(b, true); it.pinMe = false; }
  }
  const unpin = it => { it.pinMe = false; if (it.body && it.body.isStatic) M.Body.setStatic(it.body, false); };

  // Everything falls in: the letters first, in order across the floor, then the rest on top.
  function drop() {
    const W = innerWidth, letters = items.filter(i => i.t.type === 'letter'), rest = shuffle(items.filter(i => i.t.type !== 'letter'));
    letters.forEach(it => { it.pinMe = true; });
    let delay = 0;
    if (stacked) {
      // Burton lands first, then Anne on top of it, then Summer on top of that.
      const row = W * .9;
      [2, 1, 0].forEach(wi => {
        const word = letters.filter(i => i.t.word === wi);
        const sp = word.length > 1 ? Math.max(2, (row - word.reduce((a, i) => a + i.w, 0)) / (word.length - 1)) : 0;
        let x = (W - word.reduce((a, i) => a + i.w, 0) - sp * (word.length - 1)) / 2;
        word.forEach(it => { const cx = x + it.w / 2; x += it.w + sp; setTimeout(() => add(it, cx, -it.h - 10, 0), delay); delay += 45; });
        delay += 650;
      });
      delay += 200;
    } else {
      const gap = letters[0] ? letters[0].h * .45 : 40;
      let x = Math.max(4, (W - letters.reduce((a, i) => a + i.w + 3, 0) - gap * 2) / 2);
      letters.forEach((it, n) => {
        if (n && it.t.word !== letters[n - 1].t.word) x += gap;
        const cx = x + it.w / 2;
        x += it.w + 3;
        setTimeout(() => add(it, cx, -it.h - rand(0, 40), 0), n * 70);
      });
      delay = letters.length * 70 + 250;
    }
    rest.forEach((it, n) => setTimeout(() => add(it, rand(it.w / 2 + 8, W - it.w / 2 - 8), -it.h - rand(0, 300), rand(-.7, .7)), delay + n * 100));
  }
  function add(it, x, y, a) {
    if (tidy) return;
    it.body = bodyFor(it, x, y, a);
    M.Composite.add(engine.world, it.body);
    it.el.hidden = false;
    place(it);
  }
  function place(it) {
    const b = it.body;
    it.el.style.transform = `translate(${(b.position.x - it.w / 2).toFixed(1)}px, ${(b.position.y - it.h / 2).toFixed(1)}px) rotate(${b.angle.toFixed(4)}rad)`;
  }

  function loop() {
    if (!running) return;
    M.Engine.update(engine, 1000 / 60);
    items.forEach(it => {
      if (!it.body || it.body.isSleeping) return;
      if (it.pinMe && !it.body.isStatic) settle(it);
      place(it);
    });
    requestAnimationFrame(loop);
  }
  const run = () => { if (engine && !running && !tidy) { running = true; requestAnimationFrame(loop); } };

  /* picking things up */
  let grab = null;
  pile.addEventListener('pointerdown', e => {
    const el = e.target.closest('.o');
    const it = el && items.find(i => i.el === el);
    if (!it || !it.body || tidy) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    unpin(it);
    M.Sleeping.set(it.body, false);
    const p = { x: e.clientX, y: e.clientY };
    const c = M.Constraint.create({ pointA: p, bodyB: it.body, pointB: { x: p.x - it.body.position.x, y: p.y - it.body.position.y }, stiffness: .18, damping: .08, length: 0 });
    c.angleB = it.body.angle;
    M.Composite.add(engine.world, c);
    el.style.zIndex = ++z;
    el.classList.add('held');
    grab = { it, c, x0: p.x, y0: p.y, t0: performance.now(), moved: 0 };
  });
  pile.addEventListener('pointermove', e => {
    if (!grab) return;
    grab.c.pointA = { x: e.clientX, y: e.clientY };
    grab.moved = Math.max(grab.moved, Math.hypot(e.clientX - grab.x0, e.clientY - grab.y0));
  });
  const letGo = () => {
    if (!grab) return;
    M.Composite.remove(engine.world, grab.c);
    grab.it.el.classList.remove('held');
    const tap = grab.moved < 6 && performance.now() - grab.t0 < 450;
    const it = grab.it;
    grab = null;
    if (tap) open(it.t, it.el);
  };
  pile.addEventListener('pointerup', letGo);
  pile.addEventListener('pointercancel', letGo);
  // Keyboard: the things are buttons, so Enter opens them.
  pile.addEventListener('click', e => { if (e.detail === 0) { const el = e.target.closest('.o'); const it = el && items.find(i => i.el === el); if (it) open(it.t, el); } });

  function hop(el) {
    const it = items.find(i => i.el === el);
    if (tidy) { if (!reduced) el.animate([{ translate: '0 0' }, { translate: '0 -22%' }, { translate: '0 0' }], { duration: 420, easing: 'cubic-bezier(.3, .7, .4, 1)' }); return; }
    if (!it || !it.body) return;
    unpin(it);
    M.Sleeping.set(it.body, false);
    M.Body.setVelocity(it.body, { x: rand(-3, 3), y: -14 });
    M.Body.setAngularVelocity(it.body, rand(-.25, .25));
  }
  function shake() {
    if (tidy) setTidy(false);
    items.forEach(it => {
      if (!it.body) return;
      unpin(it);
      M.Sleeping.set(it.body, false);
      M.Body.setVelocity(it.body, { x: rand(-14, 14), y: rand(-26, -10) });
      M.Body.setAngularVelocity(it.body, rand(-.35, .35));
    });
  }

  /* ------------------------------------------------------------------ the photo booth */
  // A tapped strip goes off again: four new pictures, one at a time, each with its own flash.
  function newStrip(t, el) {
    if (el.dataset.busy) return;
    el.dataset.busy = '1';
    const imgs = $$('img', el), now = imgs.map(i => i.getAttribute('src'));
    const pics = shuffle(FACES.map(x => x.src).filter(src => !now.includes(src))).concat(shuffle(now)).slice(0, imgs.length);
    if (t) t.pics = pics;
    const f = $('#flash'), gap = reduced ? 0 : 520;
    imgs.forEach((img, i) => setTimeout(() => {
      if (!reduced) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
      img.classList.remove('snap'); void img.offsetWidth;
      img.src = pics[i];
      if (!reduced) img.classList.add('snap');
      if (i === imgs.length - 1) setTimeout(() => { delete el.dataset.busy; }, 300);
    }, 250 + i * gap));
  }

  /* ------------------------------------------------------------------ the old hard drive */
  // Tapping the print turns it over and there's another photo on it.
  function nextPhoto(t, el) {
    if (el.dataset.busy || DRIVE.length < 2) return;
    el.dataset.busy = '1';
    let n = t.k;
    while (n === t.k) n = Math.floor(Math.random() * DRIVE.length);
    t.k = n;
    const img = new Image();
    img.src = DRIVE[n].src;
    const swap = () => { $('.in', el).innerHTML = drivePic(n); };
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (reduced) { swap(); delete el.dataset.busy; return; }
      const a = $('.in', el).animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 160, easing: 'ease-in' });
      a.onfinish = () => {
        swap();
        $('.in', el).animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 200, easing: 'ease-out' }).onfinish = () => { delete el.dataset.busy; };
      };
    });
  }

  /* ------------------------------------------------------------------ tidy */
  // Lining everything up: each thing slides from where it landed to its place in the rows.
  // Each row also lists the rest of what's there.
  function tidyLayout() {
    const shown = new Set(items.filter(it => it.t.type === 'clip').map(it => it.t.a.slug));
    const rest = WRITING.filter(a => !shown.has(a.slug));
    tidyView.innerHTML = `<div class="t-name">${S.name.split(' ').map((_, wi) => `<span class="t-word" data-w="${wi}"></span>`).join('')}</div>
      <p class="t-role">${esc(S.role)} · ${esc(S.city)}</p>
      <div class="t-me"><div class="t-strips" data-g="strips"></div><div class="t-row t-drive" data-g="drive"></div><div class="t-row t-cards" data-g="me"></div></div>
      <section class="t-group" id="t-work"><h2 class="t-head">Work</h2><div class="t-row" data-g="work"></div></section>
      <section class="t-group" id="t-writing"><h2 class="t-head">Writing</h2><div class="t-row" data-g="writing"></div>
        ${rest.length ? `<ul class="t-list">${rest.map((a, n) => `<li><a href="${a.here ? `read.html?c=${esc(a.slug)}` : esc(a.url)}"${a.here ? '' : ' target="_blank" rel="noopener"'}>${esc(a.title)}${a.here ? '' : ' ↗'}</a><span>${esc(a.outlet)}${year(a.date) ? `, ${esc(year(a.date))}` : ''}</span></li>`).join('')}</ul>` : ''}</section>
      <section class="t-group" id="t-drawings"><h2 class="t-head">Drawings</h2><div class="t-row" data-g="drawings"></div>
        <p class="t-more"><button class="t-all" type="button">All ${DRAWINGS.length}</button><a href="${esc(S.hof.url)}" target="_blank" rel="noopener">Every Hall of Famer ↗</a></p></section>
      <section class="t-group" id="t-playlists"><h2 class="t-head">Playlists</h2><div class="t-row" data-g="playlists"></div>
        ${spotify ? `<p class="t-more"><a href="${esc(spotify)}" target="_blank" rel="noopener">More on Spotify ↗</a></p>` : ''}</section>`;
    $('.t-all', tidyView).addEventListener('click', () => drawing(0));
  }
  // The strips from the pile slide in and one more prints out after them. Each strip is a reel
  // of faces in hair-color order: moving across one, or scrolling, rolls it on a picture.
  const N = FACES.length;
  function booth() {
    const row = $('.t-strips', tidyView);
    const strips = items.filter(it => it.t.type === 'strip');
    if (!row || !strips.length || !N) return;
    FACES.forEach(f => { new Image().src = f.src; });
    const w = strips[0].w, h = strips[0].h, want = small ? 2 : 3;
    for (let i = strips.length; i < want; i++) {
      const el = document.createElement('button');
      el.className = 'o o-strip t-extra';
      el.setAttribute('aria-label', 'Photo booth strip');
      el.style.width = w + 'px'; el.style.height = h + 'px';
      el.style.animationDelay = (reduced ? 0 : 700 + (i - strips.length) * 140) + 'ms';
      el.innerHTML = `<span class="in">${[0, 1, 2, 3].map(() => '<img src="" alt="" draggable="false">').join('')}</span>`;
      row.appendChild(el);
    }
    $$('.o-strip', row).forEach((el, i) => {
      el.style.setProperty('--r', rand(-2.4, 2.4).toFixed(2) + 'deg');
      el.dataset.pos = (i * 5 + Math.floor(rand(0, 4))) % N;
      if (el.classList.contains('t-extra')) reel(el, 0);
    });
  }
  function reel(el, by) {
    if (el.dataset.busy) return;
    const pos = (+el.dataset.pos + by + N) % N;
    el.dataset.pos = pos;
    $$('img', el).forEach((img, j) => { img.src = FACES[(pos + j) % N].src; });
    const it = items.find(i => i.el === el);
    if (it) it.t.pics = $$('img', el).map(img => img.getAttribute('src'));
  }
  let rolled = 0, lastY = 0;
  tidyView.addEventListener('pointermove', e => {
    if (!tidy || e.pointerType !== 'mouse') return;
    const el = e.target.closest('.t-strips .o-strip');
    if (!el) return;
    rolled += Math.abs(e.movementX) + Math.abs(e.movementY);
    if (rolled > 26) { rolled = 0; reel(el, e.movementY < 0 ? -1 : 1); }
  });
  addEventListener('scroll', () => {
    if (!tidy) return;
    const y = scrollY, strips = $$('.t-strips .o-strip', tidyView);
    if (!strips.length || Math.abs(y - lastY) < 40) return;
    const dir = y > lastY ? 1 : -1;
    lastY = y;
    reel(strips[Math.floor(rand(0, strips.length))], dir);
  }, { passive: true });
  // Everything in Tidy opens the same way it does in the pile.
  tidyView.addEventListener('click', e => {
    const el = e.target.closest('.o');
    if (!el || !tidy) return;
    const it = items.find(i => i.el === el);
    if (el.classList.contains('o-strip')) return newStrip(it && it.t, el);
    if (it) open(it.t, el);
  });

  function setTidy(on) {
    if (on === tidy) return;
    const first = new Map(items.map(it => [it, it.el.getBoundingClientRect()]));
    if (on) {
      tidy = true; running = false; lastY = scrollY;
      tidyLayout();
      tidyView.hidden = false;
      document.body.classList.add('is-tidy');
      items.forEach(it => {
        it.el.hidden = false;
        const box = it.t.type === 'letter' ? $(`.t-word[data-w="${it.t.word}"]`, tidyView) : $(`[data-g="${it.t.group}"]`, tidyView);
        box.appendChild(it.el);
        it.el.style.transform = '';
      });
      booth();
      flip(first, it => it.body ? it.body.angle : 0);
      setTimeout(() => { if (tidy) items.forEach(it => { it.el.style.transition = ''; }); }, 1500);
    } else {
      // Back to the pile: everything drops from where it sits now.
      if (/^#(work|writing|drawings|playlists)$/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo(0, 0);
      const now = new Map(items.map(it => [it, it.el.getBoundingClientRect()]));
      items.forEach(it => { pile.appendChild(it.el); it.el.style.transition = 'none'; });
      tidyView.hidden = true;
      document.body.classList.remove('is-tidy');
      tidy = false;
      items.forEach(it => {
        const r = now.get(it);
        const x = Math.min(innerWidth - it.w / 2, Math.max(it.w / 2, r.left + r.width / 2));
        const y = r.top > innerHeight ? -it.h - rand(0, 500) : r.top + r.height / 2;
        if (!it.body) { it.body = bodyFor(it, x, y, 0); M.Composite.add(engine.world, it.body); }
        unpin(it);
        M.Body.setPosition(it.body, { x, y });
        M.Body.setAngle(it.body, 0);
        M.Body.setVelocity(it.body, { x: 0, y: 0 });
        M.Body.setAngularVelocity(it.body, rand(-.05, .05));
        M.Sleeping.set(it.body, false);
        place(it);
      });
      run();
    }
    $('#tidy').setAttribute('aria-pressed', String(tidy));
    $('#tidy').textContent = tidy ? 'Mess' : 'Tidy';
  }
  function flip(first, angleOf) {
    items.forEach(it => {
      const a = first.get(it), b = it.el.getBoundingClientRect();
      if (!a || !a.width) return;
      it.el.style.transition = 'none';
      it.el.style.transform = `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) rotate(${angleOf(it)}rad)`;
    });
    void document.body.offsetWidth;
    items.forEach((it, n) => {
      it.el.style.transition = reduced ? 'none' : `transform .8s cubic-bezier(.2, .9, .25, 1) ${Math.min(n, 40) * 12}ms`;
      it.el.style.transform = '';
    });
  }

  /* ------------------------------------------------------------------ closer looks */
  const sheet = $('#sheet');
  function showSheet(html, wide) {
    sheet.innerHTML = `<div class="sheet"><button class="close" aria-label="Close">×</button>${html}</div>`;
    sheet.classList.toggle('narrow', !wide);
    $('.close', sheet).addEventListener('click', () => sheet.close());
    if (!sheet.open) sheet.showModal();
    $('.sheet', sheet).scrollTop = 0;
  }
  sheet.addEventListener('close', () => { if (/^#(w\/|cv)/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); });
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  function openWork(id) {
    const i = S.work.findIndex(w => w.id === id), t = S.work[i];
    if (!t) return;
    const prev = S.work[i - 1], next = S.work[i + 1];
    const pics = (t.images || []).map(im => `<figure><img src="${esc(im.src)}" alt="${esc(im.alt || '')}">${im.caption ? `<figcaption>${esc(im.caption)}</figcaption>` : ''}</figure>`).join('');
    showSheet(`<div class="sheet-in ${pics ? '' : 'no-pics'}">
        <div class="sheet-text">
          <p class="sheet-meta">${esc(t.client)} · ${esc(t.year)}</p>
          <h2>${esc(t.title)}</h2>
          ${(t.words || []).map(p => `<p class="words">${esc(p)}</p>`).join('')}
          ${(t.quotes || []).map(q => `<blockquote><p>“${esc(q.text)}”</p><cite>${esc(q.who)}</cite></blockquote>`).join('')}
          ${(t.links || []).length ? `<p class="sheet-links">${t.links.map(l => `<a href="${esc(l.url)}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`).join('')}</p>` : ''}
        </div>
        ${pics ? `<div class="sheet-pics">${pics}</div>` : ''}
      </div>
      <nav class="sheet-nav">${prev ? `<a href="#w/${esc(prev.id)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="#w/${esc(next.id)}">${esc(next.title)} →</a>` : '<span></span>'}</nav>`, true);
  }

  // The CV is the back of a baseball card.
  function openCV() {
    const C = S.card;
    showSheet(`<div class="bb-back">
      <div class="bb-head"><h2>${esc(S.name)}</h2><span class="bb-pos">${esc(C.position)}</span></div>
      <div class="bb-vitals">${C.vitals.map(([k, v]) => `<span><b>${esc(k)}:</b> ${esc(v)}</span>`).join('')}</div>
      <table class="bb-table"><thead><tr><th>Year</th><th>Club</th><th>Position</th></tr></thead>
        <tbody>${C.rows.slice().reverse().map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="bb-totals">${C.totals.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
      ${C.fact ? `<p class="bb-fact">${esc(C.fact)}</p>` : ''}
    </div>
    <p class="card-foot"><a href="mailto:${esc(S.email)}">Email</a>${S.resume ? `<a href="${esc(S.resume)}">Résumé (PDF)</a>` : ''}${S.links.filter(l => l.label !== 'Every Hall of Famer').map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</p>`);
  }

  function playlist(i) {
    const p = PLAYLISTS[i];
    if (!p) return;
    showSheet(`<div class="pl">
      <img src="${esc(p.cover)}" alt="Cover of ${esc(p.title)}">
      <div><p class="sheet-meta">${esc(p.year || 'Playlist')}</p><h2>${esc(p.title)}</h2>${p.note ? `<p class="words">${esc(p.note)}</p>` : ''}
      <iframe class="spotify" title="${esc(p.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(p.id)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>
    </div>`);
  }

  // Drawings open one at a time, with arrows through all of them.
  const lb = $('#lightbox');
  let lbAt = 0;
  function drawing(i) {
    lbAt = (i + DRAWINGS.length) % DRAWINGS.length;
    const [id, name, yr] = DRAWINGS[lbAt];
    lb.innerHTML = `<div class="lb"><button class="close" aria-label="Close">×</button>
      <img src="media/hof/${esc(id)}.jpg" alt="Summer’s drawing of ${esc(name)}">
      <div class="lb-bar"><button class="lb-go" data-by="-1" aria-label="Previous drawing">←</button><p>${esc(name)}, ${esc(yr)} <span>${lbAt + 1} / ${DRAWINGS.length}</span></p><button class="lb-go" data-by="1" aria-label="Next drawing">→</button></div></div>`;
    $('.close', lb).addEventListener('click', () => lb.close());
    $$('.lb-go', lb).forEach(b => b.addEventListener('click', () => drawing(lbAt + +b.dataset.by)));
    if (!lb.open) lb.showModal();
  }
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') drawing(lbAt + 1); if (e.key === 'ArrowLeft') drawing(lbAt - 1); });

  /* ------------------------------------------------------------------ links in */
  // #work, #writing, #drawings, #playlists: Tidy, scrolled to that row. #cv and #w/<id> open.
  function go(name) {
    const was = tidy;
    setTidy(true);
    const el = $('#t-' + name);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: reduced || !was ? 'auto' : 'smooth', block: 'start' }), was ? 0 : 60);
  }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('w/')) return openWork(h.slice(2));
    if (h === 'cv') return openCV();
    if (sheet.open) sheet.close();
    if (/^(work|writing|drawings|playlists)$/.test(h) && engine) go(h);
  }
  addEventListener('hashchange', route);
  // The nav jumps even when its link is already the address.
  $$('.top-nav a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href').slice(1);
    if (location.hash === '#' + h && h !== 'cv') { e.preventDefault(); go(h); }
  }));

  /* ------------------------------------------------------------------ start */
  function start() {
    build();
    engine = M.Engine.create({ enableSleeping: true, positionIterations: 12, velocityIterations: 8 });
    engine.gravity.y = 1.1;
    makeWalls();
    $('#tidy').addEventListener('click', () => setTidy(!tidy));
    $('#shake').addEventListener('click', shake);
    let resizeT;
    addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        makeWalls();
        items.forEach(it => {
          if (!it.body) return;
          const p = it.body.position;
          M.Body.setPosition(it.body, { x: Math.min(innerWidth - it.w / 2, Math.max(it.w / 2, p.x)), y: Math.min(innerHeight - it.h / 2, p.y) });
          M.Sleeping.set(it.body, false);
        });
      }, 150);
    });
    const h = location.hash.slice(1);
    if (reduced || /^(work|writing|drawings|playlists)$/.test(h)) { setTidy(true); route(); return; }
    drop();
    run();
    route();
  }
  // The letters are measured in the real font, so wait for it before anything falls.
  (document.fonts ? document.fonts.load('900 100px "Big Shoulders Display"').then(() => document.fonts.ready) : Promise.resolve()).then(start, start);
})();
