/*
  A ballpark under the Austin sky. Everything is a sign on the outfield wall: the work, the
  writing, Every Hall of Famer and the playlists. Tap a sign to open it, or press Swing and
  the ball hits a sign at random, and that one opens. Sometimes it's a home run, and a home
  run plays a playlist. The scoreboard has the name, Austin right now, and a screen that
  runs the selfies and the old hard drive photos.
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
  const wait = ms => new Promise(r => setTimeout(r, ms));
  $('#mail').href = `mailto:${S.email}`;

  /* ------------------------------------------------------------------ the signs */
  const firstDrawing = Math.max(0, DRAWINGS.findIndex(d => d[0] === 'nolan-ryan'));
  const colors = ['#13213f', '#ef6b2b', '#f5efe2'];
  const SIGNS = [
    ...S.work.map((w, i) => {
      const img = (w.images || [])[0];
      return { kind: 'work', id: w.id, label: w.client, face: img ? `<img src="${esc(img.src)}" alt="" draggable="false">` : `<b>${esc(w.title)}</b>`, type: !img, c: colors[i % 3], name: w.title };
    }),
    WRITING.length && { kind: 'writing', label: 'Writing', name: 'Writing', face: `<span class="news"><i>${esc(WRITING[0].outlet)}</i><b>${esc(WRITING[0].title)}</b></span>` },
    DRAWINGS.length && { kind: 'drawings', label: 'Every Hall of Famer', name: 'Every Hall of Famer', face: `<img class="drawn" src="media/hof/${esc(DRAWINGS[firstDrawing][0])}.jpg" alt="" draggable="false">` },
    PLAYLISTS.length && { kind: 'playlists', label: 'Playlists', name: 'Playlists', face: `<img src="${esc(PLAYLISTS[0].cover)}" alt="" draggable="false">` }
  ].filter(Boolean);

  function open(s) {
    if (s.kind === 'work') return openWork(s.id);
    if (s.kind === 'writing') return openWriting();
    if (s.kind === 'drawings') return drawing(Math.floor(Math.random() * DRAWINGS.length));
    if (s.kind === 'playlists') return playlist(Math.floor(Math.random() * PLAYLISTS.length));
  }

  /* ------------------------------------------------------------------ the park */
  const park = $('#park');
  park.innerHTML = `
    <div class="sky"><i class="stars"></i></div>
    <div class="tower"><i></i></div><div class="tower"><i></i></div>
    <canvas class="crowd" id="crowd" aria-hidden="true"></canvas>
    <svg class="field" id="field" aria-hidden="true"></svg>
    <div class="board" id="board">
      <div class="led">
        <button class="led-name" type="button" data-cv aria-label="${esc(S.name)}, CV">${esc(S.name)}</button>
        <p class="led-row">${esc(S.role)} · ${esc(S.city)}</p>
        <p class="led-row" id="now"></p>
      </div>
      <button class="screen" id="screen" type="button" aria-label="Another photo"><img id="screen-img" alt="" src=""><span class="cap" id="screen-cap"></span><span class="stamp" id="screen-stamp"></span></button>
    </div>
    <div class="wall" id="wall">${SIGNS.map((s, i) => `<button class="sign k-${s.kind}${s.type ? ' type' : ''}${s.c === colors[2] ? ' light' : ''}" data-i="${i}" type="button" style="${s.c ? `--c:${s.c}` : ''}"><span class="face">${s.face}</span><span class="label">${esc(s.label)}</span></button>`).join('')}</div>
    <i class="shadow" id="shadow"></i>
    <i class="ball" id="ball"></i>
    <i class="swing-arc" id="arc"></i>
    <i class="rain"></i>
    <button class="swing-btn" id="swing" type="button">Swing</button>`;

  // Where everything goes, worked out from the size of the screen.
  let L = {};
  function layout() {
    const W = innerWidth, H = innerHeight, portrait = W / H < .9;
    const boardW = portrait ? W * .94 : Math.min(660, Math.max(440, W * .42));
    const boardH = boardW * (portrait ? .42 : .3);
    const boardTop = portrait ? 54 : Math.max(16, H * .04);
    const perRow = portrait ? 3 : 5, rows = Math.ceil(SIGNS.length / perRow), gap = portrait ? 8 : 14;
    const wallTop = boardTop + boardH + (portrait ? 30 : 38);
    let bw = Math.min(230, (W * (portrait ? .95 : .9) - gap * (perRow - 1)) / perRow), bh = bw * .56;
    const maxWall = H * (portrait ? .38 : .4);
    if (rows * bh + (rows + 1) * gap > maxWall) { bh = (maxWall - (rows + 1) * gap) / rows; bw = bh / .56; }
    const wallH = rows * bh + (rows + 1) * gap, wallBottom = wallTop + wallH;
    const plateY = H - (portrait ? 64 : 56), cx = W / 2;
    const moundY = wallBottom + (plateY - wallBottom) * .55;
    const secondY = moundY - (plateY - moundY) * .62;
    const dx = Math.min(W * (portrait ? .4 : .26), (plateY - secondY) * 1.55);
    L = { W, H, portrait, boardW, boardH, boardTop, wallTop, wallH, wallBottom, plateY, cx, moundY, secondY, dx, standsTop: boardTop + boardH * .55 };

    park.style.setProperty('--horizon', (L.standsTop + boardH * .25) + 'px');
    Object.assign($('#board').style, { width: boardW + 'px', height: boardH + 'px', left: (cx - boardW / 2) + 'px', top: boardTop + 'px' });
    const wall = $('#wall');
    Object.assign(wall.style, { top: wallTop + 'px', height: wallH + 'px', gap: gap + 'px', padding: `${gap}px ${(W - (bw * perRow + gap * (perRow - 1))) / 2}px` });
    $$('.sign', wall).forEach(b => { b.style.width = bw + 'px'; b.style.height = bh + 'px'; });
    const side = (W - boardW) / 2;
    $$('.tower').forEach((t, i) => {
      t.hidden = side < 150;
      t.style.height = (L.standsTop + 10) + 'px';
      t.style.left = ((i ? W - side * .42 : side * .42) - 4) + 'px';
    });
    Object.assign($('#swing').style, { left: cx + 'px', top: (plateY - 8) + 'px' });
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
    for (let i = 0; i < n; i += 2) {
      const x1 = cx - span / 2 + span * i / n, x2 = cx - span / 2 + span * (i + 1) / n;
      stripes += `<polygon points="${p(home)} ${x1.toFixed(1)},${far} ${x2.toFixed(1)},${far}" />`;
    }
    const foul = b => { const t = (wallBottom - plateY) / (b[1] - plateY); return [cx + (b[0] - cx) * t, wallBottom]; };
    const lf = foul(third), rf = foul(first);
    const rx = dx * 1.1, ry = (plateY - secondY) * .66;
    $('#field').setAttribute('viewBox', `0 0 ${W} ${H}`);
    $('#field').innerHTML = `
      <rect class="grass" x="0" y="${wallBottom}" width="${W}" height="${H - wallBottom}" />
      <g class="mow">${stripes}</g>
      <rect class="track" x="0" y="${wallBottom}" width="${W}" height="${Math.max(8, (plateY - wallBottom) * .045)}" />
      <ellipse class="dirt" cx="${cx}" cy="${midY - ry * .2}" rx="${rx}" ry="${ry}" />
      <polygon class="infield" points="${p([cx, plateY - (plateY - secondY) * .16])} ${p([cx + dx * .8, midY + 2])} ${p([cx, secondY + (plateY - secondY) * .14])} ${p([cx - dx * .8, midY + 2])}" />
      <ellipse class="dirt" cx="${cx}" cy="${moundY}" rx="${dx * .14}" ry="${(plateY - secondY) * .06}" />
      <ellipse class="dirt" cx="${cx}" cy="${plateY - 6}" rx="${dx * .26}" ry="${(plateY - secondY) * .12}" />
      <line class="chalk" x1="${cx}" y1="${plateY}" x2="${lf[0]}" y2="${lf[1]}" />
      <line class="chalk" x1="${cx}" y1="${plateY}" x2="${rf[0]}" y2="${rf[1]}" />
      <rect class="rubber" x="${cx - 7}" y="${moundY - 2}" width="14" height="4" />
      ${[first, second, third].map(b => `<rect class="base" x="${b[0] - 6}" y="${b[1] - 6}" width="12" height="12" transform="rotate(45 ${b[0]} ${b[1]})" />`).join('')}`;
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
    const q = new URLSearchParams(location.search);
    const alt = q.has('alt') ? +q.get('alt') : sunAlt(Date.now());
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
      const j = await (await fetch('https://api.open-meteo.com/v1/forecast?latitude=30.27&longitude=-97.74&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FChicago')).json();
      temp = Math.round(j.current.temperature_2m) + '°';
      document.body.classList.toggle('raining', RAIN.has(j.current.weather_code));
    } catch (e) { /* no weather, still a ballpark */ }
    nowLine();
  }
  // When the Astros are playing today, their game goes on the scoreboard.
  async function astros() {
    try {
      const g = ((((await (await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=117&date=${today()}&hydrate=linescore,team`)).json()).dates || [])[0] || {}).games) || [];
      if (!g.length) { game = ''; return nowLine(); }
      const x = g[g.length - 1], aw = x.teams.away, hm = x.teams.home, ab = t => t.team.abbreviation || t.team.teamName || '';
      const st = x.status.abstractGameState, ls = x.linescore || {};
      if (st === 'Live') game = `${ab(aw)} ${aw.score} ${ab(hm)} ${hm.score} ${ls.inningHalf === 'Top' ? 'T' : 'B'}${ls.currentInning || ''}`;
      else if (st === 'Final') game = `Final ${ab(aw)} ${aw.score} ${ab(hm)} ${hm.score}`;
      else game = `${ab(aw)} at ${ab(hm)} ${clock.format(new Date(x.gameDate))}`;
    } catch (e) { game = ''; }
    nowLine();
  }

  // The screen: a selfie, then a photo from the old hard drive, and so on. Tap for another.
  let scAt = 0, scT = 0;
  const stamp = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return [`'${y.slice(2)}`, m && +m, dd && +dd].filter(Boolean).join(' '); };
  function screen() {
    clearTimeout(scT);
    const pool = scAt % 2 && DRIVE.length ? DRIVE : FACES.length ? FACES : DRIVE;
    if (!pool.length) return;
    const ph = pick(pool);
    scAt++;
    $('#screen-img').src = ph.src;
    $('#screen-stamp').textContent = ph.date ? stamp(ph.date) : '';
    $('#screen-cap').textContent = ph.words || '';
    scT = setTimeout(screen, 5000);
  }

  /* ------------------------------------------------------------------ swing */
  const ball = $('#ball'), shadow = $('#shadow');
  const put = (el, x, y, s, o = 1) => { el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`; el.style.opacity = o; };
  const tween = (dur, fn) => new Promise(res => {
    const t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / dur); fn(p); if (p < 1) requestAnimationFrame(step); else res(); };
    requestAnimationFrame(step);
  });
  let swinging = false;
  // The pitch comes in, the bat connects, and the ball comes down on a sign, which opens.
  // About one swing in six goes over the wall, and a home run plays a playlist.
  async function swing() {
    if (swinging || $$('dialog').some(d => d.open)) return;
    swinging = true;
    sfx.wake();
    const { cx, moundY, plateY } = L;
    const signs = $$('.sign');
    const homer = PLAYLISTS.length && Math.random() < 1 / 6;
    const el = homer ? null : pick(signs);
    if (!reduced) {
      await tween(520, p => { const e = Math.pow(p, 1.4); put(ball, cx - 11, lerp(moundY - 30, plateY - 70, e) - 11, .3 + .8 * e * e); });
      const arc = $('#arc');
      arc.classList.remove('go'); void arc.offsetWidth; arc.classList.add('go');
      sfx.crack();
      document.body.classList.add('hit-shake');
      setTimeout(() => document.body.classList.remove('hit-shake'), 160);
      const r = el ? el.getBoundingClientRect() : null;
      const x1 = r ? r.left + r.width / 2 : rand(L.W * .15, L.W * .85), y1 = r ? r.top + r.height / 2 : rand(L.standsTop + 10, L.wallTop - 14);
      const x0 = cx, y0 = plateY - 70, dist = Math.hypot(x1 - x0, y1 - y0), archH = dist * (homer ? .5 : .3);
      await tween(560 + dist * .5, p => {
        const yl = lerp(y0, y1, p);
        put(ball, lerp(x0, x1, p) - 11, yl - Math.sin(p * Math.PI) * archH - 11, lerp(1.1, homer ? .14 : .24, Math.pow(p, .7)));
        put(shadow, lerp(x0, x1, p) - 11, Math.max(yl, L.wallBottom + 4) - 3, lerp(.9, .3, p), yl > L.wallBottom ? .3 : 0);
      });
      put(ball, 0, 0, 0, 0); put(shadow, 0, 0, 0, 0);
      if (el) { el.classList.remove('struck'); void el.offsetWidth; el.classList.add('struck'); }
      else { fireworks(x1, y1); sfx.cheer(); }
      await wait(homer ? 900 : 420);
    }
    swinging = false;
    if (homer) playlist(Math.floor(Math.random() * PLAYLISTS.length));
    else open(SIGNS[+el.dataset.i]);
  }

  function fireworks(x, y) {
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      s.style.left = x + 'px'; s.style.top = y + 'px';
      s.style.setProperty('--c', pick(['#ef6b2b', '#ffd36b', '#ffffff', '#7fc4ff']));
      park.appendChild(s);
      const a = rand(0, Math.PI * 2), d = rand(40, 130);
      s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - 30}px) scale(.3)`, opacity: 0 }], { duration: rand(700, 1100), easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
    $('#crowd').classList.remove('roar'); void $('#crowd').offsetWidth; $('#crowd').classList.add('roar');
  }

  /* ------------------------------------------------------------------ taps */
  park.addEventListener('click', e => {
    if (swinging) return;
    const sign = e.target.closest('.sign');
    if (sign) return open(SIGNS[+sign.dataset.i]);
    if (e.target.closest('#screen')) { const sc = $('#screen'); sc.classList.remove('flash'); void sc.offsetWidth; sc.classList.add('flash'); return screen(); }
    if (e.target.closest('[data-cv]')) return openCV();
    if (e.target.closest('#swing') || e.target === park || e.target.closest('.field, .crowd, .sky')) swing();
  });
  addEventListener('keydown', e => {
    if (e.key === ' ' && document.activeElement === document.body && !$$('dialog').some(d => d.open)) { e.preventDefault(); swing(); }
  });

  /* ------------------------------------------------------------------ sound */
  const sfx = (() => {
    let ac = null;
    const noise = (len, shape) => {
      const b = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * shape(i / d.length);
      const s = ac.createBufferSource(); s.buffer = b; return s;
    };
    const play = (len, shape, freq, q, vol) => {
      if (!ac) return;
      try {
        const s = noise(len, shape), f = ac.createBiquadFilter(), g = ac.createGain();
        f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
        s.connect(f).connect(g).connect(ac.destination); s.start();
      } catch (e) { /* quiet */ }
    };
    return {
      wake() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; } },
      crack() { play(.09, t => Math.pow(1 - t, 6), 2200, .9, .5); },
      cheer() { play(2.2, t => Math.sin(Math.PI * Math.min(1, t * 1.6)) * (1 - t * .4), 900, .5, .16); }
    };
  })();

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
  }

  function openWriting() {
    showSheet(`<div class="wr"><p class="sheet-meta">Writing</p><ul class="wr-list">${WRITING.map(a => {
      const href = a.here ? `read.html?c=${encodeURIComponent(a.slug)}` : a.url;
      return `<li><a href="${esc(href)}"${a.here ? '' : ' target="_blank" rel="noopener"'}>${esc(a.title)}</a><span>${esc([a.outlet, year(a.date)].filter(Boolean).join(', '))}</span></li>`;
    }).join('')}</ul></div>`);
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

  // Playlists open one at a time, with arrows through all of them.
  let plAt = 0;
  function playlist(i) {
    plAt = (i + PLAYLISTS.length) % PLAYLISTS.length;
    const p = PLAYLISTS[plAt];
    showSheet(`<div class="pl">
      <img src="${esc(p.cover)}" alt="Cover of ${esc(p.title)}">
      <div><p class="sheet-meta">${esc(p.year || 'Playlist')}</p><h2>${esc(p.title)}</h2>${p.note ? `<p class="words">${esc(p.note)}</p>` : ''}
      <iframe class="spotify" title="${esc(p.title)} on Spotify" src="https://open.spotify.com/embed/playlist/${esc(p.id)}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      ${PLAYLISTS.length > 1 ? `<p class="steps"><button class="step" data-by="-1" type="button" aria-label="Previous playlist">←</button><span>${plAt + 1} / ${PLAYLISTS.length}</span><button class="step" data-by="1" type="button" aria-label="Next playlist">→</button></p>` : ''}</div>
    </div>`);
    $$('.step', sheet).forEach(b => b.addEventListener('click', () => playlist(plAt + +b.dataset.by)));
  }

  // Drawings open one at a time, with arrows through all of them.
  const lb = $('#lightbox');
  let lbAt = 0;
  function drawing(i) {
    lbAt = (i + DRAWINGS.length) % DRAWINGS.length;
    const [id, name, yr] = DRAWINGS[lbAt];
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
  light();
  layout();
  screen();
  nowLine();
  weather();
  astros();
  setInterval(() => { light(); nowLine(); }, 60000);
  setInterval(astros, 120000);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(layout);
  route();
})();
