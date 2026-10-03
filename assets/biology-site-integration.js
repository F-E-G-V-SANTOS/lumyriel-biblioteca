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

  function normalizePublishedCard(card) {
    /* Biologia nasceu no catálogo como projeto futuro. Ao ser publicada, a classe
       future-card continuou aplicando largura de capa, espaçamentos e bordas do
       layout antigo. Removê-la é o que realmente faz o card usar o mesmo CSS
       editorial dos demais livros publicados. */
    card.classList.remove('future-card');
    card.classList.add('biology-publication-card');

    card.style.removeProperty('display');
    card.style.removeProperty('flex-direction');
    card.style.removeProperty('width');
    card.style.removeProperty('max-width');
    card.style.removeProperty('min-width');
    card.style.removeProperty('min-height');
    card.style.removeProperty('align-self');
    card.style.removeProperty('margin');
    card.style.removeProperty('grid-column');
    card.style.removeProperty('grid-row');

    const coverWrap = card.querySelector('.cover-wrap');
    if (coverWrap) {
      coverWrap.style.removeProperty('display');
      coverWrap.style.removeProperty('width');
      coverWrap.style.removeProperty('max-width');
      coverWrap.style.removeProperty('min-width');
      coverWrap.style.removeProperty('flex');
      coverWrap.style.removeProperty('padding');
    }

    const cover = card.querySelector('.cover');
    if (cover) {
      cover.style.removeProperty('width');
      cover.style.removeProperty('max-width');
      cover.style.removeProperty('margin');
    }

    const meta = card.querySelector('.meta');
    if (meta) {
      meta.style.removeProperty('display');
      meta.style.removeProperty('flex-direction');
      meta.style.removeProperty('width');
      meta.style.removeProperty('max-width');
      meta.style.removeProperty('min-width');
      meta.style.removeProperty('flex');
      meta.style.removeProperty('padding');
      meta.style.removeProperty('margin-top');
      meta.style.removeProperty('border-top');
    }

    const bottom = card.querySelector('.bottom');
    if (bottom) {
      bottom.style.removeProperty('width');
      bottom.style.removeProperty('margin-top');
    }
  }

  function publishCard() {
    const card = findBiologyCard();
    const grid = document.getElementById('libraryGrid');
    if (!card || !grid) return;

    normalizePublishedCard(card);

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
    normalizePublishedCard(card);
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

  requestAnimationFrame(() => {
    const card = findBiologyCard();
    if (card) normalizePublishedCard(card);
  });
  window.addEventListener('load', () => {
    const card = findBiologyCard();
    if (card) normalizePublishedCard(card);
  }, { once: true });
  setTimeout(() => {
    const card = findBiologyCard();
    if (card) normalizePublishedCard(card);
  }, 1200);
})();
