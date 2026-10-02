/* Otimização do palco flutuante — proporção natural + baixo custo de renderização. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_HERO_STAGE_OPTIMIZER__) return;
  window.__LUMYRIEL_HERO_STAGE_OPTIMIZER__ = true;

  const stage = document.querySelector('.lumyriel-hero-library-stage');
  const deck = stage && stage.querySelector('.lumyriel-hero-deck');
  if (!stage || !deck) return;

  const covers = window.LUMYRIEL_COVERS || {};
  const cards = [...deck.querySelectorAll('.lumyriel-hero-deck-item')];

  cards.forEach((card, index) => {
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

  const style = document.createElement('style');
  style.id = 'lumyriel-hero-stage-optimizer-style';
  style.textContent = `
    /* A capa passa a usar sua proporção real em qualquer tamanho de tela. */
    .lumyriel-hero-deck-item{
      aspect-ratio:auto!important;
      height:auto!important;
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

    /* Mantém o destaque sem filtros caros aplicados continuamente. */
    .lumyriel-hero-deck.is-engaged .lumyriel-hero-deck-item:not(.is-active){
      filter:none!important;
      opacity:.40!important;
    }
    .lumyriel-hero-deck-item.is-active,
    .lumyriel-hero-deck-item:focus-visible{filter:none!important}
    .lumyriel-hero-deck-item.is-active .lumyriel-hero-deck-cover,
    .lumyriel-hero-deck-item:focus-visible .lumyriel-hero-deck-cover{filter:none!important}

    /* O mundo ao fundo continua presente, mas deixa de animar/recompor durante a rolagem. */
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

    /* Não gaste renderização com pseudoefeito desfocado permanente. */
    .lumyriel-hero-library-stage:before{filter:none!important;opacity:.55!important}

    @media(max-width:600px), (hover:none) and (pointer:coarse){
      .lumyriel-world-backdrop{height:100svh!important}
      .lumyriel-hero-deck-item{transition:transform .22s ease,opacity .18s ease!important}
    }

    @media(prefers-reduced-motion:reduce){
      .lumyriel-hero-deck-item{transition:none!important}
    }
  `;
  document.head.appendChild(style);
})();
