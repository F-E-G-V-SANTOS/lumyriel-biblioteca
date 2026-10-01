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

  if (document.getElementById('pdfFrame') && document.querySelector('.frame-wrap')) {
    const style = document.createElement('style');
    style.id = 'lumyriel-magic-paper';
    style.textContent = `
      .frame-wrap{
        padding:clamp(14px,2.2vw,28px);
        background:
          radial-gradient(circle at 16% 8%,rgba(120,91,54,.055),transparent 18%),
          radial-gradient(circle at 82% 76%,rgba(120,91,54,.035),transparent 22%),
          repeating-linear-gradient(96deg,rgba(72,55,33,.02) 0 1px,transparent 1px 5px),
          linear-gradient(90deg,#ccb78f,#eadfc8 6%,#eadfc8 94%,#c9b189)!important;
        box-shadow:inset 14px 0 30px rgba(69,51,30,.16),inset -14px 0 30px rgba(69,51,30,.12);
      }
      .frame-wrap:before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        z-index:2;
        box-shadow:inset 0 0 70px rgba(78,58,34,.10);
      }
      .frame{
        min-height:calc(100vh - 208px)!important;
        border:1px solid rgba(92,70,43,.28)!important;
        background:#eadfc8!important;
        box-shadow:0 18px 42px rgba(58,43,27,.18),inset 0 0 0 1px rgba(255,255,255,.12);
        filter:sepia(.16) saturate(.78) brightness(.97) contrast(.97);
      }
      @media(max-width:880px){
        .frame-wrap{padding:12px!important}
        .frame{min-height:calc(100vh - 252px)!important}
      }
    `;
    document.head.appendChild(style);
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
