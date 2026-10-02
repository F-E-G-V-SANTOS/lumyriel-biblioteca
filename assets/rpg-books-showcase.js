/* Coleção editorial dos próximos livros do Lumyriel RPG. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_RPG_BOOKS_SHOWCASE__) return;
  window.__LUMYRIEL_RPG_BOOKS_SHOWCASE__ = true;

  const rpg = document.getElementById('rpg-preview');
  if (!rpg) return;

  // O catálogo-base também cria uma prévia destes livros. Ela é removida aqui
  // para existir uma única coleção e uma única regra responsiva.
  rpg.querySelectorAll('.rpg-book-library').forEach(el => el.remove());
  document.getElementById('rpg-books')?.remove();

  const books = [
    { title:'Livro do Mestre', cover:'assets/covers/rpg-livro-do-mestre.jpg', desc:'Condução de aventuras, preparação de sessões, resolução de situações, encontros, personagens do mundo e ferramentas de narração.' },
    { title:'Guia do Jogador', cover:'assets/covers/rpg-guia-do-jogador.jpg', desc:'Regras essenciais para jogar, criar personagens, explorar Lumyriel e compreender as escolhas disponíveis durante uma campanha.' },
    { title:'Bestiário', cover:'assets/covers/rpg-bestiario.jpg', desc:'Criaturas de Lumyriel apresentadas pela lógica do RPG, preservando comportamento, ecologia e papel no mundo.' },
    { title:'Raças', cover:'assets/covers/rpg-racas.jpg', desc:'Povos e espécies de Lumyriel organizados para uso no RPG, com atenção à anatomia, cultura e coerência com o cânone.' }
  ];

  const section = document.createElement('section');
  section.id = 'rpg-books';
  section.className = 'rpg-book-collection';
  section.setAttribute('aria-labelledby', 'rpg-books-title');
  section.innerHTML = `
    <div class="shell">
      <div class="rpg-book-head">
        <div class="eyebrow">Próximos livros do sistema</div>
        <h2 id="rpg-books-title">Biblioteca do Lumyriel RPG</h2>
        <p>Quatro projetos editoriais em desenvolvimento, apresentados com suas capas oficiais aprovadas.</p>
      </div>
      <div class="rpg-showcase-grid">
        ${books.map(book => `
          <article class="rpg-showcase-card">
            <div class="rpg-showcase-cover"><img src="${book.cover}?v=20261002-2" alt="Capa de Lumyriel RPG — ${book.title}" loading="lazy" decoding="async"></div>
            <div class="rpg-showcase-copy">
              <span class="rpg-showcase-status">Em desenvolvimento</span>
              <h3>Lumyriel RPG — ${book.title}</h3>
              <div class="rpg-showcase-author">F E G V Santos</div>
              <p>${book.desc}</p>
              <small>Capa oficial aprovada</small>
            </div>
          </article>`).join('')}
      </div>
    </div>`;
  rpg.insertAdjacentElement('afterend', section);

  const style = document.createElement('style');
  style.id = 'lumyriel-rpg-books-style';
  style.textContent = `
    .rpg-book-collection{padding:64px 0 78px;border-top:1px solid rgba(170,138,88,.18);background:linear-gradient(180deg,rgba(14,12,9,.18),rgba(8,8,7,.08));content-visibility:auto;contain-intrinsic-size:1200px;scroll-margin-top:84px;overflow:hidden}
    .rpg-book-head{max-width:760px;margin-bottom:28px}.rpg-book-head h2{margin:10px 0 14px;font:400 clamp(2.2rem,5vw,4rem)/1.03 Georgia,"Times New Roman",serif;letter-spacing:-.025em;color:#e8decd}.rpg-book-head p{margin:0;color:#aaa194;max-width:680px}
    .rpg-showcase-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
    .rpg-showcase-card{min-width:0;display:grid;grid-template-columns:minmax(150px,38%) minmax(0,1fr);gap:20px;padding:16px;border:1px solid #493e2e;border-radius:3px;background:linear-gradient(180deg,rgba(25,21,16,.9),rgba(12,11,9,.97));box-shadow:0 13px 28px rgba(0,0,0,.18);overflow:hidden}
    .rpg-showcase-cover{min-width:0}.rpg-showcase-cover img{display:block;width:100%;height:auto;aspect-ratio:2/3;object-fit:cover;object-position:center;border:1px solid rgba(170,138,88,.45);border-radius:2px 5px 5px 2px;box-shadow:9px 11px 22px rgba(0,0,0,.32);background:#100e0b}
    .rpg-showcase-copy{min-width:0;align-self:start;padding-top:4px}.rpg-showcase-status{display:inline-block;margin-bottom:14px;padding:6px 9px;border:1px solid #6f5941;color:#d9bd9c;font-size:.62rem;line-height:1.25;letter-spacing:.1em;text-transform:uppercase}.rpg-showcase-copy h3{margin:0 0 5px;color:#eadfcf;font:400 1.35rem/1.18 Georgia,"Times New Roman",serif;overflow-wrap:normal;word-break:normal}.rpg-showcase-author{color:#a99d8b;font:400 .8rem/1.4 Georgia,"Times New Roman",serif;letter-spacing:.08em;margin-bottom:15px}.rpg-showcase-copy p{margin:0;color:#a79e8f;font-size:.84rem;line-height:1.58;overflow-wrap:normal;word-break:normal;hyphens:none}.rpg-showcase-copy small{display:block;margin-top:18px;color:#8f8577;font-size:.72rem;letter-spacing:.02em}
    @media(hover:hover) and (pointer:fine){.rpg-showcase-card{transition:transform .2s ease,border-color .2s ease}.rpg-showcase-card:hover{transform:translateY(-2px);border-color:#6a5940}}
    @media(max-width:900px){.rpg-showcase-grid{grid-template-columns:1fr}.rpg-showcase-card{grid-template-columns:minmax(130px,32%) minmax(0,1fr)}}
    @media(max-width:520px){.rpg-book-collection{padding:52px 0 68px;contain-intrinsic-size:1700px}.rpg-showcase-grid{grid-template-columns:1fr;gap:14px}.rpg-showcase-card{grid-template-columns:minmax(118px,35%) minmax(0,1fr);gap:14px;padding:12px}.rpg-showcase-status{font-size:.55rem;padding:5px 7px;margin-bottom:10px}.rpg-showcase-copy h3{font-size:1.05rem;line-height:1.22}.rpg-showcase-author{font-size:.7rem;margin-bottom:10px}.rpg-showcase-copy p{font-size:.74rem;line-height:1.5}.rpg-showcase-copy small{font-size:.65rem;margin-top:12px}}
    @media(max-width:370px){.rpg-showcase-card{grid-template-columns:104px minmax(0,1fr);gap:11px;padding:10px}.rpg-showcase-copy h3{font-size:.98rem}.rpg-showcase-copy p{font-size:.7rem}}
    @media(prefers-reduced-motion:reduce){.rpg-showcase-card{transition:none!important}}
  `;
  document.head.appendChild(style);
})();
