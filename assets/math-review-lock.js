/* Suspende publicamente a leitura de Matemática e Física de Lumyriel durante revisão editorial. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_MATH_REVIEW_LOCK__) return;
  window.__LUMYRIEL_MATH_REVIEW_LOCK__ = true;

  const isMathReader = /(?:^|\/)reader\.html$/.test(location.pathname) && new URLSearchParams(location.search).get('book') === 'matematica';
  if (isMathReader) {
    location.replace('index.html#biblioteca');
    return;
  }

  const apply = () => {
    document.querySelectorAll('#bookSelector option[value="matematica"]').forEach(option => option.remove());

    document.querySelectorAll('.lumyriel-hero-deck-item[data-key="matematica"]').forEach(card => card.remove());

    const mathCover = document.querySelector('#libraryGrid [data-cover="matematica"]');
    const mathCard = mathCover?.closest('.card');
    if (mathCard) {
      let card = mathCard;
      if (card.tagName === 'A') {
        const article = document.createElement('article');
        [...card.attributes].forEach(attr => {
          if (!['href','onclick','aria-label','role','tabindex'].includes(attr.name)) article.setAttribute(attr.name, attr.value);
        });
        article.innerHTML = card.innerHTML;
        card.replaceWith(article);
        card = article;
      }
      card.classList.remove('clickable-book');
      card.dataset.status = 'dev';
      delete card.dataset.bookKey;
      delete card.dataset.readerUrl;
      const status = card.querySelector('.status');
      if (status) {
        status.className = 'status dev';
        status.textContent = 'Em revisão';
      }
      const bottom = card.querySelector('.bottom');
      if (bottom) bottom.innerHTML = '<span>Edição temporariamente retirada para revisão</span><button class="textlink" disabled>Leitura indisponível</button>';
    }

    document.querySelectorAll('.available-reads a[href*="book=matematica"]').forEach(link => link.remove());
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once:true });
  else apply();
  setTimeout(apply, 250);
  setTimeout(apply, 1000);

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList:true, subtree:true });
  setTimeout(() => observer.disconnect(), 4000);
})();
