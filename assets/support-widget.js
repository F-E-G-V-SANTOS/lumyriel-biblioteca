(function(){
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn()}
  ready(function(){
    const triggers=[...document.querySelectorAll('[data-support-project]')];
    if(!triggers.length)return;
    const cfg=window.LUMYRIEL_CONFIG||{};
    const enabled=cfg.supportPixEnabled===true;
    const qr=String(cfg.supportPixQrImage||'');
    const payload=String(cfg.supportPixCopyPaste||'');
    const recipient=String(cfg.supportPixRecipient||'');

    const dialog=document.createElement('dialog');
    dialog.className='lumy-support-dialog';
    dialog.setAttribute('aria-labelledby','lumySupportTitle');
    dialog.innerHTML='<div class="lumy-support-inner">'+
      '<div class="lumy-support-head"><div><small>Apoie Lumyriel</small><h2 id="lumySupportTitle">Apoie o projeto</h2></div><button class="lumy-support-close" type="button" aria-label="Fechar">×</button></div>'+
      '<p class="lumy-support-copy">Se você quiser apoiar o desenvolvimento de Lumyriel, pode enviar um Pix de qualquer valor. O apoio é voluntário e não altera o acesso às obras.</p>'+
      '<div class="lumy-support-qr" id="lumySupportQr"></div>'+
      '<div class="lumy-support-code-wrap"><div class="lumy-support-code" id="lumySupportCode">Pix em configuração</div><button class="lumy-support-copy-btn" id="lumySupportCopyBtn" type="button" disabled>Copiar Pix</button></div>'+
      '<div class="lumy-support-status" id="lumySupportStatus" role="status" aria-live="polite"></div>'+
      '<div class="lumy-support-note" id="lumySupportNote"></div>'+
    '</div>';
    document.body.appendChild(dialog);

    const qrBox=dialog.querySelector('#lumySupportQr');
    const code=dialog.querySelector('#lumySupportCode');
    const copyBtn=dialog.querySelector('#lumySupportCopyBtn');
    const status=dialog.querySelector('#lumySupportStatus');
    const note=dialog.querySelector('#lumySupportNote');
    const close=dialog.querySelector('.lumy-support-close');

    if(enabled&&qr){
      const img=document.createElement('img');img.src=qr;img.alt='QR Code Pix para apoiar o projeto Lumyriel';qrBox.appendChild(img);
    }else{
      qrBox.innerHTML='<div class="lumy-support-placeholder">QR Code Pix ainda não configurado.<br>O botão já está preparado e será ativado assim que os dados do Pix forem publicados.</div>';
    }
    if(enabled&&payload){
      code.textContent=payload;copyBtn.disabled=false;
    }
    note.textContent=recipient?'Recebedor: '+recipient+' · O valor é escolhido por você.':'O valor é escolhido por você.';

    triggers.forEach(btn=>btn.addEventListener('click',function(){
      status.textContent='';
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    }));
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    copyBtn.addEventListener('click',async()=>{
      if(!payload)return;
      try{await navigator.clipboard.writeText(payload);status.textContent='Pix Copia e Cola copiado.'}
      catch(err){status.textContent='Não foi possível copiar automaticamente. Selecione o código manualmente.'}
    });
  });
})();