/*
  Os quatro livros futuros do Lumyriel RPG pertencem somente ao catálogo geral
  de Próximos Projetos. Este módulo elimina vitrines duplicadas antigas e garante
  que as capas HQ aprovadas sejam exibidas diretamente dos arquivos publicados.
*/
(() => {
  'use strict';

  const RPG_COVERS = [
    { match: 'livro do mestre', path: 'assets/covers/lumyriel-rpg-livro-do-mestre-hq.jpg' },
    { match: 'guia do jogador', path: 'assets/covers/lumyriel-rpg-guia-do-jogador-hq.jpg' },
    { match: 'bestiário', path: 'assets/covers/lumyriel-rpg-bestiario-hq.jpg' },
    { match: 'raças', path: 'assets/covers/lumyriel-rpg-racas-hq.jpg' }
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
        coverBox.style.setProperty('background-image', `url("${cover.path}?v=20261002-hq-final")`, 'important');
        coverBox.style.setProperty('background-size', 'cover', 'important');
        coverBox.style.setProperty('background-position', 'center', 'important');
        coverBox.style.setProperty('background-repeat', 'no-repeat', 'important');
        coverBox.classList.add('real-cover');
        coverBox.classList.remove('placeholder-cover');
      }
      const img = card.querySelector('img');
      if (img && /rpg-(?:livro-do-mestre|guia-do-jogador|bestiario|racas)|lumyriel-rpg-(?:livro-do-mestre|guia-do-jogador|bestiario|racas)/i.test(img.getAttribute('src') || '')) {
        img.src = `${cover.path}?v=20261002-hq-final`;
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
        if (text === 'livros do lumyriel rpg' || text === 'próximos livros do lumyriel rpg' || text === 'próximos livros do sistema') el.remove();
      });
    }
    repairRpgProjectCovers();
  };

  const installMobileIndex = () => {
    const toggle = document.querySelector('.menu-toggle');
    const navlinks = document.querySelector('.navlinks');
    if (!toggle || !navlinks || document.getElementById('lumyriel-mobile-index-style')) return;
    const style = document.createElement('style');
    style.id = 'lumyriel-mobile-index-style';
    style.textContent = `
      @media(max-width:850px){
        header{z-index:1200!important}
        .menu-toggle{display:inline-flex!important;align-items:center;justify-content:center;min-height:42px;padding:9px 14px!important;border:1px solid rgba(170,138,88,.58)!important;border-radius:999px!important;background:rgba(170,138,88,.08)!important;color:#eadcc5!important;font-size:.72rem!important;letter-spacing:.06em;box-shadow:none!important}
        .menu-toggle:hover,.menu-toggle:focus-visible{background:rgba(170,138,88,.15)!important;border-color:rgba(207,183,133,.8)!important}
        .navlinks{display:none!important;position:fixed!important;z-index:1210!important;top:70px!important;right:12px!important;left:auto!important;width:min(310px,calc(100vw - 24px))!important;max-height:calc(100svh - 86px)!important;overflow:auto!important;padding:8px!important;gap:2px!important;flex-direction:column!important;border:1px solid rgba(170,138,88,.45)!important;border-radius:9px!important;background:linear-gradient(180deg,#18140f 0%,#0d0b09 100%)!important;box-shadow:0 20px 50px rgba(0,0,0,.65)!important}
        body.mobile-index-open .navlinks{display:flex!important}
        .navlinks a{display:flex!important;align-items:center!important;min-height:44px!important;padding:10px 13px!important;border:0!important;border-radius:6px!important;color:#d8cdbb!important;font-size:.82rem!important;line-height:1.25!important;background:transparent!important}
        .navlinks a:hover,.navlinks a:focus-visible{background:rgba(170,138,88,.12)!important;color:#fff0d8!important}
        .mobile-index-backdrop{display:none;position:fixed;z-index:1190;inset:70px 0 0;background:rgba(0,0,0,.48);backdrop-filter:blur(2px)}
        body.mobile-index-open .mobile-index-backdrop{display:block}
      }
      @media(max-width:390px){.navlinks{top:66px!important}.mobile-index-backdrop{inset:66px 0 0}.menu-toggle{padding-inline:12px!important}}
    `;
    document.head.appendChild(style);
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-index-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
    const close = () => { document.body.classList.remove('mobile-index-open'); toggle.setAttribute('aria-expanded', 'false'); };
    const open = () => { document.body.classList.add('mobile-index-open'); toggle.setAttribute('aria-expanded', 'true'); };
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', event => {
      if (window.innerWidth > 850) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      document.body.classList.contains('mobile-index-open') ? close() : open();
    }, true);
    backdrop.addEventListener('click', close);
    navlinks.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 850) close(); });
  };

  installMobileIndex();
  removeDuplicateRpgShelf();
  const observer = new MutationObserver(removeDuplicateRpgShelf);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', () => { installMobileIndex(); removeDuplicateRpgShelf(); }, { once: true });
  setTimeout(removeDuplicateRpgShelf, 0);
  setTimeout(removeDuplicateRpgShelf, 500);
  setTimeout(removeDuplicateRpgShelf, 1500);
  setTimeout(() => observer.disconnect(), 6000);
})();
