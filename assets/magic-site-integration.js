/* Publicação Beta de Artes Mágicas Lumyrielianas no catálogo do site. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_MAGIC_PUBLICATION__) return;
  window.__LUMYRIEL_MAGIC_PUBLICATION__ = true;

  const READER_URL = 'reader.html?book=magia&v=0&intro=1';
  const TITLE = 'Artes Mágicas Lumyrielianas';

  function publishCard() {
    const title = [...document.querySelectorAll('#libraryGrid .book-name')]
      .find(el => el.textContent.trim() === TITLE || el.textContent.trim() === 'Livro das Artes Mágicas');
    if (!title) return;
    if (title.textContent.trim() !== TITLE) title.textContent = TITLE;

    const card = title.closest('.card');
    if (!card) return;
    card.dataset.status = 'live';
    card.classList.add('clickable-book');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Abrir Artes Mágicas Lumyrielianas, leitura Beta');

    const status = card.querySelector('.status');
    if (status) {
      status.className = 'status live';
      status.textContent = 'Leitura disponível · Beta';
    }

    const description = card.querySelector('.meta > p');
    if (description) description.textContent = 'Coleção didática em seis volumes sobre Fundamentos, Mana, Aura, Runologia, Pergaminhos, investigação mágica e Artes de alto risco. O RC1 aprovado está disponível integralmente para leitura Beta no próprio site.';

    const bottom = card.querySelector('.bottom');
    if (bottom) bottom.innerHTML = '<span>Beta · 6 volumes · 392 páginas</span><span class="textlink">Ler agora →</span>';

    const open = () => { location.href = READER_URL; };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  function addAvailableRead() {
    const reads = document.querySelector('.available-reads');
    if (!reads || reads.querySelector('[data-magic-beta]')) return;
    const link = document.createElement('a');
    link.href = READER_URL;
    link.setAttribute('data-magic-beta', 'true');
    link.innerHTML = '<b>Artes Mágicas Lumyrielianas</b><small>Beta · 6 volumes · 392 páginas</small>';
    reads.appendChild(link);
  }

  function updateHeroMagicTitle() {
    document.querySelectorAll('.hero-book h3').forEach(el => {
      if (el.textContent.trim() === 'Livro das Artes Mágicas') el.textContent = TITLE;
    });
  }

  publishCard();
  addAvailableRead();
  updateHeroMagicTitle();
})();
