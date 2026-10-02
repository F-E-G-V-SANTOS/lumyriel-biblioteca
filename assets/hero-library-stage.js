/* Palco flutuante da Biblioteca Lumyrieliana — home v1.0. */
(() => {
  'use strict';
  if (window.__LUMYRIEL_HERO_LIBRARY_STAGE__) return;
  window.__LUMYRIEL_HERO_LIBRARY_STAGE__ = true;

  const hero = document.getElementById('inicio');
  const stage = hero && hero.querySelector('.artifact-stage');
  if (!hero || !stage) return;

  const covers = Object.assign({
    filho:'assets/covers/o-filho-da-montanha.webp',
    tempos:'assets/covers/os-livros-dos-tempos.webp',
    magia:'assets/covers/artes-magicas-lumyrielianas.webp',
    biologia:'assets/covers/biologia-lumyrieliana.webp',
    matematica:'assets/covers/matematica-lumyrieliana.webp',
    criador:'assets/covers/criador-de-personagens.webp',
    rpg:'assets/covers/lumyriel-rpg.webp',
    construindo:'assets/covers/construindo-mundos.webp'
  }, window.LUMYRIEL_COVERS || {});

  const items = [
    {key:'filho',title:'O Filho da Montanha',dx:'0px',dy:'-68px',rot:'1deg',z:8},
    {key:'tempos',title:'Os Livros dos Tempos',dx:'-112px',dy:'-38px',rot:'-8deg',z:6},
    {key:'magia',title:'Artes Mágicas Lumyrielianas',dx:'112px',dy:'-32px',rot:'8deg',z:6},
    {key:'biologia',title:'Biologia Lumyrieliana',dx:'-164px',dy:'64px',rot:'-12deg',z:4},
    {key:'matematica',title:'Matemática Lumyrieliana',dx:'164px',dy:'70px',rot:'12deg',z:4},
    {key:'criador',title:'Criador de Personagens',dx:'-78px',dy:'116px',rot:'-5deg',z:5},
    {key:'rpg',title:'Lumyriel RPG',dx:'84px',dy:'122px',rot:'6deg',z:5},
    {key:'construindo',title:'Construindo Mundos',dx:'4px',dy:'164px',rot:'0deg',z:3}
  ];

  const targetFor = key => {
    if (key === 'criador') return document.getElementById('criador') || document.getElementById('creator-project-card');
    if (key === 'rpg') return document.getElementById('rpg-preview');
    if (key === 'construindo') return document.getElementById('construindo-project-card') || document.getElementById('futureShelf');
    const cover = document.querySelector(`[data-cover="${key}"],[data-optional-cover="${key}"],[data-project-cover="${key}"]`);
    return cover ? (cover.closest('.card,.future-card,section') || cover) : document.getElementById('biblioteca');
  };

  const fallbackHref = key => {
    if (key === 'criador') return '#criador';
    if (key === 'rpg') return '#rpg-preview';
    if (key === 'construindo') return '#futureShelf';
    return '#biblioteca';
  };

  stage.removeAttribute('aria-hidden');
  stage.classList.add('lumyriel-hero-library-stage');
  stage.innerHTML = '';

  const deck = document.createElement('div');
  deck.className = 'lumyriel-hero-deck';
  deck.setAttribute('aria-label','Livros e projetos de Lumyriel');

  const status = document.createElement('div');
  status.className = 'lumyriel-hero-deck-status';
  status.innerHTML = '<strong>Explore o acervo</strong><span>Passe sobre uma capa. Clique para localizar o projeto na página.</span>';

  items.forEach((item,index) => {
    const a = document.createElement('a');
    a.className = 'lumyriel-hero-deck-item';
    a.href = fallbackHref(item.key);
    a.dataset.key = item.key;
    a.style.setProperty('--dx',item.dx);
    a.style.setProperty('--dy',item.dy);
    a.style.setProperty('--rot',item.rot);
    a.style.setProperty('--z',String(item.z));
    a.style.setProperty('--delay',`${-index * 0.73}s`);
    a.setAttribute('aria-label',`${item.title}. Ir para este projeto na página.`);
    a.innerHTML = `<span class="lumyriel-hero-deck-float"><span class="lumyriel-hero-deck-cover" style="background-image:url('${covers[item.key]}')"></span></span>`;

    const activate = () => {
      deck.classList.add('is-engaged');
      deck.querySelectorAll('.lumyriel-hero-deck-item').forEach(el => el.classList.toggle('is-active',el===a));
      status.innerHTML = `<strong>${item.title}</strong><span>Clique para localizar este projeto na página.</span>`;
      stage.dataset.activeProject = item.key;
    };
    const clear = () => {
      deck.classList.remove('is-engaged');
      deck.querySelectorAll('.lumyriel-hero-deck-item').forEach(el => el.classList.remove('is-active'));
      status.innerHTML = '<strong>Explore o acervo</strong><span>Passe sobre uma capa. Clique para localizar o projeto na página.</span>';
      delete stage.dataset.activeProject;
    };

    a.addEventListener('mouseenter',activate);
    a.addEventListener('focus',activate);
    a.addEventListener('mouseleave',() => { if (!a.matches(':focus')) clear(); });
    a.addEventListener('blur',clear);
    a.addEventListener('click',event => {
      const target = targetFor(item.key);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
      target.classList.add('lumyriel-target-pulse');
      setTimeout(() => target.classList.remove('lumyriel-target-pulse'),1300);
    });
    deck.appendChild(a);
  });

  deck.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    const links = [...deck.querySelectorAll('.lumyriel-hero-deck-item')];
    const current = Math.max(0,links.indexOf(document.activeElement));
    const step = (event.key==='ArrowRight'||event.key==='ArrowDown') ? 1 : -1;
    links[(current+step+links.length)%links.length].focus();
    event.preventDefault();
  });

  stage.append(deck,status);

  if (!document.querySelector('.lumyriel-world-backdrop')) {
    const bg = document.createElement('div');
    bg.className = 'lumyriel-world-backdrop';
    bg.setAttribute('aria-hidden','true');
    document.body.prepend(bg);
  }

  const style = document.createElement('style');
  style.id = 'lumyriel-hero-library-stage-style';
  style.textContent = `
    body{position:relative;isolation:isolate}
    body>header,body>main,body>footer,body>.skip-link{position:relative;z-index:1}
    .lumyriel-world-backdrop{position:fixed;inset:-4vh -4vw;z-index:0;pointer-events:none;opacity:.23;background:
      linear-gradient(180deg,rgba(9,9,8,.24),rgba(7,7,6,.72) 68%,rgba(7,7,6,.92)),
      radial-gradient(ellipse at 72% 18%,rgba(197,157,94,.14),transparent 40%),
      url('assets/gallery/porto-entre-montanhas.webp') center 43%/cover no-repeat;
      filter:brightness(.58) saturate(.66) sepia(.10) contrast(1.08);transform:scale(1.055);animation:lumyrielWorldBreath 28s ease-in-out infinite alternate;will-change:transform}
    @keyframes lumyrielWorldBreath{from{transform:scale(1.055) translate3d(-.45%,0,0)}to{transform:scale(1.085) translate3d(.45%,-.6%,0)}}
    .lumyriel-hero-library-stage{position:relative;min-height:560px;display:grid;place-items:center;perspective:1200px;isolation:isolate}
    .lumyriel-hero-library-stage:before{content:"";position:absolute;inset:10% -2%;background:radial-gradient(ellipse at center,rgba(201,161,96,.16),rgba(48,39,27,.04) 42%,transparent 70%);filter:blur(18px);pointer-events:none}
    .lumyriel-hero-deck{position:relative;width:min(470px,100%);height:500px;transform-style:preserve-3d}
    .lumyriel-hero-deck-item{position:absolute;left:50%;top:48%;width:154px;aspect-ratio:.667;z-index:var(--z);transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) rotate(var(--rot));transform-origin:50% 82%;transition:transform .48s cubic-bezier(.2,.85,.22,1),opacity .36s ease,filter .36s ease;outline:none}
    .lumyriel-hero-deck-float{display:block;width:100%;height:100%;animation:lumyrielDeckFloat 6.8s ease-in-out infinite;animation-delay:var(--delay);transform-origin:center}
    .lumyriel-hero-deck-cover{display:block;width:100%;height:100%;background-position:center;background-size:cover;border:1px solid rgba(185,150,96,.55);border-radius:2px 7px 7px 2px;box-shadow:18px 25px 42px rgba(0,0,0,.5),-5px 0 12px rgba(0,0,0,.46),inset 7px 0 12px rgba(0,0,0,.18);transition:box-shadow .4s ease,filter .4s ease,border-color .4s ease}
    @keyframes lumyrielDeckFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    .lumyriel-hero-deck.is-engaged .lumyriel-hero-deck-item:not(.is-active){opacity:.34;filter:brightness(.58) saturate(.72);transform:translate(-50%,-50%) translate(calc(var(--dx) * 1.08),calc(var(--dy) * 1.05)) rotate(var(--rot)) scale(.94)}
    .lumyriel-hero-deck-item.is-active,.lumyriel-hero-deck-item:focus-visible{z-index:40;opacity:1!important;filter:none!important;transform:translate(-50%,-50%) translate(0,-18px) rotate(0deg) scale(1.26)!important}
    .lumyriel-hero-deck-item.is-active .lumyriel-hero-deck-float,.lumyriel-hero-deck-item:focus-visible .lumyriel-hero-deck-float{animation-play-state:paused}
    .lumyriel-hero-deck-item.is-active .lumyriel-hero-deck-cover,.lumyriel-hero-deck-item:focus-visible .lumyriel-hero-deck-cover{border-color:rgba(222,191,135,.9);box-shadow:0 30px 70px rgba(0,0,0,.68),0 0 32px rgba(170,138,88,.2),-8px 0 18px rgba(0,0,0,.44);filter:brightness(1.04) saturate(1.03)}
    .lumyriel-hero-deck-status{position:absolute;left:50%;bottom:22px;z-index:60;width:min(330px,86%);transform:translateX(-50%);text-align:center;pointer-events:none;text-shadow:0 2px 8px #000}
    .lumyriel-hero-deck-status strong{display:block;color:#eadcc4;font:400 1rem Georgia,"Times New Roman",serif;letter-spacing:.035em}
    .lumyriel-hero-deck-status span{display:block;margin-top:3px;color:#a99d8c;font-size:.7rem;line-height:1.35}
    .lumyriel-target-pulse{animation:lumyrielTargetPulse 1.25s ease}
    @keyframes lumyrielTargetPulse{0%,100%{box-shadow:inherit}35%{box-shadow:0 0 0 1px rgba(207,183,133,.72),0 0 44px rgba(170,138,88,.24)}}
    @media(max-width:900px){.lumyriel-hero-library-stage{min-height:500px}.lumyriel-hero-deck{width:min(430px,100%);height:440px}.lumyriel-hero-deck-item{width:136px}.lumyriel-hero-deck-status{bottom:4px}}
    @media(max-width:600px){.lumyriel-world-backdrop{opacity:.17;background-position:58% 30%}.lumyriel-hero-library-stage{min-height:395px;margin-top:24px}.lumyriel-hero-deck{width:min(340px,calc(100vw - 34px));height:350px;transform:scale(.86)}.lumyriel-hero-deck-item{width:112px}.lumyriel-hero-deck-status{bottom:-18px;width:100%}.lumyriel-hero-deck-status span{display:none}}
    @media(prefers-reduced-motion:reduce){.lumyriel-world-backdrop,.lumyriel-hero-deck-float{animation:none!important}.lumyriel-hero-deck-item{transition:none}.lumyriel-target-pulse{animation:none}}
  `;
  document.head.appendChild(style);
})();
