/* Os livros futuros do Lumyriel RPG permanecem no catálogo geral de projetos.
   Este módulo apenas remove versões antigas da vitrine específica para evitar
   duplicação visual entre a área do RPG e a seção de próximos projetos. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_RPG_BOOKS_SHOWCASE__) return;
  window.__LUMYRIEL_RPG_BOOKS_SHOWCASE__ = true;

  const rpg = document.getElementById('rpg-preview');
  if (!rpg) return;

  rpg.querySelectorAll('.rpg-book-library').forEach(el => el.remove());
  document.getElementById('rpg-books')?.remove();
})();
