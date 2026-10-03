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

  function publishCard() {
    const card = findBiologyCard();
    const grid = document.getElementById('libraryGrid');
    if (!card || !grid) return;

    /* Biologia usa exatamente o mesmo layout-base dos demais livros.
       Não aplicar dimensões/posicionamento próprios aqui: o grid da Biblioteca
       é a fonte única de alinhamento visual entre os cards publicados. */
    card.classList.add('biology-publication-card');
    card.style.removeProperty('grid-column');
    card.style.removeProperty('grid-row');
    card.style.removeProperty('width');
    card.style.removeProperty('max-width');
    card.style.removeProperty('min-height');
    card.style.removeProperty('align-self');
    card.style.removeProperty('margin');

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
