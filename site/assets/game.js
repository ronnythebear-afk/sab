/*
  A ballpark under the Austin sky. Pitches keep coming. Tap to swing, and the ball goes where
  you tapped:
    the billboards on the outfield wall   the work
    the ticker under the scoreboard       the writing
    the plaques along the stands          Every Hall of Famer
    over the wall                         a home run, and a playlist
    the video board                       the photo booth and the old hard drive
    the name in lights                    the CV
  Every hit is a card. The binder (Cards, bottom right) holds them all, so nothing on the site
  needs a hit to be seen. The sky is Austin's sky right now, the scoreboard has Austin's
  weather, and when the Astros are playing, their score.
*/
(function () {
  const S = window.SAB;
  const WRITING = window.SAB_WRITING || [], PLAYLISTS = window.SAB_PLAYLISTS || [], FACES = window.SAB_FACES || [], DRIVE = window.SAB_DRIVE || [];
  const DRAWINGS = S.hof.drawings; // [id, name, year]
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const year = d => (d || '').slice(0, 4);
  const work = id => S.work.find(w => w.id === id);
  $('#mail').href = `mailto:${S.email}`;

  /* ------------------------------------------------------------------ the cards */
  const CARDS = [
    { id: 'cv', kind: 'cv', tag: 'CV', title: S.name, sub: `${S.role} · ${S.city}`, img: (FACES[0] || {}).src },
    ...S.work.map(w => ({ id: 'w:' + w.id, kind: 'work', ref: w.id, tag: 'Work', title: w.title, sub: `${w.client} · ${w.year}`, img: ((w.images || [])[0] || {}).src })),
    ...WRITING.map(a => ({ id: 'a:' + a.slug, kind: 'writing', ref: a, tag: 'Writing', title: a.title, sub: [a.outlet, year(a.date)].filter(Boolean).join(', ') })),
    ...PLAYLISTS.map((p, i) => ({ id: 'p:' + p.id, kind: 'playlist', ref: i, tag: 'Playlist', title: p.title, sub: p.year, img: p.cover })),
    ...DRAWINGS.map((d, i) => ({ id: 'd:' + d[0], kind: 'drawing', ref: i, tag: 'Hall of Famer', title: d[1], sub: d[2], img: `media/hof/${d[0]}.jpg` }))
  ];
  const card = id => CARDS.find(c => c.id === id);
  let got = new Set();
  try { got = new Set(JSON.parse(localStorage.getItem('sab-cards') || '[]')); } catch (e) { /* a fresh binder */ }
  const save = () => { try { localStorage.setItem('sab-cards', JSON.stringify([...got])); } catch (e) { /* fine */ } };
  $('#of').textContent = CARDS.length;
  const count = () => { $('#got').textContent = [...got].filter(card).length; };
  count();

  function cardHTML(c, back) {
    if (back) return `<span class="card back"><span class="back-in"><i></i></span></span>`;
    const pic = c.kind === 'writing'
      ? `<span class="pic paper"><span class="mast"><span>${esc(c.ref.outlet)}</span><span>${esc(year(c.ref.date))}</span></span><span class="hl">${esc(c.title)}</span></span>`
      : c.img ? `<span class="pic"><img src="${esc(c.img)}" alt="" draggable="false"></span>`
        : `<span class="pic type"><b>${esc(c.title)}</b></span>`;
    const noimg = c.kind !== "writing" && !c.img ? " noimg" : "";
    return `<span class="card k-${c.kind}${noimg}">${pic}<span class="tag">${esc(c.tag)}</span><span class="nm">${esc(c.title)}</span><span class="sub">${esc(c.sub || '')}</span></span>`;
  }

  function openCard(c) {
    if (c.kind === 'cv') return openCV();
    if (c.kind === 'work') return openWork(c.ref);
    if (c.kind === 'writing') { const a = c.ref; if (a.here) location.href = `read.html?c=${encodeURIComponent(a.slug)}`; else window.open(a.url, '_blank', 'noopener'); return; }
    if (c.kind === 'playlist') return playlist(c.ref);
    if (c.kind === 'drawing') return drawing(c.ref);
  }

  /* ------------------------------------------------------------------ the park */
  const park = $('#park');
  const plaqueSet = ['nolan-ryan', 'willie-mays', 'satchel-paige', 'rollie-fingers', 'ted-williams', 'hilton-smith', 'lou-gehrig', 'jackie-robinson', 'roberto-clemente', 'babe-ruth']
    .map(id => DRAWINGS.findIndex(d => d[0] === id)).filter(i => i >= 0);
  while (plaqueSet.length < 10 && plaqueSet.length < DRAWINGS.length) { const i = Math.floor(Math.random() * DRAWINGS.length); if (!plaqueSet.includes(i)) plaqueSet.push(i); }
  const colors = ['#13213f', '#ef6b2b', '#f5efe2'];
  park.innerHTML = `
    <div class="sky"><i class="stars"></i></div>
    <div class="tower l"><i></i></div><div class="tower r"><i></i></div>
    <canvas class="crowd" id="crowd" aria-hidden="true"></canvas>
    <svg class="field" id="field" aria-hidden="true"></svg>
    <div class="board" id="board">
      <div class="led">
        <button class="led-name" data-t="name" type="button" aria-label="${esc(S.name)}, CV">${esc(S.name)}</button>
        <p class="led-row">${esc(S.role)} · ${esc(S.city)}</p>
        <p class="led-row" id="now"></p>
        <p class="led-count" aria-hidden="true"><span>S <i id="strikes"></i></span><span>O <i id="outs"></i></span><span>H <b id="hits">0</b></span></p>
      </div>
      <button class="screen" data-t="screen" type="button" aria-label="The video board"><img id="screen-img" alt="" src=""><span class="cap" id="screen-cap"></span><span class="stamp" id="screen-stamp"></span></button>
      <button class="ticker" data-t="ticker" type="button" aria-label="Writing"><span class="tk" id="tk"></span></button>
    </div>
    <div class="honor" id="honor">${plaqueSet.map(i => `<button class="plaque" data-t="plaque" data-i="${i}" type="button" aria-label="Drawing of ${esc(DRAWINGS[i][1])}"><img src="media/hof/${esc(DRAWINGS[i][0])}.jpg" alt="" draggable="false"></button>`).join('')}</div>
    <div class="wall" id="wall">${S.work.map((w, i) => {
      const img = (w.images || [])[0];
      return img ? `<button class="bb" data-t="billboard" data-id="${esc(w.id)}" type="button" aria-label="${esc(w.title)}"><img src="${esc(img.src)}" alt="" draggable="false"><span>${esc(w.client)}</span></button>`
        : `<button class="bb type${i % 3 === 2 ? ' light' : ''}" data-t="billboard" data-id="${esc(w.id)}" type="button" aria-label="${esc(w.title)}" style="--c:${colors[i % 3]}"><b>${esc(w.title)}</b><span>${esc(w.client)}</span></button>`;
    }).join('')}</div>
    <i class="zone" id="zone"></i>
    <i class="shadow" id="shadow"></i>
    <i class="ball" id="ball"></i>
    <i class="swing" id="swing"></i>
    <i class="rain"></i>
    <div class="pop" id="pop" hidden></div>`;

  // Where everything goes, worked out from the size of the screen.
  let L = {};
  function layout() {
    const W = innerWidth, H = innerHeight, portrait = W / H < .9;
    const boardW = portrait ? W * .94 : Math.min(720, Math.max(520, W * .46));
    const boardH = boardW * (portrait ? .5 : .34);
    const boardTop = portrait ? 54 : Math.max(18, H * .045);
    const ph = portrait ? 30 : 38;
    const perRow = portrait ? 4 : S.work.length;
    const rows = Math.ceil(S.work.length / perRow);
    const gap = portrait ? 8 : 14;
    const bw = Math.min(210, (W * .95 - gap * (perRow - 1)) / perRow), bh = bw * .58;
    const wallTop = boardTop + boardH + ph + (portrait ? 18 : 22);
    const wallH = rows * bh + (rows + 1) * gap;
    const wallBottom = wallTop + wallH;
    const plateY = H - (portrait ? 54 : 46), cx = W / 2;
    const fieldH = plateY - wallBottom;
    const moundY = wallBottom + fieldH * .6;
    const secondY = moundY - (plateY - moundY) * .62;
    const dx = Math.min(W * (portrait ? .4 : .26), (plateY - secondY) * 1.55);
    L = { W, H, portrait, boardW, boardH, boardTop, ph, perRow, gap, bw, bh, wallTop, wallH, wallBottom, plateY, cx, moundY, secondY, dx, standsTop: boardTop + boardH * .55 };

    park.style.setProperty('--horizon', (L.standsTop + boardH * .25) + 'px');
    const board = $('#board');
    Object.assign(board.style, { width: boardW + 'px', height: boardH + 'px', left: (cx - boardW / 2) + 'px', top: boardTop + 'px' });
    const honor = $('#honor');
    const nPlaques = portrait ? 6 : plaqueSet.length;
    $$('.plaque', honor).forEach((p, i) => { p.hidden = i >= nPlaques; p.style.width = ph * .8 + 'px'; p.style.height = ph + 'px'; });
    Object.assign(honor.style, { top: (wallTop - ph - 8) + 'px', height: ph + 'px' });
    const wall = $('#wall');
    Object.assign(wall.style, { top: wallTop + 'px', height: wallH + 'px', gap: gap + 'px', padding: `${gap}px ${(W - (bw * perRow + gap * (perRow - 1))) / 2}px` });
    $$('.bb', wall).forEach(b => { b.style.width = bw + 'px'; b.style.height = bh + 'px'; });
    // light towers stand halfway between the scoreboard and the edge, where there's room
    const side = (W - boardW) / 2;
    $$('.tower').forEach((t, i) => {
      t.hidden = side < 150;
      t.style.height = (L.standsTop + 10) + 'px';
      t.style.left = ((i ? W - side * .42 : side * .42) - 4) + 'px';
    });
    const z = $('#zone');
    Object.assign(z.style, { left: (cx - 30) + 'px', top: (plateY - 92) + 'px' });
    drawField();
    drawCrowd();
  }

  function drawField() {
    const { W, H, wallBottom, plateY, cx, moundY, secondY, dx } = L;
    const midY = (plateY + secondY) / 2;
    const home = [cx, plateY], first = [cx + dx, midY], second = [cx, secondY], third = [cx - dx, midY];
    const p = a => a.map(n => n.toFixed(1)).join(',');
    // the mowing: wedges fanning out from home plate to the wall
    const n = 16, far = wallBottom + 10, span = W * 1.6;
    let stripes = '';
    for (let i = 0; i < n; i++) {
      if (i % 2) continue;
      const x1 = cx - span / 2 + span * i / n, x2 = cx - span / 2 + span * (i + 1) / n;
      stripes += `<polygon points="${p(home)} ${x1.toFixed(1)},${far} ${x2.toFixed(1)},${far}" />`;
    }
    // foul lines run from home through first and third to the wall
    const foul = (b) => { const t = (wallBottom - plateY) / (b[1] - plateY); return [cx + (b[0] - cx) * t, wallBottom]; };
    const lf = foul(third), rf = foul(first);
    const rx = dx * 1.1, ry = (plateY - secondY) * .66;
    $('#field').setAttribute('viewBox', `0 0 ${W} ${H}`);
    $('#field').innerHTML = `
      <rect class="grass" x="0" y="${wallBottom}" width="${W}" height="${H - wallBottom}" />
      <g class="mow">${stripes}</g>
      <rect class="track" x="0" y="${wallBottom}" width="${W}" height="${Math.max(10, (plateY - wallBottom) * .045)}" />
      <ellipse class="dirt" cx="${cx}" cy="${midY - ry * .2}" rx="${rx}" ry="${ry}" />
      <polygon class="infield" points="${p([cx, plateY - (plateY - secondY) * .16])} ${p([cx + dx * .8, midY + 2])} ${p([cx, secondY + (plateY - secondY) * .14])} ${p([cx - dx * .8, midY + 2])}" />
      <ellipse class="dirt" cx="${cx}" cy="${moundY}" rx="${dx * .14}" ry="${(plateY - secondY) * .06}" />
      <ellipse class="dirt" cx="${cx}" cy="${plateY - 6}" rx="${dx * .26}" ry="${(plateY - secondY) * .12}" />
      <line class="chalk" x1="${cx}" y1="${plateY}" x2="${lf[0]}" y2="${lf[1]}" />
      <line class="chalk" x1="${cx}" y1="${plateY}" x2="${rf[0]}" y2="${rf[1]}" />
      <rect class="rubber" x="${cx - 7}" y="${moundY - 2}" width="14" height="4" />
      ${[first, second, third].map(b => `<rect class="base" x="${b[0] - 6}" y="${b[1] - 6}" width="12" height="12" transform="rotate(45 ${b[0]} ${b[1]}) scale(1 1)" />`).join('')}
      <polygon class="plate" points="${cx - 13},${plateY - 4} ${cx + 13},${plateY - 4} ${cx + 13},${plateY + 3} ${cx},${plateY + 10} ${cx - 13},${plateY + 3}" />
      <rect class="box" x="${cx - 58}" y="${plateY - 22}" width="34" height="46" />
      <rect class="box" x="${cx + 24}" y="${plateY - 22}" width="34" height="46" />`;
  }

  // The crowd: rows of little people in the stands, in whatever the light is.
  function drawCrowd() {
    const c = $('#crowd'), dpr = Math.min(2, devicePixelRatio || 1);
    const top = L.standsTop, h = L.wallTop - top;
    Object.assign(c.style, { top: top + 'px', height: h + 'px' });
    c.width = L.W * dpr; c.height = h * dpr;
    const g = c.getContext('2d');
    g.scale(dpr, dpr);
    const night = document.body.classList.contains('night');
    const shirts = night ? ['#2c3350', '#3d3550', '#4a3b33', '#26394a', '#565a6e', '#6d4b32'] : ['#e9e2d0', '#ef6b2b', '#13213f', '#c9d6e3', '#8a5a44', '#f2c14e', '#ffffff', '#5b6f8c', '#b5473a'];
    g.fillStyle = night ? '#1a2036' : '#7d8794';
    g.fillRect(0, 0, L.W, h);
    for (let y = 4, row = 0; y < h - 4; y += 7, row++) {
      g.fillStyle = night ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)';
      g.fillRect(0, y + 5, L.W, 1);
      for (let x = (row % 2) * 3; x < L.W; x += 6) {
        if (Math.random() < .12) continue;
        g.fillStyle = pick(shirts);
        g.fillRect(x, y + 1, 4, 4);
        g.fillStyle = night ? '#4a3e3a' : pick(['#3b2a20', '#7a5134', '#d9a77c', '#2a2321', '#b98563']);
        g.fillRect(x + 1, y - 1, 2, 2);
        if (night && Math.random() < .015) { g.fillStyle = '#fff6c8'; g.fillRect(x + 1, y - 3, 2, 2); }
      }
    }
  }

  /* ------------------------------------------------------------------ Austin, right now */
  // Where the sun is over Austin decides the sky: day, golden, dusk, night.
  function sunAlt(t) {
    const r = Math.PI / 180, d = t / 864e5 - 10957.5;
    const g = (357.529 + .98560028 * d) * r, q = 280.459 + .98564736 * d;
    const lam = (q + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)) * r, e = (23.439 - .00000036 * d) * r;
    const ra = Math.atan2(Math.cos(e) * Math.sin(lam), Math.cos(lam)), dec = Math.asin(Math.sin(e) * Math.sin(lam));
    const lst = (((18.697374558 + 24.06570982441908 * d) % 24) * 15 - 97.74) * r;
    const lat = 30.27 * r;
    return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(lst - ra)) / r;
  }
  const SKY = [[-18, '#0a0f22', '#151d3a'], [-8, '#151c42', '#2f3566'], [-3, '#2c3a78', '#d4824f'], [2, '#4f7cc2', '#f0ad62'], [8, '#4f93dc', '#f3d39c'], [20, '#4a93df', '#bfe0f4'], [70, '#3c8bdc', '#cde8f8']];
  const mix = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(lerp(parseInt(a.slice(i, i + 2), 16), parseInt(b.slice(i, i + 2), 16), t)).toString(16).padStart(2, '0')).join('');
  let wasNight = null;
  function light() {
    const alt = new URLSearchParams(location.search).has('alt') ? +new URLSearchParams(location.search).get('alt') : sunAlt(Date.now());
    let i = SKY.findIndex(s => s[0] > alt);
    if (i <= 0) i = i === 0 ? 1 : SKY.length - 1;
    const a = SKY[i - 1], b = SKY[i], t = Math.max(0, Math.min(1, (alt - a[0]) / (b[0] - a[0])));
    document.body.style.setProperty('--sky-top', mix(a[1], b[1], t));
    document.body.style.setProperty('--sky-low', mix(a[2], b[2], t));
    const night = alt < -5;
    document.body.classList.toggle('night', night);
    document.body.classList.toggle('dusk', alt >= -5 && alt < 6);
    if (wasNight !== null && wasNight !== night) drawCrowd();
    wasNight = night;
    $('meta[name="theme-color"]').content = mix(a[1], b[1], t);
  }
  const clock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit' });
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());
  let temp = '', game = '';
  const RAIN = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
  function nowLine() { $('#now').textContent = ['Austin', temp, clock.format(new Date()), game].filter(Boolean).join(' · '); }
  async function weather() {
    try {
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=30.27&longitude=-97.74&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago');
      const j = await r.json();
      temp = Math.round(j.current.temperature_2m) + '°';
      document.body.classList.toggle('raining', RAIN.has(j.current.weather_code));
    } catch (e) { /* no weather, still a ballgame */ }
    nowLine();
  }
  async function astros() {
    try {
      const r = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=117&date=${today()}&hydrate=linescore,team`);
      const g = (((await r.json()).dates || [])[0] || {}).games;
      if (!g || !g.length) { game = ''; return nowLine(); }
      const x = g[g.length - 1], aw = x.teams.away, hm = x.teams.home;
      const ab = t => t.team.abbreviation || t.team.teamName || '';
      const st = x.status.abstractGameState, ls = x.linescore || {};
      if (st === 'Live') game = `${ab(aw)} ${aw.score} ${ab(hm)} ${hm.score} ${ls.inningHalf === 'Top' ? 'T' : 'B'}${ls.currentInning || ''}`;
      else if (st === 'Final') game = `Final ${ab(aw)} ${aw.score} ${ab(hm)} ${hm.score}`;
      else game = `${ab(aw)} at ${ab(hm)} ${clock.format(new Date(x.gameDate))}`;
    } catch (e) { game = ''; }
    nowLine();
  }

  /* ------------------------------------------------------------------ the scoreboard */
  // The ticker runs one headline at a time. Whatever's running is what a hit there opens.
  let tkAt = 0;
  function ticker() {
    const tk = $('#tk');
    if (!WRITING.length) return;
    const a = WRITING[tkAt % WRITING.length];
    tk.textContent = '★ ' + a.title;
    const box = $('.ticker').clientWidth, wTxt = tk.scrollWidth;
    const dur = Math.max(5000, (box + wTxt) * 16);
    if (reduced) { tk.style.transform = 'none'; setTimeout(() => { tkAt++; ticker(); }, 6000); return; }
    tk.animate([{ transform: `translateX(${box}px)` }, { transform: `translateX(${-wTxt}px)` }], { duration: dur, easing: 'linear' }).onfinish = () => { tkAt++; ticker(); };
  }
  // The video board: a selfie, then a photo from the old hard drive, and so on.
  let scAt = 0, scNow = null;
  const stamp = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return [`'${y.slice(2)}`, m && +m, dd && +dd].filter(Boolean).join(' '); };
  function screen(next) {
    const pool = scAt % 2 && DRIVE.length ? DRIVE : FACES.length ? FACES : DRIVE;
    if (!pool.length) return;
    scNow = pick(pool);
    scAt++;
    const img = $('#screen-img');
    img.src = scNow.src;
    $('#screen-stamp').textContent = scNow.date ? stamp(scNow.date) : '';
    $('#screen-cap').textContent = scNow.words || '';
    if (next !== false) setTimeout(screen, 4200);
  }
  let strikes = 0, outs = 0, hits = 0;
  function scoreboard() {
    $('#strikes').textContent = '●'.repeat(strikes) + '○'.repeat(2 - Math.min(2, strikes));
    $('#outs').textContent = '●'.repeat(outs) + '○'.repeat(2 - Math.min(2, outs));
    $('#hits').textContent = hits;
  }
  function strike() {
    strikes++;
    if (strikes >= 3) { strikes = 0; outs++; if (outs >= 3) outs = 0; }
    scoreboard();
    $('#board').classList.remove('blink'); void $('#board').offsetWidth; $('#board').classList.add('blink');
  }

  /* ------------------------------------------------------------------ pitching and hitting */
  const ball = $('#ball'), shadow = $('#shadow');
  const put = (el, x, y, s, o = 1) => { el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`; el.style.opacity = o; };
  let state = 'wait', t0 = 0, swung = false, paused = false, raf = 0, flight = null;
  const PITCH = 820, WIN = [.8, 1.07];
  const busy = () => paused || document.hidden || $$('dialog').some(d => d.open);
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (busy() && state !== 'fly') { if (state === 'pitch' || state === 'windup') { state = 'wait'; t0 = now; put(ball, 0, 0, 0, 0); put(shadow, 0, 0, 0, 0); } return; }
    const el = now - t0;
    const { cx, moundY, plateY } = L;
    if (state === 'wait') { if (!reduced && el > 1100) { state = 'windup'; t0 = now; swung = false; } return; }
    if (state === 'windup') {
      put(ball, cx - 11, moundY - 30 - Math.sin(Math.min(1, el / 500) * Math.PI) * 8, .32, Math.min(1, el / 200));
      if (el > 650) { state = 'pitch'; t0 = now; }
      return;
    }
    if (state === 'pitch') {
      const p = el / PITCH;
      const e = Math.pow(Math.min(p, 1.25), 1.35);
      const y = lerp(moundY - 30, plateY - 58, e), s = .32 + .95 * e * e;
      put(ball, cx - 11 + Math.sin(p * 3) * 4, y - 11, s);
      put(shadow, cx - 11, lerp(moundY, plateY - 20, e) - 3, s * .9, .35);
      $('#zone').classList.toggle('on', p >= WIN[0] && p <= WIN[1] && !swung);
      if (p > 1.22) {
        $('#zone').classList.remove('on');
        put(ball, 0, 0, 0, 0); put(shadow, 0, 0, 0, 0);
        strike();
        state = 'wait'; t0 = now;
      }
      return;
    }
    if (state === 'fly' && flight) {
      const f = flight, p = Math.min(1, (now - f.t0) / f.dur);
      const x = lerp(f.x0, f.x1, p), yLine = lerp(f.y0, f.y1, p), y = yLine - Math.sin(p * Math.PI) * f.arc;
      put(ball, x - 11, y - 11, lerp(1.1, f.s1, Math.pow(p, .7)));
      const gy = Math.max(yLine, L.wallBottom + 4);
      put(shadow, x - 11, gy - 3, lerp(.9, f.s1, p), yLine > L.wallBottom ? .3 : 0);
      if (p >= 1) { flight = null; put(shadow, 0, 0, 0, 0); land(f); }
    }
  }

  // A tap is a swing, aimed wherever the tap was.
  function swing(x, y) {
    sfx.wake();
    const sw = $('#swing');
    sw.classList.remove('go'); void sw.offsetWidth; sw.classList.add('go');
    if (reduced) { hit(x, y, true); return; }
    if (state !== 'pitch' || swung) return;
    swung = true;
    const p = (performance.now() - t0) / PITCH;
    $('#zone').classList.remove('on');
    if (p >= WIN[0] && p <= WIN[1]) hit(x, y);
  }
  function hit(x, y, instant) {
    const target = targetAt(x, y);
    hits++; scoreboard();
    strikes = 0;
    sfx.crack();
    document.body.classList.add('hit-shake');
    setTimeout(() => document.body.classList.remove('hit-shake'), 160);
    $('#hint').classList.add('gone');
    const x0 = L.cx, y0 = L.plateY - 60;
    const ty = target.kind === 'homer' ? Math.min(y, L.wallTop - 10) : y;
    const dist = Math.hypot(x - x0, ty - y0);
    flight = { t0: performance.now(), dur: instant ? 1 : 520 + dist * .55, x0, y0, x1: x, y1: ty, arc: target.kind === 'homer' ? dist * .45 : dist * .28, s1: ty < L.wallTop ? .16 : .26, target };
    state = 'fly';
  }
  function targetAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const t = el && el.closest('[data-t]');
    if (t) return { kind: t.dataset.t, el: t };
    if (y < L.wallTop) return { kind: 'homer' };
    return { kind: 'field' };
  }

  // Where the ball came down decides the card.
  function land(f) {
    const t = f.target;
    const el = t.el;
    if (el) { el.classList.remove('struck'); void el.offsetWidth; el.classList.add('struck'); }
    put(ball, 0, 0, 0, 0);
    let c = null;
    if (t.kind === 'billboard') c = card('w:' + el.dataset.id);
    else if (t.kind === 'plaque') c = card('d:' + DRAWINGS[+el.dataset.i][0]);
    else if (t.kind === 'ticker') c = WRITING.length && card('a:' + WRITING[tkAt % WRITING.length].slug);
    else if (t.kind === 'name') c = card('cv');
    else if (t.kind === 'homer') { c = nextOf('playlist'); fireworks(f.x1, f.y1); sfx.cheer(); }
    else if (t.kind === 'screen') { snap(); state = 'wait'; t0 = performance.now(); return; }
    else c = nextOf();
    reveal(c);
  }
  const nextOf = kind => {
    const pool = CARDS.filter(c => (!kind || c.kind === kind) && c.kind !== 'cv');
    const fresh = pool.filter(c => !got.has(c.id));
    return pick(fresh.length ? fresh : pool);
  };

  // A hit on the video board sets off the photo booth: four flashes, four pictures.
  function snap() {
    const sc = $('.screen');
    let n = 0;
    const go = () => {
      sc.classList.remove('flash'); void sc.offsetWidth; sc.classList.add('flash');
      screen(false);
      if (++n < 4) setTimeout(go, 380);
    };
    go();
  }

  function fireworks(x, y) {
    if (reduced) return;
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--c', pick(['#ef6b2b', '#ffd36b', '#ffffff', '#7fc4ff']));
      park.appendChild(s);
      const a = rand(0, Math.PI * 2), r = rand(40, 120);
      s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r - 30}px) scale(.3)`, opacity: 0 }], { duration: rand(700, 1100), easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
    $('#crowd').classList.remove('roar'); void $('#crowd').offsetWidth; $('#crowd').classList.add('roar');
  }

  /* ------------------------------------------------------------------ the card you hit */
  const pop = $('#pop');
  let popTimer = 0, popCard = null;
  function reveal(c) {
    if (!c) { state = 'wait'; t0 = performance.now(); return; }
    state = 'reveal';
    popCard = c;
    const fresh = !got.has(c.id);
    got.add(c.id); save();
    pop.innerHTML = `<button class="pop-card${fresh ? ' fresh' : ''}" type="button" aria-label="${esc(c.title)}, open">${cardHTML(c)}</button>`;
    pop.hidden = false;
    clearTimeout(popTimer);
    popTimer = setTimeout(stow, 3600);
  }
  // The card flies off into the binder.
  function stow() {
    clearTimeout(popTimer);
    if (pop.hidden) return;
    const btn = $('#cards-btn').getBoundingClientRect(), pc = $('.pop-card', pop);
    const r = pc.getBoundingClientRect();
    const done = () => { pop.hidden = true; pop.innerHTML = ''; count(); $('#cards-btn').classList.remove('bump'); void $('#cards-btn').offsetWidth; $('#cards-btn').classList.add('bump'); state = 'wait'; t0 = performance.now(); };
    if (reduced) return done();
    pc.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${btn.left + btn.width / 2 - (r.left + r.width / 2)}px, ${btn.top + btn.height / 2 - (r.top + r.height / 2)}px) scale(.12) rotate(-12deg)`, opacity: .4 }], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)' }).onfinish = done;
  }
  pop.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.closest('.pop-card') && popCard) { const c = popCard; stow(); openCard(c); }
    else stow();
  });

  /* ------------------------------------------------------------------ taps */
  park.addEventListener('pointerdown', e => {
    if (e.button > 0 || e.target.closest('.pop')) return;
    e.preventDefault();
    if (state === 'reveal') return stow();
    swing(e.clientX, e.clientY);
  });
  // From the keyboard, the scoreboard, plaques and billboards just open.
  park.addEventListener('click', e => {
    if (e.detail !== 0) return;
    const t = e.target.closest('[data-t]');
    if (!t) return;
    const r = t.getBoundingClientRect();
    hit(r.left + r.width / 2, r.top + r.height / 2, true);
  });
  addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === document.body && !$$('dialog').some(d => d.open)) { e.preventDefault(); swing(L.cx + rand(-L.W * .3, L.W * .3), L.wallTop + L.wallH / 2); }
  });

  /* ------------------------------------------------------------------ sound */
  const sfx = (() => {
    let ac = null;
    const noise = (len, shape) => {
      const b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * shape(i / d.length);
      const s = ac.createBufferSource(); s.buffer = b; return s;
    };
    return {
      wake() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } },
      crack() {
        if (!ac) return;
        try {
          const s = noise(.09, t => Math.pow(1 - t, 6)), f = ac.createBiquadFilter(), g = ac.createGain();
          f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = .9; g.gain.value = .5;
          s.connect(f).connect(g).connect(ac.destination); s.start();
        } catch (e) { /* quiet */ }
      },
      cheer() {
        if (!ac) return;
        try {
          const s = noise(2.2, t => Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t * .4)), f = ac.createBiquadFilter(), g = ac.createGain();
          f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .5; g.gain.value = .16;
          s.connect(f).connect(g).connect(ac.destination); s.start();
        } catch (e) { /* quiet */ }
      }
    };
  })();

  /* ------------------------------------------------------------------ the binder */
  const binder = $('#binder');
  function openBinder() {
    binder.innerHTML = `<div class="binder">
      <header class="binder-h"><h2>Cards <span>${[...got].filter(card).length} / ${CARDS.length}</span></h2><button class="close" type="button" aria-label="Close">×</button></header>
      <div class="pockets">${CARDS.map(c => `<button class="pocket" type="button" data-id="${esc(c.id)}" aria-label="${esc(c.title)}">${cardHTML(c, !got.has(c.id))}</button>`).join('')}</div>
    </div>`;
    $('.close', binder).addEventListener('click', () => binder.close());
    $$('.pocket', binder).forEach(b => b.addEventListener('click', () => {
      const c = card(b.dataset.id);
      if (!got.has(c.id)) {
        got.add(c.id); save(); count();
        b.innerHTML = cardHTML(c);
        if (!reduced) b.animate([{ transform: 'rotateY(90deg)' }, { transform: 'rotateY(0)' }], { duration: 260, easing: 'ease-out' });
        $('.binder-h span', binder).textContent = `${[...got].filter(card).length} / ${CARDS.length}`;
        setTimeout(() => openCard(c), reduced ? 0 : 320);
      } else openCard(c);
    }));
    if (!binder.open) binder.showModal();
  }
  $('#cards-btn').addEventListener('click', openBinder);

  /* ------------------------------------------------------------------ closer looks */
  const sheet = $('#sheet');
  function showSheet(html, wide) {
    sheet.innerHTML = `<div class="sheet"><button class="close" aria-label="Close" type="button">×</button>${html}</div>`;
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
    got.add('w:' + id); save(); count();
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
    got.add('cv'); save(); count();
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
    got.add('d:' + id); save(); count();
    lb.innerHTML = `<div class="lb"><button class="close" aria-label="Close" type="button">×</button>
      <img src="media/hof/${esc(id)}.jpg" alt="Summer’s drawing of ${esc(name)}">
      <div class="lb-bar"><button class="lb-go" data-by="-1" aria-label="Previous drawing" type="button">←</button><p>${esc(name)}, ${esc(yr)} <span>${lbAt + 1} / ${DRAWINGS.length}</span></p><button class="lb-go" data-by="1" aria-label="Next drawing" type="button">→</button></div>
      <p class="lb-out"><a href="${esc(S.hof.url)}" target="_blank" rel="noopener">Every Hall of Famer ↗</a></p></div>`;
    $('.close', lb).addEventListener('click', () => lb.close());
    $$('.lb-go', lb).forEach(b => b.addEventListener('click', () => drawing(lbAt + +b.dataset.by)));
    if (!lb.open) lb.showModal();
  }
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') drawing(lbAt + 1); if (e.key === 'ArrowLeft') drawing(lbAt - 1); });

  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('w/')) return openWork(h.slice(2));
    if (h === 'cv') return openCV();
    if (sheet.open) sheet.close();
  }
  addEventListener('hashchange', route);
  $('.hud-top a[href="#cv"]').addEventListener('click', e => { if (location.hash === '#cv') { e.preventDefault(); openCV(); } });

  /* ------------------------------------------------------------------ play ball */
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(layout, 120); });
  document.addEventListener('visibilitychange', () => { t0 = performance.now(); });
  light();
  layout();
  scoreboard();
  screen();
  nowLine();
  weather();
  astros();
  setInterval(() => { light(); nowLine(); }, 60000);
  setInterval(astros, 120000);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { layout(); ticker(); });
  t0 = performance.now();
  raf = requestAnimationFrame(tick);
  route();
})();
