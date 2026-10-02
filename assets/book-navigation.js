/* Navegação central e resiliente dos livros publicados da Biblioteca Lumyrieliana. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_BOOK_NAVIGATION__) return;
  window.__LUMYRIEL_BOOK_NAVIGATION__ = true;

  const BOOKS = [
    { names: ['o filho da montanha'], url: 'reader.html?book=filho&v=0&intro=1' },
    { names: ['os livros dos tempos'], url: 'reader.html?book=tempos&v=0&intro=1' },
    { names: ['artes mágicas lumyrielianas', 'livro das artes mágicas'], url: 'reader.html?book=magia&v=0&intro=1' },
    { names: ['matemática e física de lumyriel', 'matemática lumyrieliana'], url: 'reader.html?book=matematica&v=0&intro=1' },
    { names: ['biologia de lumyriel', 'biologia lumyrieliana'], url: 'biology-reader.html?v=0&mode=intro' }
  ];

  const normalize = value => (value || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  const routeForCard = card => {
    if (!card || !card.closest('#libraryGrid')) return null;
    const title = normalize(card.querySelector('.book-name')?.textContent || card.querySelector('h3')?.textContent);
    return BOOKS.find(book => book.names.some(name => normalize(name) === title)) || null;
  };

  const prepare = () => {
    document.querySelectorAll('#libraryGrid .card').forEach(card => {
      const book = routeForCard(card);
      if (!book) return;
      card.classList.add('clickable-book');
      card.dataset.readerUrl = book.url;
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
    });
  };

  const openCard = card => {
    const book = routeForCard(card);
    if (!book) return false;
    location.assign(book.url);
    return true;
  };

  /* Captura antes de integrações antigas para impedir que listeners conflitantes
     transformem o clique em simples seleção/rolagem. */
  document.addEventListener('click', event => {
    const card = event.target.closest?.('#libraryGrid .card');
    if (!card || !routeForCard(card)) return;
    if (event.target.closest('a[href],button,select,input,textarea')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openCard(card);
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest?.('#libraryGrid .card');
    if (!card || !routeForCard(card)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openCard(card);
  }, true);

  prepare();
  window.addEventListener('load', prepare, { once: true });
  setTimeout(prepare, 250);
  setTimeout(prepare, 1000);
})();
