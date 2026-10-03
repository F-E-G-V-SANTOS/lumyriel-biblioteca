/* Figuras editoriais do leitor — integração genérica para livros ilustrados.
   Matemática usa manifesto editorial; Artes Mágicas usa o lote final já publicado.
   O texto continua sendo o fallback seguro. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_READER_FIGURES__) return;
  window.__LUMYRIEL_READER_FIGURES__ = true;

  const params = new URLSearchParams(location.search);
  const book = params.get('book');
  const CONFIG = {
    matematica: {
      root: 'assets/books/matematica-fisica/',
      manifest: 'assets/books/matematica-fisica/manifest.json?v=20261003-3'
    },
    magia: {
      root: 'assets/books/artes-magicas/',
      figures: Array.from({length:11}, (_,i) => ({
        id: String(i + 1), kind: 'Figura',
        file: `volume-iv-figura-${String(i + 1).padStart(2,'0')}.webp`, volume: 'IV'
      }))
    }
  };
  const config = CONFIG[book];
  if (!config) return;

  let manifest = null;
  let scheduled = false;
  const norm = value => (value || '').replace(/\s+/g, ' ').trim();
  const esc = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function makeFigure(item) {
    const figure = document.createElement('figure');
    figure.className = 'reader-editorial-figure';
    figure.dataset.figureId = item.id;
    const img = document.createElement('img');
    img.loading = 'lazy'; img.decoding = 'async';
    img.alt = item.title || `${item.kind || 'Figura'} ${item.id}`;
    img.src = `${config.root}${item.file}`;
    const caption = document.createElement('figcaption');
    const strong = document.createElement('strong');
    strong.textContent = `${item.kind || 'Figura'} ${item.id}`;
    caption.append(strong);
    if (item.title) caption.append(document.createTextNode(` — ${item.title}`));
    figure.append(img, caption);
    return {figure,img};
  }

  function candidateFor(content,item) {
    const id = esc(item.id);
    const blocks = [...content.querySelectorAll('p,li,h2,h3,h4,blockquote')];
    if (book === 'magia') {
      const exact = new RegExp(`\\bFigura\\s+(?:IV[.\-–— ]*)?${id}\\b`, 'i');
      return blocks.find(el => exact.test(norm(el.textContent))) || null;
    }
    const idRe = new RegExp(`\\b${id}\\b`, 'i');
    const kindRe = /\b(?:Figura|Tabela)\b/i;
    return blocks.find(el => idRe.test(norm(el.textContent)) && kindRe.test(norm(el.textContent)))
      || blocks.find(el => idRe.test(norm(el.textContent))) || null;
  }

  function isCaptionLike(el,item) {
    const text = norm(el.textContent);
    if (book === 'magia') return new RegExp(`^Figura\\s+(?:IV[.\-–— ]*)?${esc(item.id)}(?:\\s*[—–:-]|\\s*$)`, 'i').test(text);
    return new RegExp(`^(?:Figura|Tabela)\\s+${esc(item.id)}(?:\\s*[—–:-]|\\s*$)`, 'i').test(text);
  }

  function enhance(root=document) {
    if (!manifest?.figures?.length) return;
    const content = root.matches?.('.content') ? root : root.querySelector?.('.content');
    if (!content) return;
    for (const item of manifest.figures) {
      const key = `${book}-${item.id}`;
      if (content.querySelector(`[data-figure-key="${key}"]`)) continue;
      const anchor = candidateFor(content,item);
      if (!anchor || anchor.dataset.figureAnchor === key) continue;
      anchor.dataset.figureAnchor = key;
      const {figure,img} = makeFigure(item);
      figure.dataset.figureKey = key;

      /* A figura precisa entrar no DOM antes de aguardarmos load.
         Imagens lazy destacadas do DOM podem nunca iniciar a requisição,
         o que criava um impasse: load aguardava inserção e inserção aguardava load. */
      anchor.insertAdjacentElement('afterend', figure);

      img.addEventListener('load', () => {
        if (isCaptionLike(anchor,item) && anchor.isConnected) anchor.remove();
      }, {once:true});
      img.addEventListener('error', () => {
        if (anchor.isConnected) anchor.removeAttribute('data-figure-anchor');
        figure.remove();
      }, {once:true});
    }
  }

  function scheduleEnhance(){
    if(scheduled)return; scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhance(document)});
  }

  const style=document.createElement('style');
  style.id='lumyriel-reader-figure-style';
  style.textContent=`
    .reader-editorial-figure{margin:34px auto 40px;padding:14px;max-width:920px;background:rgba(255,255,255,.13);border:1px solid rgba(88,67,43,.25);break-inside:avoid}
    .reader-editorial-figure img{display:block;width:100%;height:auto;max-height:78vh;background:#f1e7d2;object-fit:contain}
    .reader-editorial-figure figcaption{margin-top:11px;color:#655541;font:.88rem/1.55 Georgia,"Times New Roman",serif}
    .reader-editorial-figure figcaption strong{color:#473a2b;font-weight:700}
    @media(max-width:850px){.reader-editorial-figure{margin:28px -8px 34px;padding:8px}.reader-editorial-figure img{max-height:none}.reader-editorial-figure figcaption{padding:0 4px;font-size:.84rem}}
  `;
  document.head.appendChild(style);

  const ready = config.manifest
    ? fetch(config.manifest,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`manifest ${r.status}`);return r.json()})
    : Promise.resolve({book,figures:config.figures,count:config.figures.length});

  ready.then(data=>{
    manifest=data;
    if(manifest.count != null && manifest.count !== manifest.figures?.length)
      console.warn('[Lumyriel] Manifesto visual inconsistente.',manifest);
    scheduleEnhance();
  }).catch(error=>console.warn(`[Lumyriel] Figuras de ${book} indisponíveis; texto preservado.`,error));

  const paper=document.getElementById('paperInner')||document.body;
  new MutationObserver(scheduleEnhance).observe(paper,{childList:true,subtree:true});
})();
