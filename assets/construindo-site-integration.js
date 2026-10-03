(() => {
  'use strict';
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

    // Construindo Mundos permanece no catálogo, mas não deve anunciar leitura
    // até existir uma edição efetivamente publicada no leitor do site.
    if(card.tagName==='A'){
      const article=document.createElement('article');
      for(const attr of card.attributes){
        if(attr.name!=='href') article.setAttribute(attr.name,attr.value);
      }
      article.innerHTML=card.innerHTML;
      card.replaceWith(article);
      card=article;
    }
    card.removeAttribute('href');
    card.dataset.status='dev';
    card.classList.remove('live-tool');
    applyCover(card);

    const status=card.querySelector('.status');
    if(status){status.className='status dev';status.textContent='Em desenvolvimento'}
    const desc=card.querySelector('.meta p');
    if(desc)desc.textContent='Coleção metodológica sobre construção de mundos, reunindo mundo físico, ecologia, povos, culturas, línguas, vida cotidiana e ferramentas práticas de projeto.';
    const bottom=card.querySelector('.bottom');
    if(bottom)bottom.innerHTML='<span>projeto editorial</span><span class="textlink" aria-disabled="true">Leitura ainda não publicada</span>';
    return true;
  }

  if(!apply()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(apply()||tries>30)clearInterval(timer)},100);
  }
  window.addEventListener('load',()=>{
    const card=document.getElementById('construindo-project-card');
    if(card){applyCover(card);apply()}
  },{once:true});
})();
