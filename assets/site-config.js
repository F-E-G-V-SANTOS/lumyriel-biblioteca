window.LUMYRIEL_CONFIG = {
  characterSubmissionUrl: '',
  characterSubmissionEnabled: false,

  // Feedback editorial usa o mesmo Apps Script, mas pode ser habilitado separadamente.
  feedbackSubmissionUrl: 'https://script.google.com/macros/s/AKfycbwkF6j3PwUFyz5YLeZ5ndRiE7pdFbNAbZNcwRkWK9u57ArqrJkMwzOZJZJrJakyYmEDow/exec',
  feedbackSubmissionEnabled: true,

  // Apoio voluntário via Pix. Ative somente depois de publicar um QR e payload válidos.
  supportPixEnabled: true,
  supportPixQrImage: 'assets/support/pix-apoie-lumyriel-v2.svg',
  supportPixCopyPaste: '',
  supportPixLink: 'https://nubank.com.br/cobrar/ljz8/6abe9835-21ea-4483-a475-09dec8cf3ff3',
  supportPixRecipient: '',

  // O leitor continua 100% estático. Se um dia houver um serviço de conteúdo,
  // basta definir esta base sem redesenhar o leitor.
  readerContentBaseUrl: '',
  readerProtectionEnabled: true
};

// Transparência editorial do Arquivo Visual.
(() => {
  const visualArchive = document.querySelector('#artes .visual-archive');
  if (!visualArchive || document.querySelector('#artes .visual-ai-disclosure')) return;

  const note = document.createElement('p');
  note.className = 'visual-gallery-note visual-ai-disclosure';
  note.setAttribute('role', 'note');
  note.innerHTML = '<strong>Sobre as imagens:</strong> todas as artes conceituais exibidas nesta seção foram geradas com inteligência artificial a partir de um conjunto próprio de prompts desenvolvido especialmente para Lumyriel. As imagens passam por seleção e curadoria para preservar a identidade visual e a coerência do projeto.';
  visualArchive.insertAdjacentElement('afterend', note);
})();
