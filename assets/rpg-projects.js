/* Próximos livros do Lumyriel RPG — coleção editorial em desenvolvimento. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_RPG_PROJECTS__) return;
  window.__LUMYRIEL_RPG_PROJECTS__ = true;

  const section = document.getElementById('rpg-preview');
  if (!section || section.querySelector('.rpg-books-roadmap')) return;

  const mount = section.querySelector('.shell') || section;
  const books = [
    {
      title:'Livro do Mestre',
      cover:'assets/covers/lumyriel-rpg-livro-do-mestre.jpg',
      desc:'Projeto editorial voltado à condução de campanhas, preparação de cenas, consequências e ferramentas para o narrador de Lumyriel.'
    },
    {
      title:'Guia do Jogador',
      cover:'assets/covers/lumyriel-rpg-guia-do-jogador.jpg',
      desc:'Porta de entrada para criação e interpretação de personagens, escolhas de campanha e participação no mundo de Lumyriel.'
    },
    {
      title:'Bestiário',
      cover:'assets/covers/lumyriel-rpg-bestiario.jpg',
      desc:'Projeto dedicado às criaturas e ameaças de Lumyriel, reunindo presença narrativa, comportamento e integração ao jogo.'
    },
    {
      title:'Raças',
      cover:'assets/covers/lumyriel-rpg-racas.jpg',
      desc:'Guia dedicado aos povos e espécies jogáveis de Lumyriel, conectado à biologia, às culturas e ao Criador de Personagens.'
    }
  ];

  const block = document.createElement('div');
  block.className = 'rpg-books-roadmap';
  block.id = 'rpg-books-roadmap';
  block.innerHTML = `
    <div class="rpg-books-head">
      <span class="eyebrow">Próximos livros do sistema</span>
      <h3>Biblioteca do Lumyriel RPG</h3>
      <p>Quatro projetos editoriais já possuem capa oficial aprovada e estão em desenvolvimento. As capas aparecem aqui como um primeiro vislumbre da coleção.</p>
    </div>
    <div class="rpg-books-grid">
      ${books.map(book => `
        <article class="rpg-book-project">
          <div class="rpg-book-cover-wrap"><img src="${book.cover}" alt="Capa de Lumyriel RPG — ${book.title}" loading="lazy" decoding="async"></div>
          <div class="rpg-book-meta">
            <span class="rpg-book-status">Em desenvolvimento</span>
            <h4>Lumyriel RPG — ${book.title}</h4>
            <div class="rpg-book-author">F E G V Santos</div>
            <p>${book.desc}</p>
            <span class="rpg-book-note">Capa oficial aprovada</span>
          </div>
        </article>`).join('')}
    </div>`;
  mount.appendChild(block);

  const style = document.createElement('style');
  style.id = 'lumyriel-rpg-projects-style';
  style.textContent = `
    .rpg-books-roadmap{margin-top:clamp(42px,7vw,88px);padding-top:clamp(34px,5vw,58px);border-top:1px solid rgba(170,138,88,.34)}
    .rpg-books-head{max-width:760px;margin-bottom:28px}
    .rpg-books-head h3{margin:8px 0 10px;color:#eadcc4;font:400 clamp(1.75rem,3.2vw,2.8rem)/1.05 Georgia,"Times New Roman",serif}
    .rpg-books-head p{margin:0;color:#aaa092;line-height:1.7;max-width:690px}
    .rpg-books-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
    .rpg-book-project{min-width:0;border:1px solid rgba(126,103,68,.45);background:linear-gradient(180deg,rgba(23,20,16,.88),rgba(12,11,9,.92));box-shadow:0 18px 38px rgba(0,0,0,.2);overflow:hidden}
    .rpg-book-cover-wrap{background:#0b0a08;aspect-ratio:2/3;overflow:hidden}
    .rpg-book-cover-wrap img{display:block;width:100%;height:100%;object-fit:cover}
    .rpg-book-meta{padding:16px 15px 18px}
    .rpg-book-status{display:inline-block;margin-bottom:10px;padding:5px 8px;border:1px solid rgba(170,138,88,.42);color:#c8ae7e;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase}
    .rpg-book-meta h4{margin:0;color:#e5d8c1;font:400 1.02rem/1.25 Georgia,"Times New Roman",serif}
    .rpg-book-author{margin-top:4px;color:#8f8678;font:400 .72rem/1.4 Georgia,"Times New Roman",serif;letter-spacing:.07em}
    .rpg-book-meta p{margin:11px 0 14px;color:#aaa195;font-size:.78rem;line-height:1.58}
    .rpg-book-note{color:#7f7567;font-size:.68rem;letter-spacing:.03em}
    @media(hover:hover) and (pointer:fine){.rpg-book-project{transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease}.rpg-book-project:hover{transform:translateY(-5px);border-color:rgba(190,153,94,.65);box-shadow:0 24px 46px rgba(0,0,0,.32)}}
    @media(max-width:980px){.rpg-books-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:560px){.rpg-books-roadmap{margin-top:38px;padding-top:32px}.rpg-books-grid{grid-template-columns:1fr;gap:16px}.rpg-book-project{display:grid;grid-template-columns:112px minmax(0,1fr);align-items:start}.rpg-book-cover-wrap{width:112px;aspect-ratio:2/3}.rpg-book-meta{padding:13px 13px 14px}.rpg-book-meta p{font-size:.75rem;margin-block:9px 11px}.rpg-book-meta h4{font-size:.98rem}}
  `;
  document.head.appendChild(style);
})();
