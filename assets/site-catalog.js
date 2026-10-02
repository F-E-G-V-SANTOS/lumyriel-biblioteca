/* Atualização editorial do catálogo e das capas aprovadas de Lumyriel. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_SITE_CATALOG_V2__) return;
  window.__LUMYRIEL_SITE_CATALOG_V2__ = true;

  const AUTHOR = 'F E G V Santos';
  const COVERS = {
    filho: 'assets/covers/o-filho-da-montanha.webp',
    tempos: 'assets/covers/os-livros-dos-tempos.webp',
    magia: 'assets/covers/artes-magicas-lumyrielianas.webp',
    biologia: 'assets/covers/biologia-lumyrieliana.webp',
    matematica: 'assets/covers/matematica-lumyrieliana.webp',
    rpg: 'assets/covers/lumyriel-rpg.webp',
    rpgMestre: 'assets/covers/rpg-livro-do-mestre.jpg',
    rpgJogador: 'assets/covers/rpg-guia-do-jogador.jpg',
    rpgBestiario: 'assets/covers/rpg-bestiario.jpg',
    rpgRacas: 'assets/covers/rpg-racas.jpg',
    construindo: 'assets/covers/construindo-mundos.webp',
    criador: 'assets/covers/criador-de-personagens.webp'
  };

  window.LUMYRIEL_COVERS = Object.assign({}, window.LUMYRIEL_COVERS || {}, COVERS);

  const style = document.createElement('style');
  style.textContent = `
    .catalog-author{margin-top:-4px;color:#b8aa94;font:400 .82rem/1.45 Georgia,"Times New Roman",serif;letter-spacing:.06em}
    .site-author-credit{margin-top:18px;color:#b7aa95;font:400 .9rem/1.5 Georgia,"Times New Roman",serif;letter-spacing:.055em}
    .future-card.live-tool .status{border-color:#586147;color:#cbd5b8}
    .creator-cover-strip{margin-top:22px;display:flex;align-items:center;gap:18px;max-width:520px}
    .creator-cover-strip img{width:92px;aspect-ratio:.667;object-fit:cover;border:1px solid #62523b;box-shadow:0 14px 28px rgba(0,0,0,.34)}
    .creator-cover-strip span{color:#a79e8f;font-size:.82rem;line-height:1.55}
    .creator-cover-strip b{display:block;color:#dfd1ba;font:400 1rem Georgia,"Times New Roman",serif;margin-bottom:3px}
    .creator-page-identity{margin:22px 0 0;display:flex;align-items:center;gap:18px;max-width:720px;padding:15px;border:1px solid #4b4030;background:rgba(18,16,13,.72)}
    .creator-page-identity img{width:112px;aspect-ratio:.667;object-fit:cover;border:1px solid #62523b;box-shadow:0 16px 30px rgba(0,0,0,.34)}
    .creator-page-identity strong{display:block;color:#e7dbc5;font:400 1.08rem Georgia,"Times New Roman",serif;margin-bottom:4px}
    .creator-page-identity span{color:#b7ad9d;font-size:.84rem;line-height:1.55}

    .rpg-book-library{grid-column:1/-1;width:100%;margin-top:42px;padding-top:34px;border-top:1px solid rgba(170,138,88,.28)}
    .rpg-book-library-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.75fr);gap:28px;align-items:end;margin-bottom:24px}
    .rpg-book-library-kicker{display:block;margin-bottom:8px;color:#cfb785;font-size:.67rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
    .rpg-book-library h3{margin:0;color:#eadfcf;font:400 clamp(1.8rem,3vw,2.7rem)/1.08 Georgia,"Times New Roman",serif}
    .rpg-book-library-head p{margin:0;color:#a79e8f;font-size:.84rem;line-height:1.6}
    .rpg-book-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
    .rpg-book-project{min-width:0;padding:11px 11px 15px;border:1px solid #393126;background:linear-gradient(180deg,rgba(23,20,16,.9),rgba(11,10,8,.96));box-shadow:0 14px 26px rgba(0,0,0,.18);transition:transform .18s ease,border-color .18s ease,background .18s ease}
    .rpg-book-project:hover{transform:translateY(-2px);border-color:#6a5940;background:linear-gradient(180deg,rgba(29,25,19,.94),rgba(13,11,9,.98))}
    .rpg-book-project img{display:block;width:100%;height:auto;aspect-ratio:2/3;object-fit:cover;border:1px solid rgba(126,105,73,.72);background:#100e0b;box-shadow:0 12px 24px rgba(0,0,0,.3)}
    .rpg-book-project .rpg-book-state{display:inline-block;margin-top:12px;padding:4px 7px;border:1px solid #6f5941;color:#d9bd9c;font-size:.58rem;letter-spacing:.1em;text-transform:uppercase}
    .rpg-book-project h4{margin:9px 0 6px;color:#eadfcf;font:400 1.02rem/1.18 Georgia,"Times New Roman",serif}
    .rpg-book-project p{margin:0;color:#9f9688;font-size:.72rem;line-height:1.48}

    @media(max-width:900px){
      .rpg-book-library-head{grid-template-columns:1fr;gap:10px}
      .rpg-book-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:700px){
      .creator-cover-strip{align-items:flex-start}.creator-cover-strip img{width:78px}.creator-page-identity{align-items:flex-start}.creator-page-identity img{width:82px}
      .rpg-book-library{margin-top:30px;padding-top:26px}
      .rpg-book-grid{gap:11px}
      .rpg-book-project{padding:8px 8px 12px}
      .rpg-book-project h4{font-size:.92rem}
      .rpg-book-project p{font-size:.67rem}
    }
  `;
  document.head.appendChild(style);

  function probeAndApply(el, path) {
    if (!el || !path) return;
    const img = new Image();
    img.onload = () => {
      el.style.setProperty('background-image', `url("${path}")`, 'important');
      el.classList.add('real-cover');
      el.classList.remove('placeholder-cover');
    };
    img.src = `${path}?v=20261001`;
  }

  function renameMagic() {
    document.querySelectorAll('.book-name,.hero-book h3,.cover h3').forEach(el => {
      if (el.textContent.trim() === 'Livro das Artes Mágicas') {
        el.textContent = 'Artes Mágicas Lumyrielianas';
      }
    });
  }

  function applyExistingCovers() {
    document.querySelectorAll('[data-cover]').forEach(el => {
      const key = el.getAttribute('data-cover');
      if (COVERS[key]) probeAndApply(el, COVERS[key]);
    });

    document.querySelectorAll('[data-optional-cover]').forEach(el => {
      const key = el.getAttribute('data-optional-cover');
      if (COVERS[key]) probeAndApply(el, COVERS[key]);
    });

    const rpg = document.querySelector('.rpg-cover');
    if (rpg) probeAndApply(rpg, COVERS.rpg);
  }

  function addAuthorCredits() {
    document.querySelectorAll('.card .book-name').forEach(title => {
      const meta = title.closest('.meta');
      if (!meta || meta.querySelector('.catalog-author')) return;
      const credit = document.createElement('div');
      credit.className = 'catalog-author';
      credit.textContent = AUTHOR;
      title.insertAdjacentElement('afterend', credit);
    });

    const heroCopy = document.querySelector('#inicio.hero > div:first-child');
    if (heroCopy && !heroCopy.querySelector('.site-author-credit')) {
      const credit = document.createElement('div');
      credit.className = 'site-author-credit';
      credit.textContent = `Criação e autoria · ${AUTHOR}`;
      const actions = heroCopy.querySelector('.actions');
      if (actions) actions.insertAdjacentElement('afterend', credit);
      else heroCopy.appendChild(credit);
    }

    const originList = document.querySelector('#origem .origin-card dl');
    if (originList && !originList.querySelector('[data-author-credit]')) {
      const row = document.createElement('div');
      row.setAttribute('data-author-credit', 'true');
      row.innerHTML = `<dt>Criação e autoria</dt><dd>${AUTHOR}</dd>`;
      originList.appendChild(row);
    }

    const footerShell = document.querySelector('footer .shell');
    if (footerShell && !footerShell.querySelector('.site-author-credit')) {
      const credit = document.createElement('div');
      credit.className = 'site-author-credit';
      credit.textContent = `Lumyriel · criação e autoria de ${AUTHOR}`;
      footerShell.appendChild(credit);
    }
  }

  function createProjectCard({ id, href, coverKey, statusClass, statusLabel, title, description, bottom, linkLabel, liveTool }) {
    const tag = href ? 'a' : 'article';
    const el = document.createElement(tag);
    el.id = id;
    el.className = `card future-card${liveTool ? ' live-tool' : ''}`;
    el.dataset.status = statusClass === 'live' ? 'live' : (statusClass === 'dev' ? 'dev' : 'planned');
    if (href) el.href = href;
    el.innerHTML = `
      <div class="cover-wrap"><div class="cover placeholder-cover" data-project-cover="${coverKey}"><small>Lumyriel</small><h3>${title}</h3></div></div>
      <div class="meta">
        <span class="status ${statusClass}">${statusLabel}</span>
        <h3 class="book-name">${title}</h3>
        <div class="catalog-author">${AUTHOR}</div>
        <p>${description}</p>
        <div class="bottom"><span>${bottom}</span>${href ? `<span class="textlink">${linkLabel}</span>` : '<button class="textlink" disabled>Em desenvolvimento</button>'}</div>
      </div>`;
    probeAndApply(el.querySelector('[data-project-cover]'), COVERS[coverKey]);
    return el;
  }

  function updateProjectShelf() {
    const list = document.querySelector('#futureShelf .future-list');
    if (!list) return;

    const head = document.querySelector('#futureShelf .future-shelf-head');
    if (head) {
      const eyebrow = head.querySelector('.eyebrow');
      const heading = head.querySelector('h3');
      const text = head.querySelector('p');
      if (eyebrow) eyebrow.textContent = 'Projetos de Lumyriel';
      if (heading) heading.textContent = 'Projetos e ferramentas';
      if (text) text.textContent = 'Livros, ferramentas e experiências de Lumyriel aparecem com seu estado atual, sem misturar o que já pode ser usado com o que ainda está em desenvolvimento.';
    }

    if (!document.getElementById('creator-project-card')) {
      list.prepend(createProjectCard({
        id: 'creator-project-card',
        href: 'character-creator.html',
        coverKey: 'criador',
        statusClass: 'live',
        statusLabel: 'Ferramenta disponível',
        title: 'Criador de Personagens',
        description: 'Ferramenta de construção de personagens com anatomia, cultura, linguagem, passado, valores, equipamento e validações de coerência próprias de Lumyriel.',
        bottom: 'ferramenta interativa',
        linkLabel: 'Abrir criador →',
        liveTool: true
      }));
    }

    if (!document.getElementById('construindo-project-card')) {
      list.appendChild(createProjectCard({
        id: 'construindo-project-card',
        href: '',
        coverKey: 'construindo',
        statusClass: 'dev',
        statusLabel: 'Em desenvolvimento',
        title: 'Construindo Mundos',
        description: 'Coleção metodológica sobre construção de mundos, reunindo mundo físico, ecologia, povos, culturas, línguas e ferramentas práticas de projeto.',
        bottom: 'projeto editorial',
        linkLabel: ''
      }));
    }
  }

  function updateCreatorCallout() {
    const callout = document.querySelector('#criador .creator-callout > div:first-child');
    if (!callout || callout.querySelector('.creator-cover-strip')) return;
    const wrap = document.createElement('div');
    wrap.className = 'creator-cover-strip';
    wrap.innerHTML = `<img src="${COVERS.criador}" alt="Capa do Criador de Personagens" loading="lazy" onerror="this.parentElement.hidden=true"><span><b>Criador de Personagens</b>Crie personagens com anatomia, cultura, linguagem, passado, valores e equipamentos de Lumyriel.</span>`;
    const btn = callout.querySelector('.btn');
    if (btn) btn.insertAdjacentElement('afterend', wrap);
    else callout.appendChild(wrap);
  }

  function updateRpgPreview() {
    const copy = document.querySelector('#rpg-preview .rpg-preview-copy');
    if (!copy || copy.querySelector('.rpg-cover-strip')) return;
    const wrap = document.createElement('div');
    wrap.className = 'creator-cover-strip rpg-cover-strip';
    wrap.innerHTML = `<img src="${COVERS.rpg}" alt="Capa de Lumyriel RPG" loading="lazy" onerror="this.parentElement.hidden=true"><span><b>Lumyriel RPG</b>Projeto single player em desenvolvimento no universo de Lumyriel.</span>`;
    copy.appendChild(wrap);
  }

  function updateRpgLibrary() {
    const preview = document.getElementById('rpg-preview');
    if (!preview || preview.querySelector('.rpg-book-library')) return;

    const host = preview.querySelector('.shell') || preview;
    const books = [
      {
        key:'rpgMestre',
        title:'Livro do Mestre',
        description:'Ferramentas para condução de campanhas, preparação de cenas, conflitos, ritmo, improvisação e memória do mundo.'
      },
      {
        key:'rpgJogador',
        title:'Guia do Jogador',
        description:'Referência para criação, interpretação e desenvolvimento de personagens dentro das regras e da experiência de Lumyriel RPG.'
      },
      {
        key:'rpgBestiario',
        title:'Bestiário',
        description:'Criaturas, comportamentos, habitats, perigos e pistas para encontros, exploração e investigação em Lumyriel.'
      },
      {
        key:'rpgRacas',
        title:'Raças',
        description:'Referência jogável sobre povos, espécies e linhagens de Lumyriel, reunindo anatomia, cultura e particularidades relevantes para personagens.'
      }
    ];

    const library = document.createElement('div');
    library.className = 'rpg-book-library';
    library.id = 'rpg-livros';
    library.innerHTML = `
      <div class="rpg-book-library-head">
        <div>
          <span class="rpg-book-library-kicker">Biblioteca do sistema</span>
          <h3>Próximos livros do Lumyriel RPG</h3>
        </div>
        <p>O sistema está sendo desenvolvido como uma coleção própria. Estas capas já definem quatro das próximas frentes editoriais; os livros permanecem em desenvolvimento.</p>
      </div>
      <div class="rpg-book-grid">
        ${books.map(book => `
          <article class="rpg-book-project">
            <img src="${COVERS[book.key]}" alt="Capa de Lumyriel RPG — ${book.title}" loading="lazy" decoding="async">
            <span class="rpg-book-state">Em desenvolvimento</span>
            <h4>${book.title}</h4>
            <p>${book.description}</p>
          </article>`).join('')}
      </div>`;
    host.appendChild(library);
  }

  function updateCreatorPage() {
    if (!document.getElementById('creatorForm')) return;
    const hero = document.querySelector('main .hero.shell');
    if (!hero || hero.querySelector('.creator-page-identity')) return;
    const block = document.createElement('div');
    block.className = 'creator-page-identity';
    block.innerHTML = `<img src="${COVERS.criador}" alt="Capa do Criador de Personagens" loading="lazy" onerror="this.parentElement.hidden=true"><span><strong>Criador de Personagens · ${AUTHOR}</strong>Ferramenta de construção de personagens de Lumyriel.</span>`;
    const notice = hero.querySelector('.notice');
    if (notice) notice.insertAdjacentElement('afterend', block);
    else hero.appendChild(block);
  }

  function loadHeroStageOptimizer() {
    if (document.querySelector('script[data-lumyriel-hero-stage-optimizer]')) return;
    const optimizer = document.createElement('script');
    optimizer.src = 'assets/hero-library-stage-optimizer.js';
    optimizer.defer = true;
    optimizer.dataset.lumyrielHeroStageOptimizer = '1';
    document.head.appendChild(optimizer);
  }

  function loadHeroLibraryStage() {
    if (!document.getElementById('inicio')) return;
    const existing = document.querySelector('script[data-lumyriel-hero-library-stage]');
    if (existing) {
      if (window.__LUMYRIEL_HERO_LIBRARY_STAGE__) loadHeroStageOptimizer();
      else existing.addEventListener('load', loadHeroStageOptimizer, { once:true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'assets/hero-library-stage.js';
    script.defer = true;
    script.dataset.lumyrielHeroLibraryStage = '1';
    script.addEventListener('load', loadHeroStageOptimizer, { once:true });
    document.head.appendChild(script);
  }

  renameMagic();
  applyExistingCovers();
  updateProjectShelf();
  addAuthorCredits();
  updateCreatorCallout();
  updateRpgPreview();
  updateRpgLibrary();
  updateCreatorPage();
  loadHeroLibraryStage();
})();
