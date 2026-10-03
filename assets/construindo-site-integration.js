(() => {
  'use strict';
  const READER='construindo-reader.html?intro=1';
  const COVER='assets/covers/construindo-mundos.webp';

  function applyCover(card){
    const cover=card.querySelector('[data-project-cover="construindo"],.cover');
    if(!cover)return;
    cover.style.setProperty('background-image',`url("${COVER}")`,'important');
    cover.style.setProperty('background-size','cover','important');
    cover.style.setProperty('background-position','center','important');
    cover.style.setProperty('background-repeat','no-repeat','important');
    cover.classList.add('real-cover');
    cover.classList.remove('placeholder-cover');
  }

  function apply(){
    let card=document.getElementById('construindo-project-card');
    if(!card)return false;
    if(card.tagName!=='A'){
      const link=document.createElement('a');
      for(const attr of card.attributes) link.setAttribute(attr.name,attr.value);
      link.innerHTML=card.innerHTML;
      card.replaceWith(link);
      card=link;
    }
    card.href=READER;
    card.dataset.status='live';
    card.classList.add('live-tool');
    applyCover(card);
    const status=card.querySelector('.status');
    if(status){status.className='status live';status.textContent='Volume V disponível'}
    const desc=card.querySelector('.meta p');
    if(desc)desc.textContent='Coleção metodológica sobre construção de mundos. O Volume V — Vida Cotidiana já está disponível para leitura, com 56 capítulos organizados em 10 partes.';
    const bottom=card.querySelector('.bottom');
    if(bottom)bottom.innerHTML='<span>Volume V · Vida Cotidiana · 56 capítulos</span><span class="textlink">Abrir leitura →</span>';
    return true;
  }
  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(apply()||tries>30)clearInterval(timer)},100);
  }
  window.addEventListener('load',()=>{
    const card=document.getElementById('construindo-project-card');
    if(card)applyCover(card);
  },{once:true});
})();
