(function(){
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn()}
  ready(function(){
    const triggers=[...document.querySelectorAll('[data-support-project]')];
    if(!triggers.length)return;
    const cfg=window.LUMYRIEL_CONFIG||{};
    const enabled=cfg.supportPixEnabled===true;
    const qr=String(cfg.supportPixQrImage||'');
    const link=String(cfg.supportPixLink||'');

    const dialog=document.createElement('dialog');
    dialog.className='lumy-support-dialog';
    dialog.setAttribute('aria-labelledby','lumySupportTitle');
    dialog.innerHTML='<div class="lumy-support-inner">'+
      '<div class="lumy-support-head"><div><small>Apoie Lumyriel</small><h2 id="lumySupportTitle">Apoie o projeto</h2></div><button class="lumy-support-close" type="button" aria-label="Fechar">×</button></div>'+
      '<p class="lumy-support-copy">Se você quiser apoiar o desenvolvimento de Lumyriel, pode enviar um Pix de qualquer valor. O apoio é voluntário e não altera o acesso às obras.</p>'+
      '<div class="lumy-support-qr" id="lumySupportQr"></div>'+
      '<div class="lumy-support-link-wrap" id="lumySupportLinkWrap"></div>'+
      '<div class="lumy-support-note">Você escolhe o valor no aplicativo do banco ou na página de pagamento.</div>'+
    '</div>';
    document.body.appendChild(dialog);

    const qrBox=dialog.querySelector('#lumySupportQr');
    const linkWrap=dialog.querySelector('#lumySupportLinkWrap');
    const close=dialog.querySelector('.lumy-support-close');

    if(enabled&&qr){
      const img=document.createElement('img');
      img.src=qr;
      img.alt='QR Code Pix para apoiar o projeto Lumyriel';
      qrBox.appendChild(img);
    }else{
      qrBox.innerHTML='<div class="lumy-support-placeholder">QR Code Pix ainda não configurado.</div>';
    }

    if(enabled&&link){
      const a=document.createElement('a');
      a.className='lumy-support-link';
      a.href=link;
      a.target='_blank';
      a.rel='noopener noreferrer';
      a.textContent='Abrir página de apoio';
      linkWrap.appendChild(a);
    }

    triggers.forEach(btn=>btn.addEventListener('click',function(){
      if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    }));
    close.addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.open)dialog.close()});
  });
})();