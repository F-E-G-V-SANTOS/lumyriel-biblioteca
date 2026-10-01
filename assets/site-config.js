window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: '',
  characterSubmissionEnabled: false,

  // Feedback editorial usa o mesmo Apps Script, mas pode ser habilitado separadamente.
  feedbackSubmissionUrl: 'https://script.google.com/macros/s/AKfycbwkF6j3PwUFyz5YLeZ5ndRiE7pdFbNAbZNcwRkWK9u57ArqrJkMwzOZJZrJakyYmEDow/exec',
  feedbackSubmissionEnabled: true,

  // Apoio voluntário via Pix.
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

  if (document.getElementById('libraryGrid') || document.getElementById('futureShelf') || document.getElementById('criador') || document.getElementById('creatorForm')) {
    load('assets/site-catalog.js', () => {
      if (document.getElementById('libraryGrid')) load('assets/magic-site-integration.js');
    });
  }

  if (document.getElementById('visualGallery')) load('assets/gallery-viewer.js');

  // Barra editorial do leitor: compacta no celular sem sacrificar as ações principais.
  if (document.getElementById('paper')) {
    const topbar = document.querySelector('.topbar');
    if (topbar && !document.getElementById('lumyriel-reader-topbar')) {
      const brandLabel = topbar.querySelector('.brand span');
      if (brandLabel) {
        brandLabel.classList.add('reader-brand-label');
        brandLabel.dataset.short = 'Lumyriel';
      }

      const actions = Array.from(topbar.children).find(el => el.tagName === 'DIV');
      if (actions) actions.classList.add('reader-actions');

      const back = topbar.querySelector('.back');
      if (back) {
        back.setAttribute('aria-label', 'Voltar à Biblioteca');
        back.setAttribute('title', 'Voltar à Biblioteca');
      }

      const style = document.createElement('style');
      style.id = 'lumyriel-reader-topbar';
      style.textContent = `
        .topbar{
          background:linear-gradient(180deg,rgba(20,17,13,.985),rgba(10,9,7,.985));
          border-bottom:1px solid rgba(170,138,88,.42);
          box-shadow:0 8px 24px rgba(0,0,0,.28);
        }
        .topbar .brand{white-space:nowrap;min-width:0;flex-shrink:0}
        .topbar .reader-actions{display:flex;align-items:center;gap:4px!important;min-width:0}
        .topbar .feedback-reader,.topbar .back{
          border:1px solid transparent;
          border-radius:0;
          background:transparent;
          color:#cfc3b0;
          box-shadow:none;
          transition:background .18s ease,color .18s ease,border-color .18s ease;
        }
        .topbar .feedback-reader:hover,.topbar .back:hover{
          color:#f0e4cf;
          background:rgba(170,138,88,.07);
          border-bottom-color:rgba(170,138,88,.55);
        }
        @media(max-width:850px){
          .topbar{height:58px;padding:0 8px 0 10px;gap:6px}
          .shell{height:calc(100vh - 58px);margin-top:58px}
          .sidebar{top:58px}
          .menu-backdrop{inset:58px 0 0}
          .topbar .brand{gap:8px;letter-spacing:.06em}
          .topbar .brand:before{width:16px}
          .topbar .reader-brand-label{font-size:0}
          .topbar .reader-brand-label::after{
            content:attr(data-short);
            font:400 .88rem/1 Georgia,"Times New Roman",serif;
            letter-spacing:.07em;
          }
          .topbar .reader-actions{gap:1px!important;margin-left:auto}
          .topbar .feedback-reader{
            min-height:40px;
            padding:8px 6px;
            border:0;
            font-size:.68rem;
            letter-spacing:.01em;
          }
          .topbar #menuBtn{
            display:inline-flex;
            align-items:center;
            justify-content:center;
            min-height:38px;
            padding:8px 10px;
            border:1px solid rgba(170,138,88,.5);
            border-radius:999px;
            background:rgba(170,138,88,.08);
            color:#e6d8c2;
            font-size:.71rem;
          }
          .topbar #menuBtn:hover{background:rgba(170,138,88,.14);border-color:rgba(207,183,133,.72)}
          .topbar .back{
            display:grid;
            place-items:center;
            width:38px;
            min-width:38px;
            height:40px;
            padding:0;
            border:0;
            font-size:0;
          }
          .topbar .back::before{content:'←';font-size:1.08rem;line-height:1;color:#d6c6ad}
        }
        @media(max-width:390px){
          .topbar{padding-inline:6px;gap:3px}
          .topbar .brand{gap:6px}
          .topbar .brand:before{width:11px}
          .topbar .reader-brand-label::after{font-size:.79rem}
          .topbar .feedback-reader{padding-inline:4px;font-size:.63rem}
          .topbar #menuBtn{padding-inline:8px;font-size:.67rem}
          .topbar .back{width:32px;min-width:32px}
        }
      `;
      document.head.appendChild(style);
    }
  }

  if (document.getElementById('creatorForm')) {
    const initialStatus = document.getElementById('saveStatus');
    if (initialStatus) initialStatus.hidden = true;
    load('assets/character-creator-options.js', () => {
      load('assets/character-creator-biology.js', () => {
        load('assets/character-creator-names.js', () => load('assets/character-creator-export.js'));
      });
    });
  }
})();
