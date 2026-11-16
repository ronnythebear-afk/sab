/*
  The front page is a pile of real things: the name in cut-out letters, photo booth strips,
  prints from the work, drawings, clippings, records, and index cards for the CV and email.
  Everything falls in with real weight (Matter.js does the physics; the things themselves
  are ordinary HTML), can be picked up and thrown, and Tidy lines it all up, name first.
*/
(function () {
  const S = window.SAB;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rand = (a, b) => a + Math.random() * (b - a);
  const FACES = window.SAB_FACES || [], PLAYLISTS = window.SAB_PLAYLISTS || [], CLIPS = window.SAB_CLIPS || {};
  const M = window.Matter;
  const work = id => S.work.find(w => w.id === id);
  $('#top-mail').href = `mailto:${S.email}`;

  /* ------------------------------------------------------------------ what's in the pile */
  // w and h are sizes at full scale. Each thing knows how to draw itself and what opening it does.
  function things(small) {
    const T = [];
    S.name.toUpperCase().split(' ').forEach((word, wi) => [...word].forEach(ch => T.push({ type: 'letter', ch, word: wi, h: 150 })));

    const faces = shuffle(FACES);
    for (let s = 0; s < (small ? 2 : 4); s++) T.push({ type: 'strip', group: 'me', w: 96, h: 386, pics: [0, 1, 2, 3].map(k => faces[(s * 4 + k) % faces.length].src) });

    const prints = ['paper-dress', 'visit-tomorrow', 'summer-villa', 'dolce-delivery', 'streak-shop', 'tell-show', 'video', 'originals'];
    const cards = ['she-does', 'daisy-jones', 'ai-at-praytell', 'tenderly'];
    (small ? prints.slice(0, 4) : prints).forEach(id => { const w = work(id); if (w) T.push({ type: 'print', group: 'work', id, w: 170, h: 250, src: w.images[0].src, title: w.title }); });
    (small ? cards.slice(0, 2) : cards).forEach(id => { const w = work(id); if (w) T.push({ type: 'card', group: 'work', id, w: 236, h: 150, title: w.title, meta: `${w.client} · ${w.year}` }); });

    const drawn = ['nolan-ryan', 'willie-mays', 'satchel-paige', 'rollie-fingers', 'hilton-smith', 'ted-williams'];
    (small ? drawn.slice(0, 2) : drawn).forEach(id => { const d = S.hof.drawings.find(x => x[0] === id); if (d) T.push({ type: 'drawing', group: 'drawings', id, name: d[1], year: d[2], w: 150, h: 192 }); });

    const clips = ['the-year-without-esme', 'crush-mixtapes', 'social-networking-a-love-story', 'what-vine-did-for-us', 'prompting-creativity', 'the-33-best-forgotten-teen-shows-of-the-90s'];
    (small ? clips.slice(0, 3) : clips).forEach(slug => { const c = S.clippings.find(x => x.slug === slug); if (c && CLIPS[slug]) T.push({ type: 'clip', group: 'writing', slug, c, w: 216, h: 156 }); });

    PLAYLISTS.slice(0, small ? 3 : 6).forEach((p, i) => T.push({ type: 'record', group: 'playlists', i, w: 128, h: 128 }));

    T.push({ type: 'card', group: 'me', id: 'cv', w: 236, h: 150, title: 'CV', meta: S.card.rows.slice().reverse().slice(0, 3).map(r => r[1]).join(' · ') });
    T.push({ type: 'card', group: 'me', id: 'email', w: 236, h: 150, title: 'Email', meta: S.email });
    return T;
  }

  // The HTML for each thing. Sizes inside use cqw, so everything scales with the thing.
  function html(t) {
    if (t.type === 'letter') return `<span>${esc(t.ch)}</span>`;
    return `<span class="in">${inner(t)}</span>`;
  }
  function inner(t) {
    if (t.type === 'strip') return t.pics.map(p => `<img src="${esc(p)}" alt="" draggable="false">`).join('');
    if (t.type === 'print') return `<img src="${esc(t.src)}" alt="" draggable="false"><span class="cap">${esc(t.title)}</span>`;
    if (t.type === 'card') return `<b>${esc(t.title)}</b><span>${esc(t.meta)}</span>`;
    if (t.type === 'drawing') return `<img src="media/hof/${esc(t.id)}.jpg" alt="" draggable="false">`;
    if (t.type === 'clip') return `<span class="m"><span>${esc(t.c.outlet)}</span><span>${esc((t.c.date || '').slice(0, 4))}</span></span><span class="h">${esc(t.c.title)}</span>`;
    if (t.type === 'record') return `<img src="${esc(PLAYLISTS[t.i].cover)}" alt="" draggable="false">`;
    return '';
  }
  const label = t => ({
    letter: t.ch, strip: 'Photo booth strip', print: t.title, card: t.title, drawing: `Drawing of ${t.name}`,
    clip: t.c && t.c.title, record: PLAYLISTS[t.i] && `Playlist: ${PLAYLISTS[t.i].title}`
  }[t.type] || '');

  // What happens when something is picked up and put down without moving.
  function open(t, el) {
    if (t.type === 'letter') { hop(el); return; }
    if (t.type === 'strip') { newStrip(t, el); return; }
    if (t.type === 'print' || (t.type === 'card' && work(t.id))) { location.hash = `w/${t.id}`; return; }
    if (t.id === 'cv') { location.hash = 'cv'; return; }
    if (t.id === 'email') { location.href = `mailto:${S.email}`; return; }
    if (t.type === 'drawing') { lightbox(`media/hof/${t.id}.jpg`, `${t.name}, ${t.year}`, `Summer’s drawing of ${t.name}`); return; }
    if (t.type === 'clip') { location.href = `read.html?c=${encodeURIComponent(t.slug)}`; return; }
    if (t.type === 'record') playlist(t.i);
  }

  /* ------------------------------------------------------------------ the pile */
  const pile = $('#pile'), tidyView = $('#tidy-view');
  const small = innerWidth < 700;
  const T = things(small);
  let k = 1, engine = null, walls = [], wantCeiling = false, ceiling = null, running = false, tidy = false, z = 1000;
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
    // Shrink the row to fit if it only needs a little; stack the words if it needs a lot.
    if (rowW > innerWidth * .9) letterH = lh * innerWidth * .9 / rowW;
    stacked = letterH < 70;
    if (stacked) {
      // Stacked, each word is as tall as it can be and still fit across. Short words are
      // held back a little and their letters spread out, so every row is the same width
      // and holds up the one above it.
      const fit = words.map(w => innerWidth * .9 / [...w].reduce((a, ch) => a + wOf(ch) + .02, 0));
      const cap = Math.min(...fit) * 1.3;
      wordH = fit.map(h => Math.min(h, cap));
    }
    T.forEach((t, n) => {
      let w = t.w * k, h = t.h * k;
      if (t.type === 'letter') {
        // Size the letter's box to the letter itself, so the pile stacks tight. The cap
        // height fills the box, and the glyph is shifted so its top sits on the box's top.
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
      el.innerHTML = html(t);
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
    if (ceiling) M.Composite.remove(engine.world, ceiling);
    if (wantCeiling) { ceiling = M.Bodies.rectangle(W / 2, -60, W * 4, 120, o); M.Composite.add(engine.world, ceiling); }
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
  // can't shove the letters apart. Picking a letter up, shaking or tilting lets it go again.
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
    if (stacked) {
      // Burton lands first, then Anne on top of it, then Summer on top of that.
      let delay = 0;
      const row = W * .9;
      [2, 1, 0].forEach(wi => {
        const word = letters.filter(i => i.t.word === wi);
        const sp = word.length > 1 ? Math.max(2, (row - word.reduce((a, i) => a + i.w, 0)) / (word.length - 1)) : 0;
        let x = (W - word.reduce((a, i) => a + i.w, 0) - sp * (word.length - 1)) / 2;
        word.forEach(it => { const cx = x + it.w / 2; x += it.w + sp; setTimeout(() => add(it, cx, -it.h - 10, 0), delay); delay += 45; });
        delay += 650;
      });
      rest.forEach((it, n) => setTimeout(() => add(it, rand(it.w / 2 + 6, W - it.w / 2 - 6), -it.h - rand(0, 300), rand(-.7, .7)), delay + 200 + n * 110));
      return;
    }
    const gap = letters[0] ? letters[0].h * .45 : 40;
    const totalW = letters.reduce((a, i) => a + i.w + 3, 0) + gap * 2;
    let x = Math.max(4, (W - totalW) / 2);
    letters.forEach((it, n) => {
      if (n && it.t.word !== letters[n - 1].t.word) x += gap;
      const cx = x + it.w / 2;
      x += it.w + 3;
      setTimeout(() => add(it, cx, -it.h - rand(0, 40), 0), n * 70);
    });
    rest.forEach((it, n) => setTimeout(() => add(it, rand(it.w / 2 + 10, W - it.w / 2 - 10), -it.h - rand(0, 300), rand(-.7, .7)), letters.length * 70 + 250 + n * 95));
  }
  function add(it, x, y, a) {
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
  const run = () => { if (engine && !running && !tidy && !document.body.classList.contains('in-room')) { running = true; requestAnimationFrame(loop); } };

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

  // A photo booth strip that's tapped goes off again: four new pictures, one at a time,
  // each with its own flash, the way a real booth takes them.
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

  /* tilting a phone moves the pile */
  function tilt() {
    const on = e => {
      if (e.gamma == null) return;
      engine.gravity.x = Math.max(-1, Math.min(1, e.gamma / 35));
      engine.gravity.y = Math.max(-1, Math.min(1, e.beta / 35));
      items.forEach(it => it.body && M.Sleeping.set(it.body, false));
    };
    const start = () => {
      if (!wantCeiling) { wantCeiling = true; makeWalls(); }
      items.forEach(unpin);
      addEventListener('deviceorientation', on);
      $('#tilt').setAttribute('aria-pressed', 'true');
    };
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === 'function') D.requestPermission().then(r => { if (r === 'granted') start(); }).catch(() => {});
    else start();
  }

  /* ------------------------------------------------------------------ tidy */
  // Lining everything up: each thing slides from where it landed to its place in the rows.
  function tidyLayout() {
    const groups = [['work', 'Work', '#work'], ['writing', 'Writing', '#clippings'], ['drawings', 'Drawings', '#drawings'], ['playlists', 'Playlists', '#playlists']];
    tidyView.innerHTML = `<div class="t-name">${S.name.split(' ').map((_, wi) => `<span class="t-word" data-w="${wi}"></span>`).join('')}</div>
      <p class="t-role">${esc(S.role)} · ${esc(S.city)}</p>
      <div class="t-me"><div class="t-strips" data-g="strips"></div><div class="t-row t-cards" data-g="me"></div></div>
      ${groups.map(([g, l, href]) => `<section class="t-group"><a class="t-head" href="${href}">${l} →</a><div class="t-row" data-g="${g}"></div></section>`).join('')}`;
  }
  // In Tidy the strips fill a whole row. The ones from the pile slide in, more print out
  // after them, and each strip is a reel of faces in hair-color order: moving across a
  // strip, or scrolling the page, rolls it on a picture. Tapping one takes four new ones.
  const N = FACES.length;
  function booth() {
    const row = $('.t-strips', tidyView);
    const strips = items.filter(it => it.t.type === 'strip');
    if (!row || !strips.length || !N) return;
    FACES.forEach(f => { new Image().src = f.src; });
    const w = strips[0].w, h = strips[0].h, gap = parseFloat(getComputedStyle(row).columnGap) || 14;
    const fit = Math.max(strips.length, Math.floor((row.clientWidth + gap) / (w + gap)));
    for (let i = strips.length; i < fit; i++) {
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
      el.dataset.pos = (i * 4 + Math.floor(rand(0, 3))) % N;
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
    if (!strips.length || Math.abs(y - lastY) < 30) return;
    const dir = y > lastY ? 1 : -1, steps = Math.floor(Math.abs(y - lastY) / 30);
    lastY = y;
    for (let n = 0; n < Math.min(steps, strips.length); n++) reel(strips[Math.floor(rand(0, strips.length))], dir);
  }, { passive: true });
  // Everything in Tidy opens the same way it does in the pile. Letters jump.
  tidyView.addEventListener('click', e => {
    const el = e.target.closest('.o');
    if (!el || !tidy) return;
    const it = items.find(i => i.el === el);
    if (el.classList.contains('o-strip')) { newStrip(it && it.t, el); return; }
    if (!it) return;
    if (it.t.type === 'letter') { if (!reduced) el.animate([{ translate: '0 0' }, { translate: '0 -22%' }, { translate: '0 0' }], { duration: 420, easing: 'cubic-bezier(.3, .7, .4, 1)' }); return; }
    open(it.t, el);
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
        const box = it.t.type === 'letter' ? $(`.t-word[data-w="${it.t.word}"]`, tidyView)
          : it.t.type === 'strip' ? $('.t-strips', tidyView) : $(`.t-row[data-g="${it.t.group}"]`, tidyView);
        box.appendChild(it.el);
        it.el.style.transform = '';
      });
      booth();
      flip(first, it => it.body ? it.body.angle : 0);
      setTimeout(() => { if (tidy) items.forEach(it => { it.el.style.transition = ''; }); }, 1500);
    } else {
      // Back to the pile: everything drops from where it sits now.
      window.scrollTo(0, 0);
      const now = new Map(items.map(it => [it, it.el.getBoundingClientRect()]));
      items.forEach(it => { pile.appendChild(it.el); it.el.style.transition = 'none'; });
      tidyView.hidden = true;
      document.body.classList.remove('is-tidy');
      tidy = false;
      items.forEach(it => {
        const r = now.get(it);
        const below = r.top > innerHeight;
        const x = Math.min(innerWidth - it.w / 2, Math.max(it.w / 2, r.left + r.width / 2));
        const y = below ? -it.h - rand(0, 500) : r.top + r.height / 2;
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

  /* ------------------------------------------------------------------ start */
  function start() {
    build();
    engine = M.Engine.create({ enableSleeping: true, positionIterations: 12, velocityIterations: 8 });
    engine.gravity.y = 1.1;
    makeWalls();
    $('#tidy').addEventListener('click', () => setTidy(!tidy));
    $('#shake').addEventListener('click', shake);
    if (matchMedia('(pointer: coarse)').matches && window.DeviceOrientationEvent) { $('#tilt').hidden = false; $('#tilt').addEventListener('click', tilt); }
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
    if (reduced) { setTidy(true); return; }
    drop();
    run();
  }

  /* ------------------------------------------------------------------ the rooms behind it */
  const rooms = $$('.room');
  const bar = document.createElement('header');
  bar.className = 'bar';
  bar.innerHTML = `<a class="bar-home" href="#">${esc(S.name)}</a><nav><a href="#work" data-r="work">Work</a><a href="#drawings" data-r="drawings">Drawings</a><a href="#clippings" data-r="clippings">Writing</a><a href="#playlists" data-r="playlists">Playlists</a><a href="#cv" data-r="cv">CV</a></nav><a class="bar-mail" href="mailto:${esc(S.email)}">Email</a>`;
  $('#rooms').before(bar);
  rooms.forEach(r => { r.hidden = true; });

  let sheetReturn = '';
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('w/')) {
      const inRoom = document.body.classList.contains('in-room');
      sheetReturn = inRoom ? '#' + rooms.find(r => !r.hidden).id : '';
      openWork(h.slice(2));
      return;
    }
    if ($('#sheet').open) $('#sheet').close();
    const room = rooms.find(r => r.id === h);
    if (room) {
      running = false;
      document.body.classList.add('in-room');
      rooms.forEach(r => { r.hidden = r.id !== room.id; });
      $$('.bar nav a').forEach(a => a.classList.toggle('on', a.dataset.r === room.id));
      document.title = `${room.dataset.name} · ${S.name}`;
      window.scrollTo(0, 0);
      room.classList.remove('arrive'); void room.offsetWidth; room.classList.add('arrive');
    } else {
      document.body.classList.remove('in-room');
      rooms.forEach(r => { r.hidden = true; });
      document.title = S.name;
      run();
    }
  }
  addEventListener('hashchange', route);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('in-room') && !$('dialog[open]')) location.hash = ''; });

  /* work */
  function workRoom() {
    const card = w => {
      const img = (w.images || [])[0];
      return `<a class="wcard" href="#w/${esc(w.id)}">${img ? `<span class="wpic"><img src="${esc(img.src)}" alt="" loading="lazy"></span>` : `<span class="wpic type"><span>${esc(w.title)}</span></span>`}
        <span class="wtitle">${esc(w.title)}</span><span class="wmeta">${esc(w.client)} · ${esc(w.year)}</span></a>`;
    };
    $('#work-box').innerHTML = [['lately', 'Lately'], ['before', 'Before']].map(([era, l]) =>
      `<h2 class="era">${l}</h2><div class="wgrid">${S.work.filter(w => w.era === era).map(card).join('')}</div>`).join('') +
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
          ${(t.words || []).map(p => `<p class="words">${esc(p)}</p>`).join('')}
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
  $('#sheet').addEventListener('close', () => { if (location.hash.startsWith('#w/') || location.hash.startsWith('#p/')) history.replaceState(null, '', sheetReturn || location.pathname + location.search); });

  /* a playlist, from the pile */
  function playlist(i) {
    const p = PLAYLISTS[i], dlg = $('#sheet');
    if (!p) return;
    sheetReturn = '';
    dlg.innerHTML = `<div class="sheet"><button class="close" aria-label="Close">×</button>
      <div class="sheet-in"><div class="sheet-pics"><img src="${esc(p.cover)}" alt="Cover of ${esc(p.title)}"></div>
      <div class="sheet-text"><p class="sheet-meta">Playlist</p><h2>${esc(p.title)}</h2>
      <iframe class="spotify" title="${esc(p.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(p.id)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      <p class="sheet-links"><a href="#playlists">All the playlists</a></p></div></div></div>`;
    $('.close', dlg).addEventListener('click', () => dlg.close());
    $('.sheet-links a', dlg).addEventListener('click', () => dlg.close());
    if (!dlg.open) dlg.showModal();
  }

  /* drawings */
  function lightbox(src, caption, alt) {
    const d = $('#lightbox');
    d.innerHTML = `<div class="lb"><button class="close" aria-label="Close">×</button><img src="${esc(src)}" alt="${esc(alt || caption)}"><p>${esc(caption)}</p></div>`;
    $('.close', d).addEventListener('click', () => d.close());
    d.showModal();
  }
  function drawingsRoom() {
    const H = S.hof;
    $('#hof-intro').innerHTML = `${esc(H.intro)} <a href="${esc(H.url)}" target="_blank" rel="noopener">everyhalloffamer.com</a>`;
    const tile = (src, cap, alt) => `<figure class="tile"><button aria-label="${esc(cap)}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></button><figcaption>${esc(cap)}</figcaption></figure>`;
    $('#hof').innerHTML = H.drawings.map(([id, nm, yr]) => tile(`media/hof/${id}.jpg`, `${nm}, ${yr}`, `Summer’s drawing of ${nm}`)).join('');
    $('#sketchbook').innerHTML = H.sketchbook.map(([src, cap]) => tile(src, cap, cap)).join('');
    $$('.wall .tile button').forEach(b => b.addEventListener('click', () => { const img = $('img', b); lightbox(img.src, b.getAttribute('aria-label'), img.alt); }));
  }

  /* writing */
  function clippingsRoom() {
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

  /* playlists */
  function playlistsRoom() {
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

  /* CV */
  function cvRoom() {
    const C = S.card;
    $('#bbcard').innerHTML = `<div class="bb-back">
      <div class="bb-head"><h2>${esc(S.name)}</h2><span class="bb-pos">${esc(C.position)}</span></div>
      <div class="bb-vitals">${C.vitals.map(([k, v]) => `<span><b>${esc(k)}:</b> ${esc(v)}</span>`).join('')}</div>
      <table class="bb-table"><thead><tr><th>Year</th><th>Club</th><th>Position</th></tr></thead>
        <tbody>${C.rows.slice().reverse().map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <div class="bb-totals">${C.totals.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
      ${C.fact ? `<p class="bb-fact">${esc(C.fact)}</p>` : ''}
    </div>
    <p class="card-foot">${S.resume ? `<a href="${esc(S.resume)}">Résumé (PDF)</a>` : ''}<a href="https://www.linkedin.com/in/summeranne" target="_blank" rel="noopener">LinkedIn</a></p>`;
  }

  /* ------------------------------------------------------------------ go */
  workRoom(); drawingsRoom(); clippingsRoom(); playlistsRoom(); cvRoom();
  route();
  // The letters are measured in the real font, so wait for it before anything falls.
  (document.fonts ? document.fonts.load('900 100px "Big Shoulders Display"').then(() => document.fonts.ready) : Promise.resolve()).then(start, start);
})();
