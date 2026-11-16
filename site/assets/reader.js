/* Shows one saved copy from content/clips/: the words and pictures, without the ads. */
(function () {
  const W = window.SAB_WRITING || [];
  const main = document.getElementById('reader');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const slug = new URLSearchParams(location.search).get('c') || '';
  const entry = W.find(a => a.slug === slug);
  const fmt = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); const mo = m ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m - 1] : ''; return [mo, dd ? +dd + ',' : '', y].filter(Boolean).join(' '); };
  const back = '<p class="r-links"><a href="./">Back</a></p>';

  if (!/^[a-z0-9-]+$/i.test(slug) || !entry || !entry.here) {
    main.innerHTML = `<div class="r-missing"><p class="r-links">${entry ? `<a href="${esc(entry.url)}">${esc(entry.title)} ↗</a>` : ''}<a href="./">Back</a></p></div>`;
    return;
  }

  const s = document.createElement('script');
  s.src = `content/clips/${slug}.js`;
  s.onload = () => render(window.CLIP);
  s.onerror = () => { main.innerHTML = back; };
  document.body.appendChild(s);

  function block(b) {
    if (b.t === 'p') return `<p>${b.html}</p>`;
    if (b.t === 'h') return `<h2>${b.html}</h2>`;
    if (b.t === 'quote') return `<blockquote>${b.html}</blockquote>`;
    if (b.t === 'ul') return `<ul>${b.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    if (b.t === 'img') {
      const cap = (b.caption ? esc(b.caption) : '') + (b.credit ? ` <span class="credit">${esc(b.credit)}</span>` : '');
      return `<figure><img src="${esc(b.src)}" alt="${esc(b.alt || '')}" loading="lazy"${b.w ? ` width="${b.w}" height="${b.h}"` : ''}>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
    }
    if (b.t === 'link') return `<p class="r-link"><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label)} ↗</a></p>`;
    return '';
  }

  function render(c) {
    const outlet = entry.outlet || c.outlet || '', date = entry.date || c.date || '';
    document.title = `${c.title} · Summer Anne Burton`;
    const others = W.filter(a => a.slug !== slug && a.here).sort(() => Math.random() - .5).slice(0, 3);
    main.innerHTML = `
      <article>
        <header class="r-head">
          <div class="r-mast"><span>${esc(outlet)}</span><span>${esc(fmt(date))}</span></div>
          <h1>${esc(c.title)}</h1>
          ${c.dek ? `<p class="r-dek">${esc(c.dek)}</p>` : ''}
          <p class="r-by">By Summer Anne Burton</p>
        </header>
        <div class="r-body">${c.blocks.map(block).join('')}</div>
        <footer class="r-note">
          <p>${esc(outlet)}${date ? `, ${esc(fmt(date))}` : ''}. <a href="${esc(c.url)}" target="_blank" rel="noopener">Original ↗</a></p>
        </footer>
      </article>
      ${others.length ? `<aside class="r-more"><h2 class="r-more-h">More writing</h2><div class="r-more-row">${others.map(o => `<a class="clip" href="read.html?c=${esc(o.slug)}"><span class="clip-mast"><span>${esc(o.outlet)}</span><span>${esc((o.date || '').slice(0, 4))}</span></span><span class="clip-h">${esc(o.title)}</span></a>`).join('')}</div></aside>` : ''}`;
    window.scrollTo(0, 0);
  }
})();
