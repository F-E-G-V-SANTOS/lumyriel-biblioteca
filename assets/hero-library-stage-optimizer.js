/* Otimização do palco flutuante — interação estável + proporção natural + baixo custo. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_HERO_STAGE_OPTIMIZER__) return;
  window.__LUMYRIEL_HERO_STAGE_OPTIMIZER__ = true;

  const stage = document.querySelector('.lumyriel-hero-library-stage');
  const deck = stage && stage.querySelector('.lumyriel-hero-deck');
  const status = stage && stage.querySelector('.lumyriel-hero-deck-status');
  if (!stage || !deck || !status) return;

  /* O palco inicial funciona como uma vitrine de leitura, não como catálogo de projetos.
     Só permanecem aqui obras que possuem leitor publicado no site. */
  const readableBooks = new Set(['filho','tempos','magia','biologia']);
  [...deck.querySelectorAll('.lumyriel-hero-deck-item')].forEach(card => {
    if (!readableBooks.has(card.dataset.key)) card.remove();
  });
  deck.setAttribute('aria-label','Livros disponíveis para leitura em Lumyriel');

  const covers = window.LUMYRIEL_COVERS || {};
  const coarsePointer = matchMedia('(hover:none) and (pointer:coarse)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const descriptions = {
    filho: 'Romance de abertura de Lumyriel e ponto de entrada para a trajetória de Helior.',
    tempos: 'História cosmológica preservada como uma grande coleção de eras, registros e tradições de Lumyriel.',
    magia: 'Coleção didática em seis volumes sobre fundamentos, Mana, Aura, runologia, investigação e artes de alto risco.',
    biologia: 'Projeto dedicado à vida, anatomia, espécies, ecologia e coerência biológica do mundo.'
  };

  const titles = {
    filho: 'O Filho da Montanha',
    tempos: 'Os Livros dos Tempos',
    magia: 'Artes Mágicas Lumyrielianas',
    biologia: 'Biologia Lumyrieliana'
  };

  const targetFor = key => {
    const cover = document.querySelector(`[data-cover="${key}"],[data-optional-cover="${key}"],[data-project-cover="${key}"]`);
    return cover ? (cover.closest('.card,.future-card,section') || cover) : document.getElementById('biblioteca');
  };

  /* Primeiro converte fundos em imagens reais para preservar a proporção das capas. */
  [...deck.querySelectorAll('.lumyriel-hero-deck-item')].forEach((card, index) => {
    const key = card.dataset.key;
    const source = covers[key];
    const oldCover = card.querySelector('.lumyriel-hero-deck-cover');
    if (!source || !oldCover || oldCover.tagName === 'IMG') return;

    const img = document.createElement('img');
    img.className = 'lumyriel-hero-deck-cover lumyriel-hero-deck-image';
    img.src = source;
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    img.loading = index < 3 ? 'eager' : 'lazy';
    if (index < 3) img.fetchPriority = 'high';
    oldCover.replaceWith(img);
  });

  /* Clonar remove os listeners antigos de hover/focus que faziam cards vizinhos disputar estado. */
  const cards = [...deck.querySelectorAll('.lumyriel-hero-deck-item')].map(card => {
    const clean = card.cloneNode(true);
    card.replaceWith(clean);
    return clean;
  });

  let activeKey = null;
  let lastSelectedKey = null;

  const markLastSelected = key => {
    if (key) lastSelectedKey = key;
    cards.forEach(card => {
      card.classList.toggle('is-last-selected', Boolean(lastSelectedKey) && card.dataset.key === lastSelectedKey);
    });
  };

  const closeSelection = ({ preserveLast = true } = {}) => {
    const closingKey = activeKey;
    activeKey = null;
    deck.classList.remove('is-engaged');
    stage.classList.remove('has-mobile-detail');
    status.classList.remove('is-detail');
    cards.forEach(card => card.classList.remove('is-active'));
    status.innerHTML = '';
    delete stage.dataset.activeProject;

    if (preserveLast && closingKey) markLastSelected(closingKey);
    else if (!preserveLast) {
      lastSelectedKey = null;
      markLastSelected(null);
    }
  };

  const openSelection = card => {
    const key = card.dataset.key;
    activeKey = key;
    markLastSelected(key);
    deck.classList.add('is-engaged');
    stage.classList.add('has-mobile-detail');
    stage.dataset.activeProject = key;
    cards.forEach(item => item.classList.toggle('is-active', item === card));
    status.classList.add('is-detail');

    const again = coarsePointer.matches
      ? 'Toque novamente na capa para abrir este livro.'
      : 'Clique novamente na capa para abrir este livro.';

    status.innerHTML = `<strong>${titles[key] || key}</strong><span>${descriptions[key] || ''}</span><em>${again}</em>`;
  };

  cards.forEach(card => {
    const key = card.dataset.key;
    card.setAttribute('aria-label', `${titles[key] || key}. Selecionar para ver detalhes; ativar novamente para abrir o livro.`);

    card.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();

      if (activeKey !== key) {
        openSelection(card);
        return;
      }

      const target = targetFor(key);
      if (!target) {
        closeSelection({ preserveLast: true });
        return;
      }

      target.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'center'
      });
      target.classList.add('lumyriel-target-pulse');
      setTimeout(() => target.classList.remove('lumyriel-target-pulse'), 1300);
      closeSelection({ preserveLast: true });
    });

    card.addEventListener('keydown', event => {
      if (event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

  /* Qualquer clique/toque fora dos cards recolhe o selecionado. */
  document.addEventListener('pointerdown', event => {
    if (!activeKey) return;
    if (event.target.closest?.('.lumyriel-hero-deck-item')) return;
    closeSelection({ preserveLast: true });
  }, { passive: true });

  const style = document.createElement('style');
  style.id = 'lumyriel-hero-stage-optimizer-style';
  style.textContent = `
    /* Capas reais: proporção natural em desktop e mobile. */
    .lumyriel-hero-deck-item{
      aspect-ratio:auto!important;
      height:auto!important;
      cursor:pointer;
      transition:transform .30s cubic-bezier(.2,.85,.22,1),opacity .22s ease!important;
      filter:none!important;
      contain:layout style;
    }
    .lumyriel-hero-deck-float{
      display:block!important;
      width:100%!important;
      height:auto!important;
      animation:none!important;
      transform:none!important;
    }
    .lumyriel-hero-deck-cover,
    .lumyriel-hero-deck-image{
      display:block!important;
      width:100%!important;
      height:auto!important;
      max-width:100%!important;
      aspect-ratio:auto!important;
      object-fit:contain!important;
      background:none!important;
      box-sizing:border-box;
      transition:box-shadow .24s ease,border-color .24s ease!important;
    }

    /* O mouse sozinho não move mais nenhum card. */
    .lumyriel-hero-deck-item:not(.is-active):focus-visible{
      outline:1px solid rgba(207,183,133,.72)!important;
      outline-offset:5px;
      filter:none!important;
      transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) rotate(var(--rot))!important;
    }
    .lumyriel-hero-deck-item:not(.is-active):focus-visible .lumyriel-hero-deck-cover{
      filter:none!important;
    }

    /* Só o card explicitamente selecionado sobe. */
    .lumyriel-hero-deck.is-engaged .lumyriel-hero-deck-item:not(.is-active){
      filter:none!important;
      opacity:.40!important;
    }
    .lumyriel-hero-deck-item.is-active{filter:none!important}
    .lumyriel-hero-deck-item.is-last-selected:not(.is-active){z-index:28!important}
    .lumyriel-hero-deck-item.is-active .lumyriel-hero-deck-cover{filter:none!important}

    /* Resumo pequeno e legível em qualquer plataforma. */
    .lumyriel-hero-deck-status.is-detail{
      width:min(350px,calc(100% - 24px));
      padding:11px 13px 12px;
      border:1px solid rgba(170,138,88,.38);
      border-radius:5px;
      background:rgba(14,12,9,.94);
      box-shadow:0 16px 32px rgba(0,0,0,.34);
      text-align:left;
      text-shadow:none;
      overflow:hidden;
    }
    .lumyriel-hero-deck-status.is-detail strong{font-size:.98rem;color:#eadcc4}
    .lumyriel-hero-deck-status.is-detail span{margin-top:5px;color:#bdb2a2;font-size:.7rem;line-height:1.45}
    .lumyriel-hero-deck-status.is-detail em{font-size:.64rem}

    /* Fundo atmosférico sem animação/recomposição permanente. */
    .lumyriel-world-backdrop{
      position:absolute!important;
      top:0!important;
      left:0!important;
      right:0!important;
      bottom:auto!important;
      inset:auto!important;
      width:100%!important;
      height:max(100svh,820px)!important;
      opacity:.16!important;
      background-position:58% 28%!important;
      filter:none!important;
      transform:none!important;
      animation:none!important;
      will-change:auto!important;
      contain:paint;
    }
    .lumyriel-hero-library-stage:before{filter:none!important;opacity:.55!important}

    @media(max-width:600px), (hover:none) and (pointer:coarse){
      .lumyriel-world-backdrop{height:100svh!important}
      .lumyriel-hero-deck-item{transition:transform .22s ease,opacity .18s ease!important}
      .lumyriel-hero-deck-item:not(.is-active):focus-visible{
        transform:translate(-50%,-50%) translate(var(--mdx),var(--mdy)) rotate(var(--rot))!important;
      }
      /* No celular, mantém o painel inteiro dentro do palco e cria um respiro
         antes do início da Biblioteca. */
      .lumyriel-hero-deck-status.is-detail{
        bottom:46px!important;
        width:min(350px,calc(100% - 38px))!important;
        padding:13px 14px 14px!important;
        border:1px solid rgba(170,138,88,.52)!important;
        box-shadow:0 14px 28px rgba(0,0,0,.38)!important;
      }
      .lumyriel-hero-library-stage.has-mobile-detail{
        padding-bottom:28px!important;
      }
    }

    @media(prefers-reduced-motion:reduce){
      .lumyriel-hero-deck-item{transition:none!important}
    }
  `;
  document.head.appendChild(style);
})();
