/* Publicação Beta de Artes Mágicas Lumyrielianas e integrações editoriais da home. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_MAGIC_PUBLICATION__) return;
  window.__LUMYRIEL_MAGIC_PUBLICATION__ = true;

  // A rota de leitura pertence exclusivamente a book-navigation.js.
  const READER_URL = 'reader.html?book=magia&v=0&intro=1';
  const TITLE = 'Artes Mágicas Lumyrielianas';
  const CONSTRUINDO_READER_URL = 'construindo-reader.html?v=0&intro=1';

  function publishCard() {
    const title = [...document.querySelectorAll('#libraryGrid .book-name')]
      .find(el => el.textContent.trim() === TITLE || el.textContent.trim() === 'Livro das Artes Mágicas');
    if (!title) return;
    if (title.textContent.trim() !== TITLE) title.textContent = TITLE;

    const card = title.closest('.card');
    if (!card) return;
    card.dataset.status = 'live';
    card.classList.add('clickable-book');
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
  }

  function publishConstruindoCard() {
    const card = document.getElementById('construindo-project-card');
    if (!card) return;
    card.dataset.status = 'live';
    card.classList.add('live-tool', 'clickable-book');
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', 'Abrir Construindo Mundos, Volume V — Vida Cotidiana');

    const status = card.querySelector('.status');
    if (status) {
      status.className = 'status live';
      status.textContent = 'Volume disponível';
    }

    const description = card.querySelector('.meta > p');
    if (description) description.textContent = 'Coleção metodológica sobre construção de mundos. O Volume V — Vida Cotidiana está concluído e disponível integralmente no leitor da Biblioteca Lumyrieliana.';

    const bottom = card.querySelector('.bottom');
    if (bottom) bottom.innerHTML = '<span>Volume V · 56 capítulos · 290 páginas</span><span class="textlink">Ler agora →</span>';

    const open = () => { window.location.href = CONSTRUINDO_READER_URL; };
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
    if (!reads || reads.querySelector('[data-magic-beta]')) return;
    const link = document.createElement('a');
    link.href = READER_URL;
    link.setAttribute('data-magic-beta', 'true');
    link.innerHTML = '<b>Artes Mágicas Lumyrielianas</b><small>Beta · 6 volumes · 392 páginas</small>';
    reads.appendChild(link);
  }

  function addConstruindoAvailableRead() {
    const reads = document.querySelector('.available-reads');
    if (!reads || reads.querySelector('[data-construindo-v5]')) return;
    const link = document.createElement('a');
    link.href = CONSTRUINDO_READER_URL;
    link.setAttribute('data-construindo-v5', 'true');
    link.innerHTML = '<b>Construindo Mundos — Volume V</b><small>Vida Cotidiana · 56 capítulos · 290 páginas</small>';
    reads.appendChild(link);
  }

  function updateHeroMagicTitle() {
    document.querySelectorAll('.hero-book h3').forEach(el => {
      if (el.textContent.trim() === 'Livro das Artes Mágicas') el.textContent = TITLE;
    });
  }

  function loadBiologyPublication() {
    if (document.querySelector('script[data-lumyriel-biology-publication]')) return;
    const script = document.createElement('script');
    script.src = 'assets/biology-site-integration.js?v=20261002-2';
    script.defer = true;
    script.dataset.lumyrielBiologyPublication = '1';
    document.head.appendChild(script);
  }

  function loadBookNavigation() {
    if (document.querySelector('script[data-lumyriel-book-navigation]')) return;
    const script = document.createElement('script');
    script.src = 'assets/book-navigation.js?v=20261002-4';
    script.defer = true;
    script.dataset.lumyrielBookNavigation = '1';
    document.head.appendChild(script);
  }

  function loadMathReviewState() {
    if (document.querySelector('script[data-lumyriel-math-review]')) return;
    const script = document.createElement('script');
    script.src = 'assets/math-review-state.js?v=20261002-1';
    script.defer = true;
    script.dataset.lumyrielMathReview = '1';
    document.head.appendChild(script);
  }

  function loadRpgProjects() {
    if (!document.getElementById('rpg-preview') || document.querySelector('script[data-lumyriel-rpg-projects]')) return;
    const script = document.createElement('script');
    script.src = 'assets/rpg-projects.js';
    script.defer = true;
    script.dataset.lumyrielRpgProjects = '1';
    document.head.appendChild(script);
  }

  publishCard();
  publishConstruindoCard();
  addAvailableRead();
  addConstruindoAvailableRead();
  updateHeroMagicTitle();
  loadBiologyPublication();
  loadBookNavigation();
  loadMathReviewState();
  loadRpgProjects();
})();
