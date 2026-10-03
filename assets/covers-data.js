window.LUMYRIEL_COVERS={
  filho:"assets/covers/o-filho-da-montanha.webp",
  tempos:"assets/covers/os-livros-dos-tempos.webp",
  magia:"assets/covers/artes-magicas-lumyrielianas.webp",
  biologia:"assets/covers/biologia-lumyrieliana.webp",
  matematica:"assets/covers/matematica-lumyrieliana.webp",
  rpg:"assets/covers/lumyriel-rpg.webp",
  construindo:"assets/covers/construindo-mundos.webp",
  criador:"assets/covers/criador-de-personagens.webp"
};

// Refinamento visual e integração comum dos leitores no mobile.
(() => {
  if (!document.getElementById('paper') || document.getElementById('reader-mobile-actions-fix')) return;
  const style=document.createElement('style');
  style.id='reader-mobile-actions-fix';
  style.textContent=`
    @media(max-width:850px){
      .topbar .reader-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;margin-left:auto!important;overflow:visible!important}
      .topbar .reader-more{position:relative!important;height:40px!important;display:block!important}
      .topbar .reader-more-toggle,.topbar #menuBtn,.topbar .back{box-sizing:border-box!important;height:40px!important;min-height:40px!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border:1px solid rgba(170,138,88,.52)!important;border-radius:999px!important;background:rgba(170,138,88,.075)!important;color:#e3d5be!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.012),0 2px 8px rgba(0,0,0,.12)!important;line-height:1!important;vertical-align:middle!important;white-space:nowrap!important}
      .topbar .reader-more-toggle{padding:0 13px!important;font-size:.71rem!important}.topbar .reader-more-toggle::after{content:none!important}
      .topbar #menuBtn{padding:0 15px!important;font-size:.72rem!important}
      .topbar .back{width:40px!important;min-width:40px!important;padding:0!important;font-size:0!important}
      .topbar .back::before{content:'←'!important;font:400 1.04rem/1 Georgia,"Times New Roman",serif!important;color:inherit!important;transform:translateY(-1px)}
      .topbar .reader-more-toggle:hover,.topbar #menuBtn:hover,.topbar .back:hover{background:rgba(170,138,88,.14)!important;border-color:rgba(207,183,133,.76)!important;color:#f2e5cf!important}
      .topbar .reader-more-menu{top:calc(100% + 9px)!important;right:0!important;border-radius:10px!important}
    }
    @media(max-width:390px){.topbar .reader-actions{gap:5px!important}.topbar .reader-more-toggle{padding-inline:10px!important;font-size:.67rem!important}.topbar #menuBtn{padding-inline:11px!important;font-size:.68rem!important}.topbar .back{width:40px!important;min-width:40px!important}}
  `;
  document.head.appendChild(style);

  const integration=document.createElement('script');
  integration.src='assets/reader-integration.js?v=20261003-2';
  integration.defer=true;
  document.head.appendChild(integration);

  const figures=document.createElement('script');
  figures.src='assets/reader-figures.js?v=20261003-1';
  figures.defer=true;
  figures.dataset.readerFigures='1';
  document.head.appendChild(figures);

  if (!document.querySelector('script[data-reader-recovery]')) {
    const recovery=document.createElement('script');
    recovery.src='assets/reader-recovery.js?v=20261002-2';
    recovery.defer=true;
    recovery.dataset.readerRecovery='1';
    document.head.appendChild(recovery);
  }
})();
