(()=>{
  const root=document.body;
  if(!document.getElementById('inicio'))return;
  root.classList.add('lumyriel-home');

  const hero=document.getElementById('inicio');
  if(hero&&!hero.querySelector('.home-moon')){
    const large=document.createElement('span'); large.className='home-moon large'; large.setAttribute('aria-hidden','true');
    const small=document.createElement('span'); small.className='home-moon small'; small.setAttribute('aria-hidden','true');
    hero.append(large,small);
    const cue=document.createElement('a'); cue.className='home-scroll-cue'; cue.href='#biblioteca'; cue.textContent='Role para descobrir';
    hero.appendChild(cue);
  }

  const h1=hero?.querySelector('h1'), p=hero?.querySelector('p'), eyebrow=hero?.querySelector('.eyebrow');
  if(eyebrow) eyebrow.textContent='Um mundo em construção';
  if(h1) h1.textContent='De um projeto acadêmico nasceu Lumyriel.';
  if(p) p.textContent='Uma biblioteca viva de histórias, cosmologia, magia, ciência e registros de um mundo que continua crescendo.';
  const primary=hero?.querySelector('.actions .btn.primary');
  if(primary) primary.textContent='Descobrir Lumyriel';

  const biblioteca=document.getElementById('biblioteca');
  if(biblioteca&&!biblioteca.querySelector('.home-discovery')){
    const shell=biblioteca.querySelector('.shell');
    const head=biblioteca.querySelector('.section-head');
    if(head){
      const marker=document.createElement('div'); marker.className='home-section-marker'; marker.innerHTML='<span>01</span> A biblioteca';
      head.parentNode.insertBefore(marker,head);
      const intro=document.createElement('div'); intro.className='home-discovery';
      intro.innerHTML='<div><h3>Não é apenas uma coleção de livros.<br>É a memória de um mundo.</h3></div><p>Romances, registros históricos e obras didáticas coexistem como partes diferentes da mesma construção.</p>';
      head.parentNode.insertBefore(intro,head);
    }
  }

  const markers=[
    ['destaque','02','Uma história'],
    ['criador','03','Quem vive neste mundo'],
    ['rpg-preview','04','Uma experiência futura'],
    ['artes','05','O arquivo visual'],
    ['inspiracoes','06','As raízes'],
    ['origem','07','A origem']
  ];
  markers.forEach(([id,num,label])=>{
    const sec=document.getElementById(id);
    if(!sec||sec.querySelector('.home-section-marker'))return;
    const shell=sec.querySelector('.shell');
    if(!shell)return;
    const marker=document.createElement('div'); marker.className='home-section-marker'; marker.innerHTML='<span>'+num+'</span> '+label;
    shell.insertBefore(marker,shell.firstElementChild);
  });

  const header=document.getElementById('siteHeader');
  const sync=()=>header?.classList.toggle('home-scrolled',window.scrollY>36);
  sync(); window.addEventListener('scroll',sync,{passive:true});

  hero?.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
    const target=document.querySelector(a.getAttribute('href')); target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }));
})();
