/* Dossiê, impressão/PDF e limpeza de mensagens técnicas — v3. */
(function(){
  'use strict';

  function boot(){
    if(!document.getElementById('creatorForm')||typeof window.renderDossier!=='function')return setTimeout(boot,40);
    if(window.__LUMYRIEL_EXPORT_V3__)return;
    window.__LUMYRIEL_EXPORT_V3__=true;

    var $=function(id){return document.getElementById(id)};
    var esc=window.escapeHtml||function(s){return String(s||'')};
    var portraitReady=Promise.resolve();

    var style=document.createElement('style');
    style.textContent='.technical-status-hidden{display:none!important}.character-preview-dossier{margin:0 0 18px}.character-preview-dossier>p{margin-bottom:12px}.character-preview-dossier .character-preview-frame{position:relative;max-width:350px;min-height:420px;margin:auto;overflow:hidden;border:1px solid #877153;background:radial-gradient(ellipse at 50% 28%,#ead8b7 0,#c7ad83 52%,#72583e 100%);box-shadow:inset 0 0 42px rgba(57,39,24,.18)}.character-preview-dossier .character-preview-snapshot{display:block;width:100%;height:100%;min-height:420px}.character-preview-dossier .character-preview-caption{position:absolute;left:12px;bottom:10px;padding:5px 8px;background:rgba(28,23,17,.82);border:1px solid rgba(207,183,133,.42);color:#e7dac4;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase}@media print{@page{size:A4;margin:12mm}body{background:#fff!important;color:#211d17!important}.skip-link,header,.hero,.steps,footer,.nav-actions,.toolbar,.notice,.nojs{display:none!important}.creator{display:block!important;padding:0!important}.workspace{display:block!important}.panel{display:none!important}.panel[data-panel="8"]{display:block!important;position:static!important;background:#fff!important;color:#211d17!important;box-shadow:none!important;border:0!important;padding:0!important}.panel[data-panel="8"]:before{display:none!important}.panel[data-panel="8"] .panel-head{margin-bottom:14px;padding-bottom:10px}.panel[data-panel="8"] .panel-head h2,.panel[data-panel="8"] .card h3,.panel[data-panel="8"] .summary-item span{color:#211d17!important}.panel[data-panel="8"] .panel-head p,.panel[data-panel="8"] .card p,.panel[data-panel="8"] #summaryBio{color:#4b443a!important}.panel[data-panel="8"] .card,.panel[data-panel="8"] .summary-item,.panel[data-panel="8"] .info-box{background:#fff!important;box-shadow:none!important;border-color:#aaa!important;break-inside:avoid}.panel[data-panel="8"] .tag{color:#211d17!important;border-color:#888!important}.summary-grid{grid-template-columns:repeat(2,1fr)!important}.profile{grid-template-columns:.8fr 1.2fr!important}.character-preview-dossier{display:block!important;break-inside:avoid;margin:0 0 14px}.character-preview-dossier h3{margin-bottom:8px}.character-preview-dossier .character-preview-frame{display:block!important;width:248px!important;height:310px!important;min-height:310px!important;background:#e8dcc6!important;box-shadow:none!important;border:1px solid #999!important;overflow:hidden!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.character-preview-dossier .character-preview-snapshot{display:block!important;width:248px!important;height:310px!important;min-height:310px!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.character-preview-dossier .character-preview-caption{background:#fff!important;color:#211d17!important;border-color:#aaa!important}body:before{display:none!important}}';
    document.head.appendChild(style);

    function normalizeStoredGenderDraft(){
      try{
        var raw=localStorage.getItem('lumyriel-character-draft');if(!raw)return;
        var parsed=JSON.parse(raw),d=parsed.data||parsed;if(!d)return;
        if(d.gender==='Homem')d.gender='Masculino';
        if(d.gender==='Mulher')d.gender='Feminino';
        localStorage.setItem('lumyriel-character-draft',JSON.stringify(parsed));
      }catch(e){}
    }
    normalizeStoredGenderDraft();

    var ancestry=$('ancestryMode');
    if(ancestry){
      var small=ancestry.parentElement.querySelector('small');
      if(small)small.textContent='Mutari só oferece combinações cuja descendência viável já foi demonstrada. Combinações não confirmadas ficam bloqueadas no Criador até evidência canônica futura.';
    }
    var mr=$('mutariResult');
    if(mr&&$('parentA')&&!$('parentA').value&&$('parentB')&&!$('parentB').value)mr.textContent='Escolha uma ancestralidade. O segundo progenitor mostrará apenas combinações Mutari biologicamente confirmadas.';

    function attachPortrait(snapshot){
      var g=$('summaryGrid');if(!g)return;
      var panel=g.closest('.panel');if(!panel)return;
      var previous=$('characterPreviewDossier');if(previous)previous.remove();
      if(!snapshot)return;
      var wrap=document.createElement('div');wrap.id='characterPreviewDossier';wrap.className='card character-preview-dossier';
      wrap.innerHTML='<h3>Retrato</h3><p>Representação visual montada a partir das escolhas da ficha.</p>';
      var frame=document.createElement('div');frame.className='character-preview-frame';
      var safe=snapshot.cloneNode(true);safe.removeAttribute('id');safe.querySelectorAll('[id]').forEach(function(x){if(x.id!=='paint')x.removeAttribute('id')});
      frame.appendChild(safe);
      var caption=document.createElement('div');caption.className='character-preview-caption';
      var sourceCaption=$('characterPreviewCaption');caption.textContent=sourceCaption?sourceCaption.textContent:'Retrato modular';frame.appendChild(caption);
      wrap.appendChild(frame);panel.insertBefore(wrap,g);
    }

    function schedulePortrait(){
      var api=window.LumyrielCharacterPreview;
      if(!api||typeof api.snapshot!=='function'){portraitReady=Promise.resolve(null);return portraitReady}
      portraitReady=Promise.resolve(typeof api.render==='function'?api.render():null)
        .then(function(){return api.snapshot()})
        .then(function(snapshot){attachPortrait(snapshot);return snapshot})
        .catch(function(){return null});
      return portraitReady;
    }

    var old=window.renderDossier;
    window.renderDossier=function(){
      old();
      var d=window.formData(),g=$('summaryGrid');
      function add(l,v){if(!v)return;var n=document.createElement('div');n.className='summary-item';n.innerHTML='<b>'+esc(l)+'</b><span>'+esc(window.textify?window.textify(v):v)+'</span>';g.appendChild(n)}
      var mode=window.LUMYRIEL_NAME_MODE?window.LUMYRIEL_NAME_MODE():'adapt';
      add('Modo de nome',mode==='adapt'?'Nome naturalizado para Lumyriel':(mode==='generated'?'Nome gerado em Lumyriel':'Nome real sem conversão'));
      add('Marcas e particularidades',d.markChoices);add('Hábitos / códigos sociais',d.customChoices);add('Eventos do passado',d.pastChoices);add('Princípios e valores',d.valueChoices);add('Linha moral',d.limits);add('Pressão sobre a linha moral',d.moralPressure);add('Ferramentas',d.tools);add('Item especial 1',d.specialItems);add('Item especial 2',d.specialItems2);add('Item especial 3',d.specialItems3);
      schedulePortrait();
      var api=window.LumyrielCharacterPreview;if(api&&typeof api.sanitizeVisibleEscapes==='function')api.sanitizeVisibleEscapes(g.closest('.panel'));
    };

    window.printDossier=function(){
      if(typeof window.ensureBiologicalFinalization==='function'&&!window.ensureBiologicalFinalization())return;
      var api=window.LumyrielCharacterPreview;
      var first=api&&typeof api.render==='function'?Promise.resolve(api.render()):Promise.resolve();
      first.then(function(){window.renderDossier();return portraitReady}).then(function(){
        var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
        return fonts;
      }).then(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(function(){window.print()},100)})})});
    };

    var btn=$('downloadTextBtn');
    if(btn){btn.textContent='Imprimir / salvar em PDF';btn.removeAttribute('onclick');btn.addEventListener('click',window.printDossier)}

    var status=$('saveStatus');
    function clean(){if(!status)return;var t=(status.textContent||'').trim().toLowerCase();var tech=t.indexOf('precisa da url pública')>=0||t.indexOf('canal de submissão está preparado')>=0||t.indexOf('canal público de submissão ainda não está habilitado')>=0;status.hidden=tech||!t;status.classList.toggle('technical-status-hidden',tech||!t)}
    if(status){clean();new MutationObserver(clean).observe(status,{childList:true,subtree:true,characterData:true})}

    if(typeof window.randomizeCharacter==='function'&&!window.randomizeCharacter.__lumyrielGenderV2){
      var oldRandomize=window.randomizeCharacter;
      var wrappedRandomize=function(){oldRandomize();var gender=$('gender');if(gender){var choices=['Masculino','Feminino','Outro','Não definir'];gender.value=choices[Math.floor(Math.random()*choices.length)];gender.dispatchEvent(new Event('change',{bubbles:true}))}};
      wrappedRandomize.__lumyrielGenderV2=true;window.randomizeCharacter=wrappedRandomize;
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* Vocabulário fechado de gênero do Criador. */
(function(){
  function normalizeGender(){
    var select=document.getElementById('gender');if(!select)return setTimeout(normalizeGender,40);if(select.dataset.lumyrielGenderV2==='1')return;
    var current=select.value;if(current==='Homem')current='Masculino';if(current==='Mulher')current='Feminino';
    select.innerHTML='<option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option><option value="Não definir">Não definir</option>';
    if(['Masculino','Feminino','Outro','Não definir'].includes(current))select.value=current;select.dataset.lumyrielGenderV2='1';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeGender,{once:true});else normalizeGender();
})();

/* O preview visual fica em módulo separado para poder evoluir sem inflar o Criador. */
(function(){
  function loadPreview(){
    if(!document.getElementById('creatorForm')||document.querySelector('script[data-lumyriel-character-preview]'))return;
    var s=document.createElement('script');s.src='assets/character-preview/character-preview.js';s.defer=true;s.dataset.lumyrielCharacterPreview='1';
    s.addEventListener('load',function(){if(typeof window.renderDossier==='function'){var panel=document.querySelector('.panel[data-panel="8"]');if(panel&&getComputedStyle(panel).display!=='none')window.renderDossier()}},{once:true});
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadPreview,{once:true});else loadPreview();
})();