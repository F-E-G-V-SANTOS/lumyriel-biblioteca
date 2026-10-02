/*
  Os quatro livros futuros do Lumyriel RPG pertencem somente ao catálogo geral
  de Próximos Projetos. Este módulo elimina qualquer vitrine duplicada criada
  por versões antigas do catálogo, inclusive quando ela é inserida depois.
*/
(() => {
  'use strict';

  const removeDuplicateRpgShelf = () => {
    document.querySelectorAll('.rpg-book-library, #rpg-books, #rpg-livros').forEach(el => el.remove());

    const preview = document.getElementById('rpg-preview');
    if (!preview) return;

    /* Compatibilidade com versões antigas que não usavam as classes atuais. */
    preview.querySelectorAll('section, article, div').forEach(el => {
      if (!el.isConnected) return;
      const heading = el.querySelector(':scope > h2, :scope > h3, :scope > header h2, :scope > header h3');
      const text = heading?.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
      if (
        text === 'livros do lumyriel rpg' ||
        text === 'próximos livros do lumyriel rpg' ||
        text === 'próximos livros do sistema'
      ) {
        el.remove();
      }
    });
  };

  removeDuplicateRpgShelf();

  /* O catálogo é carregado de forma assíncrona. Se uma versão em cache tentar
     recriar a estante depois desta limpeza, removemos assim que ela aparecer. */
  const observer = new MutationObserver(removeDuplicateRpgShelf);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener('load', removeDuplicateRpgShelf, { once: true });
  setTimeout(removeDuplicateRpgShelf, 0);
  setTimeout(removeDuplicateRpgShelf, 500);
  setTimeout(() => observer.disconnect(), 5000);
})();
