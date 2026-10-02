/* Carrega a correção responsiva da Biblioteca do Lumyriel RPG. */
(() => {
  if (document.querySelector('link[data-rpg-library-fix]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/rpg-library-fix.css?v=20261002-1';
  link.dataset.rpgLibraryFix = 'true';
  document.head.appendChild(link);
})();
