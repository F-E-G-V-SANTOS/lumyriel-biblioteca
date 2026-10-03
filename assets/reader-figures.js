/* Figuras editoriais do leitor — Matemática e Física de Lumyriel.
   O manifesto é a fonte de verdade dos assets; o texto continua sendo o fallback. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_READER_FIGURES__) return;
  window.__LUMYRIEL_READER_FIGURES__ = true;

  const params = new URLSearchParams(location.search);
  if (params.get('book') !== 'matematica') return;

  const ROOT = 'assets/books/matematica-fisica/';
  const MANIFEST_URL = `${ROOT}manifest.json?v=20261003-2`;
  let manifest = null;
  let scheduled = false;

  const norm = value => (value || '').replace(/\s+/g, ' ').trim();
  const esc = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function makeFigure(item) {
    const figure = document.createElement('figure');
    figure.className = 'reader-editorial-figure';
    figure.dataset.figureId = item.id;

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = item.title || `${item.kind} ${item.id}`;
    img.src = `${ROOT}${item.file}`;

    const caption = document.createElement('figcaption');
    const strong = document.createElement('strong');
    strong.textContent = `${item.kind} ${item.id}`;
    caption.append(strong);
    if (item.title) caption.append(document.createTextNode(` — ${item.title}`));
    figure.append(img, caption);
    return { figure, img };
  }

  function candidateFor(root, item) {
    const content = root.matches?.('.content') ? root : root.querySelector?.('.content');
    if (!content) return null;
    const idRe = new RegExp(`\\b${esc(item.id)}\\b`, 'i');
    const kindRe = new RegExp(`\\b(?:Figura|Tabela)\\b`, 'i');
    const blocks = [...content.querySelectorAll('p,li,h2,h3,h4,blockquote')];
    return blocks.find(el => idRe.test(norm(el.textContent)) && kindRe.test(norm(el.textContent)))
      || blocks.find(el => idRe.test(norm(el.textContent)))
      || null;
  }

  function isCaptionLike(el, item) {
    const text = norm(el.textContent);
    const re = new RegExp(`^(?:Figura|Tabela)\\s+${esc(item.id)}(?:\\s*[—–:-]|\\s*$)`, 'i');
    return re.test(text);
  }

  function enhance(root = document) {
    if (!manifest?.figures?.length) return;
    const content = root.matches?.('.content') ? root : root.querySelector?.('.content');
    if (!content) return;

    for (const item of manifest.figures) {
      if (content.querySelector(`[data-figure-id="${item.id}"]`)) continue;
      const anchor = candidateFor(content, item);
      if (!anchor || anchor.dataset.figureAnchor === item.id) continue;
      anchor.dataset.figureAnchor = item.id;

      const { figure, img } = makeFigure(item);
      img.addEventListener('load', () => {
        if (!anchor.isConnected || content.querySelector(`[data-figure-id="${item.id}"]`)) return;
        if (isCaptionLike(anchor, item)) anchor.replaceWith(figure);
        else anchor.insertAdjacentElement('afterend', figure);
      }, { once: true });
      img.addEventListener('error', () => {
        anchor.removeAttribute('data-figure-anchor');
        figure.remove();
      }, { once: true });
    }
  }

  function scheduleEnhance() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance(document);
    });
  }

  const style = document.createElement('style');
  style.id = 'lumyriel-reader-figure-style';
  style.textContent = `
    .reader-editorial-figure{margin:34px auto 40px;padding:14px;max-width:920px;background:rgba(255,255,255,.13);border:1px solid rgba(88,67,43,.25);break-inside:avoid}
    .reader-editorial-figure img{display:block;width:100%;height:auto;max-height:78vh;background:#f1e7d2;object-fit:contain}
    .reader-editorial-figure figcaption{margin-top:11px;color:#655541;font:.88rem/1.55 Georgia,"Times New Roman",serif}
    .reader-editorial-figure figcaption strong{color:#473a2b;font-weight:700}
    @media(max-width:850px){.reader-editorial-figure{margin:28px -8px 34px;padding:8px}.reader-editorial-figure img{max-height:none}.reader-editorial-figure figcaption{padding:0 4px;font-size:.84rem}}
  `;
  document.head.appendChild(style);

  fetch(MANIFEST_URL, { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error(`manifest ${response.status}`);
      return response.json();
    })
    .then(data => {
      manifest = data;
      if (manifest.book !== 'matematica' || manifest.count !== manifest.figures?.length) {
        console.warn('[Lumyriel] Manifesto visual de Matemática inconsistente.', manifest);
      }
      scheduleEnhance();
    })
    .catch(error => console.warn('[Lumyriel] Figuras de Matemática indisponíveis; texto preservado.', error));

  const paper = document.getElementById('paperInner') || document.body;
  new MutationObserver(() => scheduleEnhance()).observe(paper, { childList: true, subtree: true });
})();
