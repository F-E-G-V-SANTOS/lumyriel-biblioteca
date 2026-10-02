window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: '',
  characterSubmissionEnabled: false,
  feedbackSubmissionUrl: 'https://script.google.com/macros/s/AKfycbwkF6j3PwUFyz5YLeZ5ndRiE7pdFbNAbZNcwRkWK9u57ArqrJkMwzOZJZrJakyYmEDow/exec',
  feedbackSubmissionEnabled: true,
  supportPixEnabled: true,
  supportPixQrImage: 'assets/support/pix-apoie-lumyriel-v2.svg',
  supportPixCopyPaste: '',
  supportPixLink: 'https://nubank.com.br/cobrar/ljz8/6abe9835-21ea-4483-a475-09dec8cf3ff3',
  supportPixRecipient: '',
  readerContentBaseUrl: '',
  readerProtectionEnabled: true
};

(() => {
  function load(src, next) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    if (next) script.addEventListener('load', next, { once: true });
    document.head.appendChild(script);
  }

  const hasCatalog = document.getElementById('libraryGrid') || document.getElementById('futureShelf') || document.getElementById('criador') || document.getElementById('creatorForm');
  if (hasCatalog) {
    load('assets/site-catalog.js', () => {
      if (document.getElementById('libraryGrid')) load('assets/magic-site-integration.js');
      // Importante: a vitrine RPG entra só depois do catálogo. Assim ela remove
      // a versão provisória criada pelo catálogo e evita duas bibliotecas concorrentes.
      if (document.getElementById('rpg-preview')) load('assets/rpg-books-showcase.js?v=20261002-2');
    });
  } else if (document.getElementById('rpg-preview')) {
    load('assets/rpg-books-showcase.js?v=20261002-2');
  }

  if (document.getElementById('visualGallery')) load('assets/gallery-viewer.js');

  if (document.getElementById('paper')) {
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('lumyriel-reader-topbar')) {
      const brandLabel = topbar.querySelector('.brand span');
      if (brandLabel) { brandLabel.classList.add('reader-brand-label'); brandLabel.dataset.short = 'Lumyriel'; }
      const actions = Array.from(topbar.children).find(el => el.tagName === 'DIV');
      if (actions) {
        actions.classList.add('reader-actions');
        const feedback = actions.querySelector('#readerFeedbackLink');
        const support = actions.querySelector('[data-support-project]');
        if (feedback && support && !actions.querySelector('.reader-more')) {
          const more = document.createElement('div'); more.className = 'reader-more';
          const moreButton = document.createElement('button'); moreButton.type='button'; moreButton.className='reader-more-toggle'; moreButton.textContent='Mais'; moreButton.setAttribute('aria-expanded','false'); moreButton.setAttribute('aria-haspopup','true'); moreButton.setAttribute('aria-label','Mais opções');
          const moreMenu = document.createElement('div'); moreMenu.className='reader-more-menu'; moreMenu.setAttribute('role','menu'); feedback.setAttribute('role','menuitem'); support.setAttribute('role','menuitem');
          actions.insertBefore(more, feedback); more.appendChild(moreButton); more.appendChild(moreMenu); moreMenu.appendChild(feedback); moreMenu.appendChild(support);
          const closeMore=()=>{more.classList.remove('open');moreButton.setAttribute('aria-expanded','false')};
          moreButton.addEventListener('click',event=>{event.stopPropagation();const open=more.classList.toggle('open');moreButton.setAttribute('aria-expanded',String(open))});
          moreMenu.addEventListener('click',event=>event.stopPropagation()); document.addEventListener('click',closeMore); document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMore();moreButton.focus()}});
        }
      }
      const back=topbar.querySelector('.back'); if(back){back.setAttribute('aria-label','Voltar à Biblioteca');back.setAttribute('title','Voltar à Biblioteca')}
      const style=document.createElement('style'); style.id='lumyriel-reader-topbar'; style.textContent=`
        .topbar{background:linear-gradient(180deg,rgba(20,17,13,.985),rgba(10,9,7,.985));border-bottom:1px solid rgba(170,138,88,.42);box-shadow:0 8px 24px rgba(0,0,0,.28)}
        .topbar .brand{white-space:nowrap;min-width:0;flex-shrink:0}.topbar .reader-actions{display:flex;align-items:center;gap:4px!important;min-width:0}.topbar .reader-more,.topbar .reader-more-menu{display:contents}.topbar .reader-more-toggle{display:none}.topbar .feedback-reader,.topbar .back{border:1px solid transparent;border-radius:0;background:transparent;color:#cfc3b0;box-shadow:none;transition:background .18s ease,color .18s ease,border-color .18s ease}.topbar .feedback-reader:hover,.topbar .back:hover{color:#f0e4cf;background:rgba(170,138,88,.07);border-bottom-color:rgba(170,138,88,.55)}
        @media(max-width:850px){.topbar{height:58px;padding:0 8px 0 10px;gap:6px}.shell{height:calc(100vh - 58px);margin-top:58px}.sidebar{top:58px}.menu-backdrop{inset:58px 0 0}.topbar .brand{gap:8px;letter-spacing:.06em}.topbar .brand:before{width:16px}.topbar .reader-brand-label{font-size:0}.topbar .reader-brand-label::after{content:attr(data-short);font:400 .88rem/1 Georgia,"Times New Roman",serif;letter-spacing:.07em}.topbar .reader-actions{gap:5px!important;margin-left:auto;overflow:visible}.topbar .reader-more{display:block;position:relative}.topbar .reader-more-toggle{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 10px;border:0;border-radius:999px;background:transparent;color:#cfc3b0;font:500 .69rem/1 Inter,ui-sans-serif,system-ui,sans-serif;cursor:pointer}.topbar .reader-more-toggle::after{content:'···';margin-left:5px;letter-spacing:.06em;color:#aa8a58}.topbar .reader-more-menu{display:none;position:absolute;z-index:60;top:calc(100% + 10px);right:0;min-width:148px;padding:6px;border:1px solid rgba(170,138,88,.42);border-radius:8px;background:linear-gradient(180deg,#18140f,#0e0c09);box-shadow:0 14px 34px rgba(0,0,0,.5)}.topbar .reader-more.open .reader-more-menu{display:grid;gap:2px}.topbar .reader-more-menu .feedback-reader{display:flex;align-items:center;width:100%;min-height:40px;padding:9px 11px;border:0;border-radius:5px;background:transparent;color:#ded2be;font-size:.75rem;text-align:left;text-decoration:none}.topbar .reader-more-menu .feedback-reader:hover,.topbar .reader-more-menu .feedback-reader:focus-visible{background:rgba(170,138,88,.11);color:#fff0d8}.topbar #menuBtn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 12px;border:1px solid rgba(170,138,88,.56);border-radius:999px;background:rgba(170,138,88,.09);color:#eadcc5;font-size:.72rem}.topbar #menuBtn:hover{background:rgba(170,138,88,.15);border-color:rgba(207,183,133,.78)}.topbar .back{display:grid;place-items:center;width:36px;min-width:36px;height:40px;padding:0;border:0;font-size:0}.topbar .back::before{content:'←';font-size:1.08rem;line-height:1;color:#d6c6ad}}
        @media(max-width:390px){.topbar{padding-inline:6px;gap:3px}.topbar .brand{gap:6px}.topbar .brand:before{width:11px}.topbar .reader-brand-label::after{font-size:.79rem}.topbar .reader-actions{gap:2px!important}.topbar .reader-more-toggle{padding-inline:7px;font-size:.65rem}.topbar .reader-more-toggle::after{margin-left:3px}.topbar #menuBtn{padding-inline:9px;font-size:.68rem}.topbar .back{width:30px;min-width:30px}}
      `; document.head.appendChild(style);
    }
  }

  if (document.getElementById('creatorForm')) {
    const initialStatus=document.getElementById('saveStatus'); if(initialStatus) initialStatus.hidden=true;
    load('assets/character-creator-options.js',()=>{load('assets/character-creator-biology.js',()=>{load('assets/character-creator-names.js',()=>load('assets/character-creator-export.js'))})});
  }
})();
