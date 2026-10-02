/* Dossiê, impressão/PDF e limpeza de mensagens técnicas. */
(function(){
  'use strict';
  function boot(){
    if(!document.getElementById('creatorForm')||typeof window.renderDossier!=='function') return setTimeout(boot,40);
    if(window.__LUMYRIEL_EXPORT_V2__) return;
    window.__LUMYRIEL_EXPORT_V2__=true;

    var $=function(id){return document.getElementById(id)};
    var esc=window.escapeHtml||function(s){return String(s||'')};
    var style=document.createElement('style');
    style.textContent='.technical-status-hidden{display:none!important}.character-preview-dossier{margin:0 0 16px}.character-preview-dossier .character-preview-frame{max-width:340px;min-height:390px;margin:auto}@media print{@page{size:A4;margin:12mm}body{background:#fff!important;color:#211d17!important}.skip-link,header,.hero,.steps,footer,.nav-actions,.toolbar,.notice,.nojs{display:none!important}.creator{display:block!important;padding:0!important}.workspace{display:block!important}.panel{display:none!important}.panel[data-panel="8"]{display:block!important;position:static!important;background:#fff!important;color:#211d17!important;box-shadow:none!important;border:0!important;padding:0!important}.panel[data-panel="8"]:before{display:none!important}.panel[data-panel="8"] .panel-head{margin-bottom:14px;padding-bottom:10px}.panel[data-panel="8"] .panel-head h2,.panel[data-panel="8"] .card h3,.panel[data-panel="8"] .summary-item span{color:#211d17!important}.panel[data-panel="8"] .panel-head p,.panel[data-panel="8"] .card p,.panel[data-panel="8"] #summaryBio{color:#4b443a!important}.panel[data-panel="8"] .card,.panel[data-panel="8"] .summary-item,.panel[data-panel="8"] .info-box{background:#fff!important;box-shadow:none!important;border-color:#aaa!important;break-inside:avoid}.panel[data-panel="8"] .tag{color:#211d17!important;border-color:#888!important}.summary-grid{grid-template-columns:repeat(2,1fr)!important}.profile{grid-template-columns:.8fr 1.2fr!important}.character-preview-dossier{display:block!important;break-inside:avoid;margin:0 0 14px}.character-preview-dossier h3{margin-bottom:8px}.character-preview-dossier .character-preview-frame{display:block!important;width:250px!important;height:312px!important;min-height:312px!important;background:#efe7d8!important;box-shadow:none!important;border:1px solid #999!important;overflow:hidden!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.character-preview-dossier .character-preview-stage{display:grid!important}.character-preview-dossier .character-preview-slot,.character-preview-dossier svg{display:block!important}.character-preview-dossier .character-preview-caption{background:#fff!important;color:#211d17!important;border-color:#aaa!important}body:before{display:none!important}}';
    document.head.appendChild(style);

    var ancestry=$('ancestryMode');
    if(ancestry){
      var small=ancestry.parentElement.querySelector('small');
      if(small) small.textContent='Mutari só oferece combinações cuja descendência viável já foi demonstrada. Combinações não confirmadas ficam bloqueadas no Criador até evidência canônica futura.';
    }
    var mr=$('mutariResult');
    if(mr&&!$('parentA').value&&!$('parentB').value) mr.textContent='Escolha uma ancestralidade. O segundo progenitor mostrará apenas combinações Mutari biologicamente confirmadas.';

    var old=window.renderDossier;
    window.renderDossier=function(){
      old();
      var d=window.formData(),g=$('summaryGrid');
      function add(l,v){
        if(!v)return;
        var n=document.createElement('div');
        n.className='summary-item';
        n.innerHTML='<b>'+esc(l)+'</b><span>'+esc(window.textify?window.textify(v):v)+'</span>';
        g.appendChild(n);
      }
      var mode=window.LUMYRIEL_NAME_MODE?window.LUMYRIEL_NAME_MODE():'adapt';
      add('Modo de nome',mode==='adapt'?'Nome naturalizado para Lumyriel':(mode==='generated'?'Nome gerado em Lumyriel':'Nome real sem conversão'));
      add('Marcas e particularidades',d.markChoices);
      add('Hábitos / códigos sociais',d.customChoices);
      add('Eventos do passado',d.pastChoices);
      add('Princípios e valores',d.valueChoices);
      add('Linha moral',d.limits);
      add('Pressão sobre a linha moral',d.moralPressure);
      add('Ferramentas',d.tools);
      add('Item especial 1',d.specialItems);
      add('Item especial 2',d.specialItems2);
      add('Item especial 3',d.specialItems3);

      var previous=$('characterPreviewDossier');
      if(previous) previous.remove();
      var source=$('characterPreviewFrame');
      if(source){
        var panel=g.closest('.panel'),wrap=document.createElement('div');
        wrap.id='characterPreviewDossier';
        wrap.className='card character-preview-dossier';
        wrap.innerHTML='<h3>Retrato</h3><p>Representação visual montada a partir das escolhas da ficha.</p>';
        var clone=source.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(function(x){x.removeAttribute('id')});
        wrap.appendChild(clone);
        panel.insertBefore(wrap,g);
      }
      if(window.LumyrielCharacterPreview&&typeof window.LumyrielCharacterPreview.sanitizeVisibleEscapes==='function'){
        window.LumyrielCharacterPreview.sanitizeVisibleEscapes(g.closest('.panel'));
      }
    };

    window.printDossier=function(){
      if(typeof window.ensureBiologicalFinalization==='function'&&!window.ensureBiologicalFinalization()) return;
      var renderPromise=window.LumyrielCharacterPreview&&typeof window.LumyrielCharacterPreview.render==='function'
        ? Promise.resolve(window.LumyrielCharacterPreview.render())
        : Promise.resolve();
      renderPromise.then(function(){
        window.renderDossier();
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){setTimeout(function(){window.print()},80)});
        });
      });
    };

    var btn=$('downloadTextBtn');
    if(btn){
      btn.textContent='Imprimir / salvar em PDF';
      btn.removeAttribute('onclick');
      btn.addEventListener('click',window.printDossier);
    }

    var status=$('saveStatus');
    function clean(){
      if(!status)return;
      var t=(status.textContent||'').trim().toLowerCase();
      var tech=t.indexOf('precisa da url pública')>=0||t.indexOf('canal de submissão está preparado')>=0||t.indexOf('canal público de submissão ainda não está habilitado')>=0;
      status.hidden=tech||!t;
      status.classList.toggle('technical-status-hidden',tech||!t);
    }
    if(status){clean();new MutationObserver(clean).observe(status,{childList:true,subtree:true,characterData:true})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* Vocabulário fechado de gênero do Criador. */
(function(){
  function normalizeGender(){
    var select=document.getElementById('gender');
    if(!select)return setTimeout(normalizeGender,40);
    if(select.dataset.lumyrielGenderV2==='1')return;
    var current=select.value;
    if(current==='Homem')current='Masculino';
    if(current==='Mulher')current='Feminino';
    select.innerHTML='<option value="">Selecione</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option><option value="Não definir">Não definir</option>';
    if(['Masculino','Feminino','Outro','Não definir'].includes(current))select.value=current;
    select.dataset.lumyrielGenderV2='1';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',normalizeGender,{once:true});else normalizeGender();
})();

/* O preview visual fica em módulo separado para poder evoluir sem inflar o Criador. */
(function(){
  function loadPreview(){
    if(!document.getElementById('creatorForm')||document.querySelector('script[data-lumyriel-character-preview]'))return;
    var s=document.createElement('script');
    s.src='assets/character-preview/character-preview.js';
    s.defer=true;
    s.dataset.lumyrielCharacterPreview='1';
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadPreview,{once:true});else loadPreview();
})();