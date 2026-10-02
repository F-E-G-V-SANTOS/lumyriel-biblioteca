(() => {
  'use strict';

  const cards = Array.from(document.querySelectorAll('.media-card'));
  const track = document.getElementById('shelfTrack');
  const viewport = document.getElementById('shelfViewport');
  const title = document.getElementById('featureTitle');
  const kicker = document.getElementById('featureKicker');
  const description = document.getElementById('featureDescription');
  const meta = document.getElementById('featureMeta');
  const cover = document.getElementById('featureCover');
  const action = document.getElementById('primaryAction');
  const bg = document.getElementById('livingBgArt');
  const prev = document.getElementById('prevCard');
  const next = document.getElementById('nextCard');
  const tabs = Array.from(document.querySelectorAll('.nav-tab'));

  let activeIndex = Math.max(0, cards.findIndex(card => card.classList.contains('active')));
  let swapTimer = null;

  function clampIndex(index) {
    if (!cards.length) return 0;
    return (index + cards.length) % cards.length;
  }

  function centerCard(card) {
    if (!card || !viewport) return;
    const viewportRect = viewport.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const current = viewport.scrollLeft;
    const delta = cardRect.left - viewportRect.left - (viewportRect.width - cardRect.width) / 2;
    viewport.scrollTo({ left: current + delta, behavior: 'smooth' });
  }

  function updateTabs(index) {
    tabs.forEach(tab => tab.classList.remove('active'));
    if (index >= 4) tabs[2]?.classList.add('active');
    else if (index >= 3) tabs[1]?.classList.add('active');
    else tabs[0]?.classList.add('active');
  }

  function updateFeature(card, index, options = {}) {
    if (!card) return;
    activeIndex = clampIndex(index);

    cards.forEach((item, i) => {
      const active = i === activeIndex;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (active) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });

    const image = card.dataset.cover || '';
    const theme = card.dataset.theme || 'montanha';
    document.body.dataset.theme = theme;

    kicker.textContent = card.dataset.kicker || '';
    title.textContent = card.dataset.title || '';
    description.textContent = card.dataset.description || '';
    meta.textContent = card.dataset.meta || '';
    action.href = card.dataset.href || '#';
    action.textContent = theme === 'rpg' ? 'Ver projeto' : (theme === 'criador' ? 'Abrir criador' : 'Abrir');

    if (image) {
      clearTimeout(swapTimer);
      cover.style.opacity = '.18';
      cover.style.transform = 'rotateY(-5deg) rotateZ(1.2deg) translateY(5px) scale(.985)';
      swapTimer = setTimeout(() => {
        cover.src = image;
        cover.onload = () => {
          cover.style.opacity = '1';
          cover.style.transform = '';
        };
        bg.style.opacity = '.34';
        requestAnimationFrame(() => {
          bg.style.backgroundImage = `url('${image}')`;
          bg.style.opacity = '.64';
          bg.style.transform = 'scale(1.1)';
          setTimeout(() => { bg.style.transform = 'scale(1.08)'; }, 700);
        });
      }, 120);
    }

    updateTabs(activeIndex);
    if (options.center !== false) centerCard(card);
    if (options.focus) card.focus({ preventScroll: true });
  }

  function select(index, options) {
    const nextIndex = clampIndex(index);
    updateFeature(cards[nextIndex], nextIndex, options);
  }

  cards.forEach((card, index) => {
    card.setAttribute('aria-pressed', index === activeIndex ? 'true' : 'false');

    card.addEventListener('mouseenter', () => updateFeature(card, index, { center: false }));
    card.addEventListener('focus', () => updateFeature(card, index));
    card.addEventListener('click', () => updateFeature(card, index));
    card.addEventListener('dblclick', () => {
      const href = card.dataset.href;
      if (href) window.location.href = href;
    });

    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const href = card.dataset.href;
        if (href) window.location.href = href;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        select(index + 1, { focus: true });
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        select(index - 1, { focus: true });
      }
    });
  });

  prev?.addEventListener('click', () => select(activeIndex - 1, { focus: true }));
  next?.addEventListener('click', () => select(activeIndex + 1, { focus: true }));

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const index = Number(tab.dataset.jump || 0);
      select(index, { focus: true });
    });
  });

  document.addEventListener('keydown', event => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (event.key === 'ArrowRight' && !document.activeElement?.classList.contains('media-card')) {
      event.preventDefault();
      select(activeIndex + 1, { focus: true });
    }
    if (event.key === 'ArrowLeft' && !document.activeElement?.classList.contains('media-card')) {
      event.preventDefault();
      select(activeIndex - 1, { focus: true });
    }
  });

  viewport?.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (window.innerWidth <= 720) return;
    if (Math.abs(event.deltaY) < 8) return;
    event.preventDefault();
    viewport.scrollLeft += event.deltaY * .7;
  }, { passive: false });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: .18 });
    document.querySelectorAll('.feature-copy,.feature-cover-wrap,.shelf').forEach(el => observer.observe(el));
  }

  updateFeature(cards[activeIndex], activeIndex, { center: false });
})();
