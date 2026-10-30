/* Navigation and filters for statically rendered pages. No catalog rewriting. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const header = $('siteHeader'), menu = $('menuToggle');
  const closeMenu = () => { header?.classList.remove('menu-open'); menu?.setAttribute('aria-expanded','false'); };
  menu?.addEventListener('click', () => menu.setAttribute('aria-expanded', String(header.classList.toggle('menu-open'))));
  $('siteNav')?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeMenu(); });

  // Preserve old home anchors without breaking saved links from other pages.
  if (document.body.dataset.page === 'index.html') {
    const routes = { '#origem':'sobre.html#origem', '#inspiracoes':'sobre.html#inspiracoes', '#criador':'ferramentas.html#criador', '#rpg-preview':'ferramentas.html#rpg-preview', '#rpg-books-roadmap':'ferramentas.html#rpg-books-roadmap', '#futureShelf':'ferramentas.html', '#construindo-project-card':'biblioteca.html?category=derived', '#narrar-mundos-vivos-card':'biblioteca.html?category=derived' };
    if (routes[location.hash]) location.replace(routes[location.hash]);
  }

  const catalog = window.LUMYRIEL_CATALOG?.books || [];
  // Accept only known local reader routes from storage; never follow arbitrary URLs.
  function safeResume(saved, book) {
    if (!saved?.url || typeof saved.url !== 'string') return null;
    try {
      const candidate = new URL(saved.url, location.href), fallback = new URL(book.url, location.href);
      if (candidate.origin !== location.origin || candidate.pathname !== fallback.pathname || candidate.hash) return null;
      if (fallback.searchParams.has('book') && candidate.searchParams.get('book') !== book.id) return null;
      candidate.searchParams.set('resume','1'); return candidate.href;
    } catch { return null; }
  }
  try {
    const memory = JSON.parse(localStorage.getItem('lumyriel-reading-progress-v1') || '{}');
    const book = catalog.find(b => b.id === memory.last), saved = book && memory[book.id];
    const url = book && safeResume(saved,book);
    if(url && $('readingResume')) {
      $('resumeTitle').textContent = book.title;
      $('resumeLabel').textContent = saved.label || book.edition;
      $('resumeLink').href = url; $('readingResume').hidden = false;
    }
  } catch { /* Storage unavailable: normal reading links remain available. */ }

  if ($('bookSearch')) {
    const cards = [...document.querySelectorAll('[data-book]')];
    const buttons = [...document.querySelectorAll('[data-book-filter]')];
    const wanted = new URLSearchParams(location.search).get('category');
    let category = ['canon','derived'].includes(wanted) ? wanted : 'all';
    function filterBooks() {
      const query = normalize($('bookSearch').value), status = $('bookStatus').value;
      let count = 0;
      for (const card of cards) {
        const show = (category === 'all' || category === card.dataset.category) && (status === 'all' || status === card.dataset.status) && normalize(card.dataset.search).includes(query);
        card.hidden = !show; if(show) count++;
      }
      document.querySelectorAll('[data-book-group]').forEach(group => {group.hidden = ![...group.querySelectorAll('[data-book]')].some(card => !card.hidden);});
      buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.bookFilter === category)));
      $('bookCount').textContent = count + (count === 1 ? ' obra encontrada' : ' obras encontradas');
      $('bookEmpty').hidden = count !== 0;
    }
    $('bookSearch').addEventListener('input',filterBooks);
    $('bookStatus').addEventListener('change',filterBooks);
    buttons.forEach(button => button.addEventListener('click', () => {
      category = button.dataset.bookFilter;
      const url = new URL(location.href);
      if(category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category',category);
      history.replaceState(null,'',url); filterBooks();
    }));
    filterBooks();
  }

  if ($('visualGallery')) {
    const cards = [...document.querySelectorAll('[data-art]')], dialog = $('artDialog');
    let filtered = cards, limit = 24, index = 0, trigger = null;
    const category = $('artCategory'), search = $('artSearch');
    const queryCategory = new URLSearchParams(location.search).get('category');
    if([...category.options].some(o => o.value === queryCategory)) category.value = queryCategory;
    function filterArt(reset = true) {
      if(reset) limit = 24;
      const query = normalize(search.value);
      filtered = cards.filter(card => (category.value === 'all' || card.dataset.category === category.value) && normalize(card.dataset.title).includes(query));
      const visible = new Set(filtered.slice(0,limit));
      cards.forEach(card => {card.hidden = !visible.has(card);});
      $('artCount').textContent = filtered.length ? `${Math.min(limit,filtered.length)} de ${filtered.length} artes` : 'Nenhuma arte encontrada';
      $('artEmpty').hidden = filtered.length !== 0;
      $('artMore').hidden = limit >= filtered.length;
    }
    search.addEventListener('input',()=>filterArt());
    category.addEventListener('change',()=>filterArt());
    $('artMore').addEventListener('click',()=>{limit += 24; filterArt(false);});
    function showArt(next) {
      index = (next + filtered.length) % filtered.length;
      const card = filtered[index];
      $('artFull').src = card.dataset.full;
      $('artFull').alt = card.querySelector('img').alt;
      $('artDialogTitle').textContent = card.dataset.title;
      $('artPosition').textContent = `${index+1} / ${filtered.length}`;
    }
    $('visualGallery').addEventListener('click',event=>{
      const card = event.target.closest('[data-art]');
      if(!card || typeof dialog.showModal !== 'function') return;
      event.preventDefault(); trigger = card; showArt(filtered.indexOf(card)); dialog.showModal(); document.body.style.overflow = 'hidden'; $('artClose').focus();
    });
    $('artPrev').addEventListener('click',()=>showArt(index-1));
    $('artNext').addEventListener('click',()=>showArt(index+1));
    $('artClose').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',event=>{if(event.key === 'ArrowLeft') showArt(index-1); if(event.key === 'ArrowRight') showArt(index+1);});
    dialog.addEventListener('close',()=>{document.body.style.overflow = ''; $('artFull').removeAttribute('src'); trigger?.focus();});
    filterArt();
  }
})();
