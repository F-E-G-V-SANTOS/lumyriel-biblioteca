/* Abertura de Os Livros dos Tempos: epígrafe junto da voz de entrega. */
(() => {
  'use strict';
  window.LUMYRIEL_TEMPOS_OPENING = data => {
    const book = data.collections?.[0]?.books?.[0];
    const chapter = book?.chapters?.[0];
    if (!chapter || book.number !== 1 || chapter.number !== 1) return data;
    const slogan = String(data.editorial || '').split(/\n{2,}/)[0].trim();
    const heading = '## PALAVRAS DE QUEM ENTREGA ESTAS FOLHAS';
    if (!slogan || !chapter.body?.startsWith(heading)) return data;
    if (chapter.body.slice(heading.length).trimStart().startsWith(slogan)) return data;
    chapter.body = heading + '\n\n' + slogan + chapter.body.slice(heading.length);
    return data;
  };
})();
