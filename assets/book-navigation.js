/* Fonte única de rotas e navegação dos livros publicados da Biblioteca Lumyrieliana. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_BOOK_NAVIGATION__) return;
  window.__LUMYRIEL_BOOK_NAVIGATION__ = true;

  const BOOKS = Object.freeze({
    filho: { names: ['o filho da montanha'], url: 'reader.html?book=filho&v=0&intro=1' },
    tempos: { names: ['os livros dos tempos'], url: 'reader.html?book=tempos&v=0&intro=1' },
    magia: { names: ['artes mágicas lumyrielianas', 'livro das artes mágicas'], url: 'reader.html?book=magia&v=0&intro=1' },
    matematica: { names: ['matemática e física de lumyriel', 'matemática lumyrieliana'], url: 'reader.html?book=matematica&v=0&intro=1' },
    biologia: { names: ['biologia de lumyriel', 'biologia lumyrieliana'], url: 'biology-reader.html?v=0&mode=intro' }
  });

  const normalize = value => (value || '').normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
  const byName = title => Object.entries(BOOKS).find(([, book]) => book.names.some(name => normalize(name) === normalize(title)));
  const routeForCard = card => {
    if (!card || !card.closest('#libraryGrid')) return null;
    const title = card.querySelector('.book-name')?.textContent || card.querySelector('h3')?.textContent;
    const match = byName(title);
    return match ? { key: match[0], ...match[1] } : null;
  };

  const open = keyOrUrl => {
    const url = BOOKS[keyOrUrl]?.url || keyOrUrl;
    if (!url) return false;
    location.assign(url);
    return true;
  };

  window.LUMYRIEL_BOOKS = BOOKS;
  window.LUMYRIEL_BOOK_NAVIGATION = Object.freeze({
    books: BOOKS,
    urlFor: key => BOOKS[key]?.url || null,
    isPublished: key => Boolean(BOOKS[key]),
    open
  });

  const prepare = () => {
    document.querySelectorAll('#libraryGrid .card').forEach(card => {
      const book = routeForCard(card);
      if (!book) return;
      card.classList.add('clickable-book');
      card.dataset.bookKey = book.key;
      card.dataset.readerUrl = book.url;
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
    });
  };

  const openCard = card => {
    const book = routeForCard(card);
    return book ? open(book.key) : false;
  };

  /* Uma única captura governa os cards publicados e neutraliza listeners legados. */
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
