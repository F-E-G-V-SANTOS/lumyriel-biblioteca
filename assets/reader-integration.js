/* Integração comum dos leitores publicados da Biblioteca Lumyrieliana. */
(() => {
  'use strict';
  const selector=document.getElementById('bookSelector');
  if(!selector)return;

  const routes={
    filho:'reader.html?book=filho&v=0&intro=1',
    tempos:'reader.html?book=tempos&v=0&intro=1',
    magia:'reader.html?book=magia&v=0&intro=1',
    matematica:'reader.html?book=matematica&v=0&intro=1',
    biologia:'biology-reader.html?v=0&mode=intro'
  };

  if(!selector.querySelector('option[value="biologia"]')){
    const option=document.createElement('option');
    option.value='biologia';
    option.textContent='Biologia de Lumyriel';
    selector.appendChild(option);
  }

  if(!selector.querySelector('option[value="matematica"]')){
    const option=document.createElement('option');
    option.value='matematica';
    option.textContent='Matemática e Física de Lumyriel';
    selector.appendChild(option);
  }

  /* A capa lateral não pode depender do momento em que o leitor terminou de
     decodificar o livro. Ela é resolvida diretamente pela rota atual. */
  const currentBook=location.pathname.endsWith('biology-reader.html')
    ? 'biologia'
    : (new URLSearchParams(location.search).get('book')||'filho');
  const cover=(window.LUMYRIEL_COVERS||{})[currentBook];
  const sideCover=document.getElementById('sideCover');
  if(sideCover&&cover){
    sideCover.style.setProperty('background-image',`url("${cover}?v=20261003-1")`,'important');
    sideCover.style.setProperty('background-size','cover','important');
    sideCover.style.setProperty('background-position','center','important');
    sideCover.style.setProperty('background-repeat','no-repeat','important');
  }

  selector.value=currentBook;
  selector.addEventListener('change',event=>{
    const target=routes[event.target.value];
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href=target;
  },true);
})();
