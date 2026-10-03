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
    biologia:'biology-reader.html?v=0&mode=intro',
    narrar:'narrar-reader.html?ch=0'
  };

  const options={biologia:'Biologia de Lumyriel',matematica:'Matemática e Física de Lumyriel',narrar:'Narrar Mundos Vivos'};
  Object.entries(options).forEach(([value,label])=>{
    if(selector.querySelector(`option[value="${value}"]`))return;
    const option=document.createElement('option');option.value=value;option.textContent=label;selector.appendChild(option);
  });

  const currentBook=location.pathname.endsWith('biology-reader.html')?'biologia':location.pathname.endsWith('narrar-reader.html')?'narrar':(new URLSearchParams(location.search).get('book')||'filho');
  const cover=(window.LUMYRIEL_COVERS||{})[currentBook];
  const sideCover=document.getElementById('sideCover');
  if(sideCover&&cover){sideCover.style.setProperty('background-image',`url("${cover}?v=20261003-2")`,'important');sideCover.style.setProperty('background-size','cover','important');sideCover.style.setProperty('background-position','center','important');sideCover.style.setProperty('background-repeat','no-repeat','important')}

  selector.value=currentBook;
  selector.addEventListener('change',event=>{const target=routes[event.target.value];if(!target)return;event.preventDefault();event.stopImmediatePropagation();location.href=target},true);
})();
