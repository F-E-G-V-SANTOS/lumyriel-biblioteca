/* Publicação RC1 de Biologia de Lumyriel e integração editorial da home. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_BIOLOGY_PUBLICATION__) return;
  window.__LUMYRIEL_BIOLOGY_PUBLICATION__ = true;

  // O site não lê PDF. A edição pública usa o payload nativo .dat do leitor.
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

    const title = card.querySelector('.book-name');
    if (title) title.textContent = TITLE;
    const coverTitle = card.querySelector('.cover h3');
    if (coverTitle && !card.querySelector('.cover.real-cover')) coverTitle.textContent = TITLE;

    card.dataset.status = 'live';
    card.classList.add('clickable-book');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Abrir Biologia de Lumyriel, Primeira Edição RC1');

    const status = card.querySelector('.status');
    if (status) {
      status.className = 'status live';
      status.textContent = 'Leitura disponível · RC1';
    }

    const description = card.querySelector('.meta > p');
    if (description) description.textContent = 'Coleção didática em seis volumes sobre fundamentos da vida, hereditariedade e evolução, fisiologia comparada, ecologia, diversidade, doença, reparo, regeneração e medicina em Lumyriel.';

    const bottom = card.querySelector('.bottom');
    if (bottom) bottom.innerHTML = '<span>RC1 · 6 volumes · 33 partes · 138 capítulos</span><span class="textlink">Ler agora →</span>';

    if (card.parentElement !== grid) grid.appendChild(card);
    const open = () => { location.href = READER_URL; };
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });
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
