/* Figuras editoriais do leitor — preserva a legenda textual como fallback. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_READER_FIGURES__) return;
  window.__LUMYRIEL_READER_FIGURES__ = true;

  const params = new URLSearchParams(location.search);
  const book = params.get('book');
  if (book !== 'matematica') return;

  const ROOT = 'assets/books/matematica-fisica/';
  const CAPTION = /^(Figura|Tabela)\s+((?:VIS|TAB)-[A-Z0-9-]+)\s+[—–-]\s+(.+)$/i;

  const slug = id => id.toLowerCase();

  function enhance(root = document) {
    root.querySelectorAll?.('.content p:not([data-figure-checked])').forEach(p => {
      p.dataset.figureChecked = '1';
      const text = (p.textContent || '').replace(/\s+/g, ' ').trim();
      const match = text.match(CAPTION);
      if (!match) return;

      const [, kind, id, title] = match;
      const figure = document.createElement('figure');
      figure.className = 'reader-editorial-figure';
      figure.dataset.figureId = id.toUpperCase();

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = title;
      img.src = `${ROOT}${slug(id)}.webp`;

      const caption = document.createElement('figcaption');
      const strong = document.createElement('strong');
      strong.textContent = `${kind} ${id.toUpperCase()}`;
      caption.append(strong, document.createTextNode(` — ${title}`));

      figure.append(img, caption);
      img.addEventListener('load', () => p.replaceWith(figure), { once: true });
      img.addEventListener('error', () => figure.remove(), { once: true });
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    .reader-editorial-figure{margin:34px 0 40px;padding:14px;background:rgba(255,255,255,.13);border:1px solid rgba(88,67,43,.25)}
    .reader-editorial-figure img{display:block;width:100%;height:auto;background:#f1e7d2;object-fit:contain}
    .reader-editorial-figure figcaption{margin-top:11px;color:#655541;font:.88rem/1.55 Georgia,"Times New Roman",serif}
    .reader-editorial-figure figcaption strong{color:#473a2b;font-weight:700}
    @media(max-width:850px){.reader-editorial-figure{margin:28px -8px 34px;padding:8px}.reader-editorial-figure figcaption{padding:0 4px;font-size:.84rem}}
  `;
  document.head.appendChild(style);

  const paper = document.getElementById('paperInner') || document.body;
  enhance(paper);
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType === 1) enhance(node.matches?.('.content') ? node : node);
    }
  }).observe(paper, { childList: true, subtree: true });
})();
