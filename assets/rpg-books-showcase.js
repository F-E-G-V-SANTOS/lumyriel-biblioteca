/* Coleção editorial dos próximos livros do Lumyriel RPG. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_RPG_BOOKS_SHOWCASE__) return;
  window.__LUMYRIEL_RPG_BOOKS_SHOWCASE__ = true;

  const rpg = document.getElementById('rpg-preview');
  if (!rpg || document.getElementById('rpg-books')) return;

  /* O catálogo antigo já reservava uma biblioteca do RPG. Removemos apenas
     essa versão para não duplicar a coleção nem manter capas provisórias. */
  const previousLibrary = rpg.querySelector('.rpg-book-library');
  if (previousLibrary) previousLibrary.remove();

  const books = [
    {
      title: 'Livro do Mestre',
      cover: 'assets/covers/lumyriel-rpg-livro-do-mestre-card.svg',
      desc: 'Condução de aventuras, preparação de sessões, resolução de situações, encontros, personagens do mundo e ferramentas de narração.'
    },
    {
      title: 'Guia do Jogador',
      cover: 'assets/covers/lumyriel-rpg-guia-do-jogador-card-v2.svg',
      desc: 'Regras essenciais para jogar, criar personagens, explorar Lumyriel e compreender as escolhas disponíveis durante uma campanha.'
    },
    {
      title: 'Bestiário',
      cover: 'assets/covers/lumyriel-rpg-bestiario-card.svg',
      desc: 'Criaturas de Lumyriel apresentadas pela lógica do RPG, preservando comportamento, ecologia e papel no mundo.'
    },
    {
      title: 'Raças',
      cover: 'assets/covers/lumyriel-rpg-racas-card.svg',
      desc: 'Povos e espécies de Lumyriel organizados para uso no RPG, com atenção à anatomia, cultura e coerência com o cânone.'
    }
  ];

  const section = document.createElement('section');
  section.id = 'rpg-books';
  section.className = 'rpg-book-collection';
  section.setAttribute('aria-labelledby', 'rpg-books-title');
  section.innerHTML = `
    <div class="shell">
      <div class="rpg-book-head">
        <div class="eyebrow">Próximos livros do sistema</div>
        <h2 id="rpg-books-title">Livros do Lumyriel RPG</h2>
        <p>O sistema está sendo organizado em quatro livros complementares. As capas estão aprovadas; o conteúdo editorial permanece em desenvolvimento.</p>
      </div>
      <div class="rpg-book-grid">
        ${books.map(book => `
          <article class="rpg-book-card">
            <div class="rpg-book-cover-wrap">
              <img src="${book.cover}" alt="Capa de Lumyriel RPG — ${book.title}" loading="lazy" decoding="async">
            </div>
            <div class="rpg-book-copy">
              <span class="rpg-book-status">Em desenvolvimento</span>
              <h3>${book.title}</h3>
              <p>${book.desc}</p>
            </div>
          </article>
        `).join('')}
      </div>
    </div>`;

  rpg.insertAdjacentElement('afterend', section);

  const style = document.createElement('style');
  style.id = 'lumyriel-rpg-books-style';
  style.textContent = `
    .rpg-book-collection{
      padding:72px 0 82px;
      border-top:1px solid rgba(170,138,88,.18);
      background:linear-gradient(180deg,rgba(14,12,9,.18),rgba(8,8,7,.08));
      content-visibility:auto;
      contain-intrinsic-size:900px;
      scroll-margin-top:84px;
    }
    .rpg-book-head{max-width:760px;margin-bottom:30px}
    .rpg-book-head h2{
      margin:10px 0 14px;
      font:400 clamp(2.35rem,5vw,4.25rem)/1.02 Georgia,"Times New Roman",serif;
      letter-spacing:-.025em;
      color:#e8decd;
    }
    .rpg-book-head p{margin:0;color:#aaa194;max-width:680px}
    .rpg-book-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
    .rpg-book-card{
      min-width:0;
      overflow:hidden;
      border:1px solid #393126;
      border-radius:3px;
      background:linear-gradient(180deg,rgba(25,21,16,.88),rgba(12,11,9,.96));
      box-shadow:0 13px 28px rgba(0,0,0,.18);
    }
    .rpg-book-cover-wrap{
      padding:14px 14px 0;
      display:grid;
      place-items:center;
      background:radial-gradient(ellipse at 50% 20%,rgba(170,138,88,.08),transparent 60%);
    }
    .rpg-book-card img{
      display:block;
      width:min(100%,190px);
      aspect-ratio:2/3;
      object-fit:cover;
      border:1px solid rgba(170,138,88,.38);
      border-radius:2px 5px 5px 2px;
      box-shadow:10px 12px 22px rgba(0,0,0,.34);
    }
    .rpg-book-copy{padding:17px 16px 19px}
    .rpg-book-status{
      display:inline-block;
      margin-bottom:9px;
      color:#cbae79;
      font-size:.62rem;
      line-height:1;
      letter-spacing:.13em;
      text-transform:uppercase;
    }
    .rpg-book-copy h3{
      margin:0 0 9px;
      color:#e9dfce;
      font:400 1.35rem/1.08 Georgia,"Times New Roman",serif;
    }
    .rpg-book-copy p{margin:0;color:#a79e8f;font-size:.84rem;line-height:1.55}

    @media(hover:hover) and (pointer:fine){
      .rpg-book-card{transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
      .rpg-book-card:hover{transform:translateY(-3px);border-color:#6a5940;box-shadow:0 18px 34px rgba(0,0,0,.25)}
    }
    @media(max-width:900px){
      .rpg-book-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:520px){
      .rpg-book-collection{padding:58px 0 66px;contain-intrinsic-size:1180px}
      .rpg-book-grid{grid-template-columns:1fr;gap:12px}
      .rpg-book-card{display:grid;grid-template-columns:104px minmax(0,1fr);align-items:start}
      .rpg-book-cover-wrap{padding:10px;background:none}
      .rpg-book-card img{width:94px;box-shadow:7px 9px 17px rgba(0,0,0,.3)}
      .rpg-book-copy{padding:13px 13px 14px 4px}
      .rpg-book-copy h3{font-size:1.22rem}
      .rpg-book-copy p{font-size:.78rem;line-height:1.48}
    }
    @media(prefers-reduced-motion:reduce){
      .rpg-book-card{transition:none!important}
    }
  `;
  document.head.appendChild(style);
})();
