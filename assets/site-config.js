window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: '',
  characterSubmissionEnabled: false,

  // Feedback editorial usa o mesmo Apps Script, mas pode ser habilitado separadamente.
  feedbackSubmissionUrl: 'https://script.google.com/macros/s/AKfycbwkF6j3PwUFyz5YLeZ5ndRiE7pdFbNAbZNcwRkWK9u57ArqrJkMwzOZJZJrJakyYmEDow/exec',
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
    load('assets/site-catalog.js');
  }

  if (document.getElementById('visualGallery')) load('assets/gallery-viewer.js');

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
