(() => {
  'use strict';
  const COVER='assets/covers/construindo-mundos.webp';
  function apply(){
    let card=document.getElementById('construindo-project-card');
    if(!card)return false;
    if(card.tagName!=='A'){
      const link=document.createElement('a');
      for(const attr of card.attributes)if(attr.name!=='href')link.setAttribute(attr.name,attr.value);
      link.innerHTML=card.innerHTML;card.replaceWith(link);card=link;
    }
    card.href='construindo-reader.html?v=0&intro=1';
    card.dataset.status='live';
    card.classList.remove('live-tool');
    const cover=card.querySelector('[data-project-cover="construindo"],.cover');
    if(cover){
      cover.style.setProperty('background-image',`url("${COVER}")`,'important');
      cover.style.setProperty('background-size','cover','important');
      cover.style.setProperty('background-position','center','important');
      cover.classList.add('real-cover');cover.classList.remove('placeholder-cover');
    }
    const status=card.querySelector('.status');
    if(status){status.className='status live';status.textContent='Leitura disponível'}
    const desc=card.querySelector('.meta p');
    if(desc)desc.textContent='Coleção Integral Construindo Mundos: 14 volumes disponíveis no leitor da Biblioteca Lumyrieliana, com navegação por volumes e capítulos.';
    const bottom=card.querySelector('.bottom');
    if(bottom)bottom.innerHTML='<span>14 volumes · edição de leitura</span><span class="textlink">Ler coleção →</span>';
    return true;
  }
  if(!apply()){
    let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>30)clearInterval(timer)},100);
  }
  window.addEventListener('load',apply,{once:true});
})();