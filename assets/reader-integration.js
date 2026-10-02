/* Integração comum dos leitores publicados da Biblioteca Lumyrieliana. */
(() => {
  'use strict';
  const selector=document.getElementById('bookSelector');
  if(!selector)return;

  if(!selector.querySelector('option[value="biologia"]')){
    const option=document.createElement('option');
    option.value='biologia';
    option.textContent='Biologia de Lumyriel';
    selector.appendChild(option);
  }

  selector.addEventListener('change',event=>{
    if(event.target.value!=='biologia')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href='biology-reader.html?v=0&mode=intro';
  },true);
})();
