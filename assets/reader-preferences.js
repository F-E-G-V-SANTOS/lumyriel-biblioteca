/* Shared preferences preserve the current position and never change book text. */
(() => {
  'use strict';
  const sidebar=document.getElementById('sidebar'), paper=document.getElementById('paper');
  if(!sidebar||!paper)return;
  const KEY='lumyriel-reader-preferences-v1';
  let settings={font:100,line:'1.87',theme:'sepia'};
  try{const value=JSON.parse(localStorage.getItem(KEY)||'{}');if(Number(value.font)>=90&&Number(value.font)<=140)settings.font=Number(value.font);if(['1.6','1.87','2.1'].includes(value.line))settings.line=value.line;if(['sepia','light','dark'].includes(value.theme))settings.theme=value.theme;}catch{}
  const panel=document.createElement('details');panel.className='reader-preferences';
  panel.innerHTML='<summary>Ajustar leitura</summary><label for="readingFont">Tamanho do texto <output id="readingFontValue"></output></label><input id="readingFont" type="range" min="90" max="140" step="5"><label for="readingLine">Espaço entre linhas</label><select id="readingLine"><option value="1.6">Compacto</option><option value="1.87">Confortável</option><option value="2.1">Amplo</option></select><label for="readingTheme">Tema</label><select id="readingTheme"><option value="sepia">Sépia</option><option value="light">Claro</option><option value="dark">Escuro</option></select>';
  const anchor=sidebar.querySelector('.edition');if(anchor)anchor.after(panel);else sidebar.prepend(panel);
  const font=panel.querySelector('#readingFont'),line=panel.querySelector('#readingLine'),theme=panel.querySelector('#readingTheme'),output=panel.querySelector('output');
  function apply(save=false){const max=paper.scrollHeight-paper.clientHeight,ratio=max>0?paper.scrollTop/max:0;paper.style.setProperty('--reader-font',`${1.09*settings.font/100}rem`);paper.style.setProperty('--reader-line',settings.line);document.body.dataset.readerTheme=settings.theme;font.value=settings.font;line.value=settings.line;theme.value=settings.theme;output.value=settings.font+'%';if(save){try{localStorage.setItem(KEY,JSON.stringify(settings))}catch{}requestAnimationFrame(()=>{paper.scrollTop=ratio*Math.max(0,paper.scrollHeight-paper.clientHeight);window.dispatchEvent(new Event('resize'));});}}
  font.addEventListener('input',()=>{settings.font=Number(font.value);apply(true);});line.addEventListener('change',()=>{settings.line=line.value;apply(true);});theme.addEventListener('change',()=>{settings.theme=theme.value;apply(true);});apply();
})();
