/* Publicação RC1 de Biologia de Lumyriel e integração editorial da home. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_BIOLOGY_PUBLICATION__) return;
  window.__LUMYRIEL_BIOLOGY_PUBLICATION__ = true;

  const READER_URL = 'biology-reader.html?v=0&mode=intro';
  const TITLE = 'Biologia de Lumyriel';

  function findBiologyCard() {
    const titles = [...document.querySelectorAll('.book-name')];
    const title = titles.find(el => ['Biologia Lumyrieliana', TITLE].includes(el.textContent.trim()));
    return title ? title.closest('.card') : null;
  }

  function ensureStyle(){
    if(document.getElementById('biology-card-layout-fix'))return;
    const style=document.createElement('style');
    style.id='biology-card-layout-fix';
    style.textContent=`
      #libraryGrid .biology-publication-card{display:flex!important;flex-direction:column!important;grid-column:auto!important;grid-row:auto!important;width:auto!important;max-width:none!important;min-width:0!important;min-height:590px!important;align-items:stretch!important}
      #libraryGrid .biology-publication-card .cover-wrap{display:block!important;width:100%!important;padding:18px 28px 0!important}
      #libraryGrid .biology-publication-card .cover{display:flex!important;width:min(100%,260px)!important;height:auto!important;aspect-ratio:.555!important;margin-inline:auto!important}
      #libraryGrid .biology-publication-card .meta{display:flex!important;flex-direction:column!important;width:100%!important;padding:22px 22px 24px!important;gap:12px!important;flex:1!important}
      #libraryGrid .biology-publication-card .meta>p{max-width:none!important;width:auto!important}
      #libraryGrid .biology-publication-card .bottom{margin-top:auto!important;width:100%!important}
      @media(max-width:980px){#libraryGrid .biology-publication-card{min-height:0!important}}
    `;
    document.head.appendChild(style);
  }

  function publishCard() {
    const card = findBiologyCard();
    const grid = document.getElementById('libraryGrid');
    if (!card || !grid) return;

    ensureStyle();
    card.classList.add('biology-publication-card');
    const title = card.querySelector('.book-name');
    if (title) title.textContent = TITLE;
    const coverTitle = card.querySelector('.cover h3');
    if (coverTitle && !card.querySelector('.cover.real-cover')) coverTitle.textContent = TITLE;

    card.dataset.status = 'live';
    card.classList.add('clickable-book');
    card.setAttribute('aria-label', 'Abrir Biologia de Lumyriel, Primeira Edição RC1');

    const status = card.querySelector('.status');
    if (status) { status.className = 'status live'; status.textContent = 'Leitura disponível · RC1'; }

    const description = card.querySelector('.meta > p');
    if (description) description.textContent = 'Coleção didática em seis volumes sobre fundamentos da vida, hereditariedade e evolução, fisiologia comparada, ecologia, diversidade, doença, reparo, regeneração e medicina em Lumyriel.';

    const bottom = card.querySelector('.bottom');
    if (bottom) bottom.innerHTML = '<span>RC1 · 6 volumes · 33 partes · 138 capítulos</span><span class="textlink">Ler agora →</span>';

    if (card.parentElement !== grid) grid.appendChild(card);
  }

  function addAvailableRead() {
    const reads = document.querySelector('.available-reads');
    if (!reads || reads.querySelector('[data-biology-rc1]')) return;
    const link = document.createElement('a');
    link.href = READER_URL;
    link.setAttribute('data-biology-rc1', 'true');
    link.innerHTML = '<b>Biologia de Lumyriel</b><small>RC1 · 6 volumes · 33 partes · 138 capítulos</small>';
    reads.appendChild(link);
  }

  publishCard();
  addAvailableRead();
})();
