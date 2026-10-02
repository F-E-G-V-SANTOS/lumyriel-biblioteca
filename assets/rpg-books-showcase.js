/*
  Os quatro livros futuros do Lumyriel RPG pertencem somente ao catálogo geral
  de Próximos Projetos. Este módulo elimina vitrines duplicadas antigas e garante
  que as capas aprovadas sejam exibidas sem depender dos JPGs problemáticos.
*/
(() => {
  'use strict';

  const RPG_COVERS = [
    { match: 'livro do mestre', path: 'assets/covers/lumyriel-rpg-livro-do-mestre-card.svg' },
    { match: 'guia do jogador', path: 'assets/covers/lumyriel-rpg-guia-do-jogador-card-v2.svg' },
    { match: 'bestiário', path: 'assets/covers/lumyriel-rpg-bestiario-card.svg' },
    { match: 'raças', path: 'assets/covers/lumyriel-rpg-racas-card.svg' }
  ];

  const normalized = value => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  const repairRpgProjectCovers = () => {
    document.querySelectorAll('.card, .future-card, article').forEach(card => {
      const title = card.querySelector('.book-name, h3, h4');
      const text = normalized(title?.textContent);
      if (!text.includes('lumyriel rpg')) return;

      const cover = RPG_COVERS.find(item => text.includes(item.match));
      if (!cover) return;

      const coverBox = card.querySelector('.cover, [data-project-cover]');
      if (coverBox) {
        coverBox.style.setProperty('background-image', `url("${cover.path}?v=20261002-rpg-cover-fix")`, 'important');
        coverBox.style.setProperty('background-size', 'cover', 'important');
        coverBox.style.setProperty('background-position', 'center', 'important');
        coverBox.style.setProperty('background-repeat', 'no-repeat', 'important');
        coverBox.classList.add('real-cover');
        coverBox.classList.remove('placeholder-cover');
      }

      const img = card.querySelector('img');
      if (img && /rpg-(?:livro-do-mestre|guia-do-jogador|bestiario|racas)|lumyriel-rpg-(?:livro-do-mestre|guia-do-jogador|bestiario|racas)/i.test(img.getAttribute('src') || '')) {
        img.src = `${cover.path}?v=20261002-rpg-cover-fix`;
      }
    });
  };

  const removeDuplicateRpgShelf = () => {
    document.querySelectorAll('.rpg-book-library, #rpg-books, #rpg-livros').forEach(el => el.remove());

    const preview = document.getElementById('rpg-preview');
    if (preview) {
      preview.querySelectorAll('section, article, div').forEach(el => {
        if (!el.isConnected) return;
        const heading = el.querySelector(':scope > h2, :scope > h3, :scope > header h2, :scope > header h3');
        const text = normalized(heading?.textContent);
        if (
          text === 'livros do lumyriel rpg' ||
          text === 'próximos livros do lumyriel rpg' ||
          text === 'próximos livros do sistema'
        ) {
          el.remove();
        }
      });
    }

    repairRpgProjectCovers();
  };

  removeDuplicateRpgShelf();

  /* O catálogo entra depois do HTML inicial. A mesma observação que remove
     vitrines antigas também reaplica as capas aprovadas quando os cards surgem. */
  const observer = new MutationObserver(removeDuplicateRpgShelf);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('load', removeDuplicateRpgShelf, { once: true });
  setTimeout(removeDuplicateRpgShelf, 0);
  setTimeout(removeDuplicateRpgShelf, 500);
  setTimeout(removeDuplicateRpgShelf, 1500);
  setTimeout(() => observer.disconnect(), 6000);
})();
