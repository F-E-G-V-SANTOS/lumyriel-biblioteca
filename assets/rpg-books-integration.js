/* Coleção futura de livros do Lumyriel RPG — carregamento leve e isolado. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_RPG_BOOKS__) return;
  window.__LUMYRIEL_RPG_BOOKS__ = true;

  const section = document.getElementById('rpg-preview');
  const shell = section && section.querySelector('.shell');
  if (!section || !shell || document.getElementById('rpgBooksCollection')) return;

  const books = [
    {
      title: 'Livro do Mestre',
      cover: 'assets/rpg-books/lumyriel-rpg-livro-do-mestre.jpg.b64',
      desc: 'Ferramentas para preparar e conduzir campanhas, organizar situações, administrar consequências e manter o mundo responsivo durante a aventura.'
    },
    {
      title: 'Guia do Jogador',
      cover: 'assets/rpg-books/lumyriel-rpg-guia-do-jogador-v2.jpg.b64',
      desc: 'Porta de entrada para quem vai jogar: personagem, decisões, exploração, ações, recursos e a lógica de competências construída pela experiência.'
    },
    {
      title: 'Bestiário',
      cover: 'assets/rpg-books/lumyriel-rpg-bestiario.jpg.b64',
      desc: 'Referência de criaturas e encontros, reunindo comportamento, ambiente, sinais, riscos e elementos úteis à investigação e à aventura.'
    },
    {
      title: 'Raças',
      cover: 'assets/rpg-books/lumyriel-rpg-racas.jpg.b64',
      desc: 'Referência para povos e espécies jogáveis, conectando anatomia, características, culturas e possibilidades de personagem às regras de Lumyriel.'
    }
  ];

  const collection = document.createElement('div');
  collection.id = 'rpgBooksCollection';
  collection.className = 'rpg-books-collection';
  collection.innerHTML = `
    <div class="rpg-books-heading">
      <div>
        <div class="eyebrow">Coleção em desenvolvimento</div>
        <h3>Livros do Lumyriel RPG</h3>
      </div>
      <p>Quatro livros estão sendo estruturados para formar a base editorial do sistema. As capas já têm direção visual aprovada; conteúdo e regras continuam em desenvolvimento.</p>
    </div>
    <div class="rpg-books-grid">
      ${books.map((book, index) => `
        <article class="rpg-book-card">
          <div class="rpg-book-cover-wrap">
            <img class="rpg-book-cover" data-b64-src="${book.cover}" alt="Capa de Lumyriel RPG — ${book.title}" loading="lazy" decoding="async" ${index === 0 ? 'fetchpriority="low"' : ''} />
          </div>
          <div class="rpg-book-copy">
            <span class="rpg-book-status">Em desenvolvimento</span>
            <h4>${book.title}</h4>
            <p>${book.desc}</p>
          </div>
        </article>
      `).join('')}
    </div>
  `;

  shell.appendChild(collection);

  const style = document.createElement('style');
  style.id = 'rpg-books-integration-style';
  style.textContent = `
    .rpg-books-collection{
      margin-top:32px;
      padding-top:30px;
      border-top:1px solid rgba(170,138,88,.26);
    }
    .rpg-books-heading{
      display:flex;
      align-items:end;
      justify-content:space-between;
      gap:28px;
      margin-bottom:24px;
    }
    .rpg-books-heading h3{
      margin:7px 0 0;
      color:#eadfcd;
      font:400 clamp(1.9rem,3.4vw,3rem)/1.05 Georgia,"Times New Roman",serif;
      letter-spacing:-.02em;
    }
    .rpg-books-heading p{
      max-width:540px;
      margin:0;
      color:#a9a092;
      font-size:.9rem;
      line-height:1.58;
    }
    .rpg-books-grid{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:16px;
    }
    .rpg-book-card{
      min-width:0;
      overflow:hidden;
      border:1px solid #393126;
      border-radius:3px;
      background:linear-gradient(180deg,rgba(24,21,16,.94),rgba(12,11,9,.98));
      box-shadow:0 13px 28px rgba(0,0,0,.18);
      transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
    }
    .rpg-book-card:hover{
      transform:translateY(-3px);
      border-color:#6a5940;
      box-shadow:0 18px 36px rgba(0,0,0,.28);
    }
    .rpg-book-cover-wrap{
      padding:14px 14px 0;
      display:grid;
      place-items:center;
    }
    .rpg-book-cover{
      display:block;
      width:min(100%,150px);
      height:auto;
      aspect-ratio:2/3;
      object-fit:cover;
      border:1px solid rgba(170,138,88,.44);
      border-radius:2px 5px 5px 2px;
      background:#15120e;
      box-shadow:10px 14px 24px rgba(0,0,0,.38),-3px 0 8px rgba(0,0,0,.42);
    }
    .rpg-book-copy{
      padding:15px 15px 17px;
    }
    .rpg-book-status{
      display:inline-block;
      margin-bottom:9px;
      padding:4px 7px;
      border:1px solid #6f5941;
      border-radius:2px;
      color:#d9bd9c;
      background:#13110e;
      font-size:.58rem;
      line-height:1.2;
      text-transform:uppercase;
      letter-spacing:.1em;
    }
    .rpg-book-copy h4{
      margin:0 0 8px;
      color:#eee2cf;
      font:400 1.22rem/1.08 Georgia,"Times New Roman",serif;
    }
    .rpg-book-copy p{
      margin:0;
      color:#a9a092;
      font-size:.77rem;
      line-height:1.5;
    }
    @media(max-width:920px){
      .rpg-books-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:600px){
      .rpg-books-collection{margin-top:26px;padding-top:24px}
      .rpg-books-heading{display:block;margin-bottom:18px}
      .rpg-books-heading p{margin-top:10px;font-size:.82rem}
      .rpg-books-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .rpg-book-cover-wrap{padding:10px 10px 0}
      .rpg-book-cover{width:min(100%,132px)}
      .rpg-book-copy{padding:12px 11px 14px}
      .rpg-book-copy h4{font-size:1rem}
      .rpg-book-copy p{font-size:.7rem;line-height:1.42}
      .rpg-book-status{font-size:.52rem;letter-spacing:.075em}
      .rpg-book-card:hover{transform:none}
    }
    @media(max-width:370px){
      .rpg-books-grid{grid-template-columns:1fr}
      .rpg-book-card{display:grid;grid-template-columns:118px 1fr;align-items:start}
      .rpg-book-cover-wrap{padding:10px}
      .rpg-book-cover{width:100%}
      .rpg-book-copy{padding:13px 11px 12px 0}
    }
    @media(prefers-reduced-motion:reduce){.rpg-book-card{transition:none}}
  `;
  document.head.appendChild(style);

  async function hydrateCover(img) {
    const source = img.dataset.b64Src;
    if (!source) return;
    try {
      const response = await fetch(source, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const encoded = (await response.text()).replace(/\s+/g, '');
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
      img.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
      img.src = objectUrl;
      delete img.dataset.b64Src;
    } catch (error) {
      img.alt += ' (imagem temporariamente indisponível)';
      console.warn('[Lumyriel RPG] Falha ao carregar capa:', source, error);
    }
  }

  const images = [...collection.querySelectorAll('img[data-b64-src]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        hydrateCover(entry.target);
      });
    }, { rootMargin: '240px 0px' });
    images.forEach(img => observer.observe(img));
  } else {
    images.forEach(hydrateCover);
  }
})();
