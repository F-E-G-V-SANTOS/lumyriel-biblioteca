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

  function enforceStandardCardLayout(card) {
    /* Defesa contra regras editoriais antigas: Biologia deve obedecer à mesma
       geometria vertical dos demais cards, independentemente da ordem em que
       scripts legados sejam executados. */
    card.style.setProperty('display', 'flex', 'important');
    card.style.setProperty('flex-direction', 'column', 'important');
    card.style.setProperty('width', 'auto', 'important');
    card.style.setProperty('max-width', 'none', 'important');
    card.style.setProperty('min-width', '0', 'important');
    card.style.setProperty('align-self', 'stretch', 'important');
    card.style.setProperty('margin', '0', 'important');

    const coverWrap = card.querySelector('.cover-wrap');
    if (coverWrap) {
      coverWrap.style.setProperty('display', 'block', 'important');
      coverWrap.style.setProperty('width', '100%', 'important');
      coverWrap.style.setProperty('max-width', 'none', 'important');
      coverWrap.style.setProperty('flex', '0 0 auto', 'important');
    }

    const meta = card.querySelector('.meta');
    if (meta) {
      meta.style.setProperty('display', 'flex', 'important');
      meta.style.setProperty('flex-direction', 'column', 'important');
      meta.style.setProperty('width', '100%', 'important');
      meta.style.setProperty('max-width', 'none', 'important');
      meta.style.setProperty('min-width', '0', 'important');
      meta.style.setProperty('flex', '1 1 auto', 'important');
    }

    const bottom = card.querySelector('.bottom');
    if (bottom) {
      bottom.style.setProperty('width', '100%', 'important');
      bottom.style.setProperty('margin-top', 'auto', 'important');
    }
  }

  function publishCard() {
    const card = findBiologyCard();
    const grid = document.getElementById('libraryGrid');
    if (!card || !grid) return;

    card.classList.add('biology-publication-card');
    card.style.removeProperty('grid-column');
    card.style.removeProperty('grid-row');
    card.style.removeProperty('min-height');
    enforceStandardCardLayout(card);

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
    enforceStandardCardLayout(card);
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

  /* Alguns scripts da home terminam depois desta integração. Reaplica somente
     a geometria do card de Biologia após esses ciclos, sem mover outros cards. */
  requestAnimationFrame(() => {
    const card = findBiologyCard();
    if (card) enforceStandardCardLayout(card);
  });
  window.addEventListener('load', () => {
    const card = findBiologyCard();
    if (card) enforceStandardCardLayout(card);
  }, { once: true });
  setTimeout(() => {
    const card = findBiologyCard();
    if (card) enforceStandardCardLayout(card);
  }, 1200);
})();
