/* Estado editorial temporário: Matemática e Física de Lumyriel está em revisão. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_MATH_REVIEW_STATE__) return;
  window.__LUMYRIEL_MATH_REVIEW_STATE__ = true;

  const MATH_TITLES = new Set(['Matemática e Física de Lumyriel', 'Matemática Lumyrieliana']);

  const isMathCard = card => {
    const title = card?.querySelector('.book-name')?.textContent?.trim();
    return Boolean(title && MATH_TITLES.has(title));
  };

  function disableMathCard() {
    const card = [...document.querySelectorAll('#libraryGrid .card')].find(isMathCard);
    if (!card) return;

    card.dataset.status = 'dev';
    card.dataset.bookKey = 'matematica-review';
    delete card.dataset.readerUrl;
    card.classList.remove('clickable-book');
    card.removeAttribute('role');
    card.removeAttribute('tabindex');
    card.removeAttribute('onclick');
    card.setAttribute('aria-label', 'Matemática e Física de Lumyriel, em revisão');

    if (card.tagName === 'A') {
      card.removeAttribute('href');
      card.style.cursor = 'default';
    }

    const status = card.querySelector('.status');
    if (status) {
      status.className = 'status dev';
      status.textContent = 'Em revisão';
    }

    const description = card.querySelector('.meta > p');
    if (description) description.textContent = 'Esta edição foi retirada temporariamente da leitura enquanto uma nova versão, mais clara, didática e consistente, é preparada.';

    const bottom = card.querySelector('.bottom');
    if (bottom) bottom.innerHTML = '<span>nova edição em preparação</span><button class="textlink" type="button" disabled>Leitura temporariamente indisponível</button>';
  }

  function removeMathReadLinks() {
    document.querySelectorAll('.available-reads a').forEach(link => {
      const text = link.textContent || '';
      if (/Matemática(?: e Física)? de Lumyriel|Matemática Lumyrieliana/i.test(text) || /book=matematica/i.test(link.getAttribute('href') || '')) link.remove();
    });
  }

  function removeMathFromReaderSelector() {
    const selector = document.getElementById('bookSelector');
    selector?.querySelector('option[value="matematica"]')?.remove();
  }

  function apply() {
    disableMathCard();
    removeMathReadLinks();
    removeMathFromReaderSelector();
  }

  /* Bloqueia qualquer handler legado que tente reabrir a edição antiga. */
  document.addEventListener('click', event => {
    const card = event.target.closest?.('#libraryGrid .card');
    if (!isMathCard(card)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  apply();
  requestAnimationFrame(apply);
  window.addEventListener('load', apply, { once: true });
  setTimeout(apply, 300);
  setTimeout(apply, 1200);
})();
