/* The reading room: shows one clean copy from content/clips/, like a page torn out and kept. */
(function () {
  const S = window.SAB, have = window.SAB_CLIPS || {};
  const main = document.getElementById('reader');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]));
  const slug = new URLSearchParams(location.search).get('c') || '';
  const entry = S.clippings.find(c => c.slug === slug);
  const fmt = d => { if (!d) return ''; const [y, m, dd] = d.split('-'); const mo = m ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+m - 1] : ''; return [mo, dd ? +dd + ',' : '', y].filter(Boolean).join(' '); };

  if (!/^[a-z0-9-]+$/i.test(slug) || !have[slug]) {
    main.innerHTML = `<div class="r-missing"><h1 class="riso-h" data-text="Not in the box">Not in the box</h1>
      <p>There’s no clean copy of that one yet.${entry ? ` You can read it <a href="${esc(entry.url)}">where it was first published</a>.` : ''}</p>
      <p><a class="btn" href="./#clippings">See all the clippings</a></p></div>`;
    return;
  }

  const s = document.createElement('script');
  s.src = `content/clips/${slug}.js`;
  s.onload = () => render(window.CLIP);
  s.onerror = () => { main.innerHTML = '<p class="loading">That clipping didn’t load. Try again?</p>'; };
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
    if (b.t === 'link') return `<p class="r-link"><a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label)} was here. See it where it lives ↗</a></p>`;
    return '';
  }

  function render(c) {
    const e = entry || {};
    const outlet = e.outlet || c.outlet || '';
    const date = e.date || c.date || '';
    document.title = `${c.title} · Summer Anne Burton`;
    const others = S.clippings.filter(x => x.slug !== slug && have[x.slug]).sort(() => Math.random() - .5).slice(0, 3);
    main.innerHTML = `
      <article>
        <header class="r-head">
          <div class="r-mast"><span>${esc(outlet)}</span><span>${esc(fmt(date))}</span></div>
          <h1>${esc(c.title)}</h1>
          ${(e.dek || c.dek) ? `<p class="r-dek">${esc(e.dek || c.dek)}</p>` : ''}
          <p class="r-by">By Summer Anne Burton</p>
        </header>
        <div class="r-body">${c.blocks.map(block).join('')}</div>
        <footer class="r-note">
          <p>This is a clean copy of a piece I wrote for ${esc(outlet || 'somewhere else')}${date ? ` in ${esc(date.slice(0, 4))}` : ''}, kept here without the ads, pop-ups and broken pictures.
          ${c.source === 'Internet Archive' ? 'It came from the Internet Archive’s saved copy.' : ''} <a href="${esc(e.archiveOnly ? 'https://web.archive.org/web/2014/' + c.url : c.url)}" target="_blank" rel="noopener">The original is here ↗</a></p>
        </footer>
      </article>
      ${others.length ? `<aside class="r-more"><h2 class="sub-h">More clippings</h2><div class="r-more-row">${others.map(o => `<a class="clip" href="read.html?c=${esc(o.slug)}"><span class="clip-mast"><span>${esc(o.outlet)}</span><span>${esc((o.date || '').slice(0, 4))}</span></span><span class="clip-h">${esc(o.title)}</span></a>`).join('')}</div></aside>` : ''}`;
    window.scrollTo(0, 0);
  }
})();
