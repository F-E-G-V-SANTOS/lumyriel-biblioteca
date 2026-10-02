/* Preview visual modular do Criador de Personagens — v0.3. */
(function(){
  'use strict';
  if(window.__LUMYRIEL_CHARACTER_PREVIEW__) return;
  window.__LUMYRIEL_CHARACTER_PREVIEW__=true;

  const $=id=>document.getElementById(id);
  const form=$('creatorForm');
  if(!form) return;

  const SPRITE='assets/character-preview/sprite.svg';
  const ns='http://www.w3.org/2000/svg';
  let spriteReady=null;

  const palette={
    skin:{
      'muito clara':'#ead2b9','clara':'#dfb997','bege':'#cf9f7e','dourada':'#b9825e','oliva':'#a67858',
      'morena':'#8d5d42','castanha':'#75462f','escura':'#573422','muito escura':'#352219','cinza':'#8c8379',
      'acinzentada':'#8c8379','cobre':'#a56843','ocre':'#a57849'
    },
    hair:{
      'preto':'#211c19','carvão':'#302923','castanho escuro':'#493327','castanho médio':'#694735','castanho claro':'#8a624a',
      'loiro':'#c9a66a','dourado':'#c6a252','ruivo':'#9b482f','cobre':'#a95f3d','rosa':'#a96b78','coral':'#a86656',
      'magenta':'#82425f','violeta quente':'#704863','amarelo':'#b49b4b','azul':'#4e6579','ciano':'#5b8589',
      'azul-acinzentado':'#657988','prata':'#9c9b94','violeta frio':'#625d77','cinza':'#6e6a64','branco':'#cfc8ba','pastel':'#9f969b'
    },
    eye:{
      'castanho':'#6b482d','mel':'#9a743b','âmbar':'#b5842f','verde':'#587052','azul':'#526f8e','cinza':'#777d82',
      'violeta':'#735a93','dourado':'#b99442','vermelho':'#81463e','preto':'#211d1a','branco':'#d7d2c6','prata':'#9da4a7','ciano':'#62969d'
    }
  };

  function value(id){const el=$(id);return el?String(el.value||''):''}
  function low(v){return String(v||'').trim().toLowerCase()}
  function contains(v,re){return re.test(low(v))}
  function pickColor(v,map,fallback){const s=low(v);for(const key of Object.keys(map))if(s.includes(key))return map[key];return fallback}

  function sanitizeVisibleEscapes(root){
    const base=root||document.body;if(!base)return;
    const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT),nodes=[];let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(function(textNode){
      const parent=textNode.parentElement;
      if(!parent||/^(SCRIPT|STYLE|CODE|PRE|TEXTAREA)$/.test(parent.tagName))return;
      if(textNode.nodeValue&&textNode.nodeValue.includes('\\n'))textNode.nodeValue=textNode.nodeValue.replace(/\\n/g,' ');
    });
  }

  function loadSpriteLibrary(){
    if(document.getElementById('lumyriel-character-preview-library'))return Promise.resolve(true);
    if(spriteReady)return spriteReady;
    spriteReady=fetch(SPRITE,{cache:'force-cache'})
      .then(r=>{if(!r.ok)throw new Error('sprite '+r.status);return r.text()})
      .then(text=>{
        const parsed=new DOMParser().parseFromString(text,'image/svg+xml');
        const defs=parsed.querySelector('defs');if(!defs)throw new Error('sprite sem defs');
        const library=document.createElementNS(ns,'svg');
        library.id='lumyriel-character-preview-library';library.setAttribute('aria-hidden','true');library.setAttribute('width','0');library.setAttribute('height','0');
        library.style.position='absolute';library.style.width='0';library.style.height='0';library.style.overflow='hidden';
        library.appendChild(document.importNode(defs,true));document.body.prepend(library);return true;
      }).catch(()=>false);
    return spriteReady;
  }

  function species(){return value('ancestryMode')==='mutari'?'Mutari':(value('people')||'')}
  function skinColor(){return pickColor(value('skin'),palette.skin,'#b98463')}
  function hairColor(){return pickColor(value('hairColor'),palette.hair,'#3f3027')}
  function eyeColor(id){return pickColor(value(id),palette.eye,'#6a513a')}

  function svgUse(id,className,local){
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 800 1000');svg.setAttribute('aria-hidden','true');svg.classList.add('character-preview-layer',className);
    const use=document.createElementNS(ns,'use');use.setAttribute('href',(local?'#':SPRITE+'#')+id);svg.appendChild(use);return svg;
  }
  function makeSlot(stage,name,z){const slot=document.createElement('div');slot.className='character-preview-slot slot-'+name;slot.dataset.slot=name;slot.style.zIndex=String(z);stage.appendChild(slot);return slot}
  function setSymbol(slot,id,color,opacity,local){
    slot.replaceChildren();slot.dataset.symbol=id||'';slot.dataset.color=color||'';slot.dataset.opacity=opacity==null?'':String(opacity);
    if(!id)return;const svg=svgUse(id,'layer-'+slot.dataset.slot,local);svg.style.color=color||'#2c251d';if(opacity!=null)svg.style.opacity=String(opacity);slot.appendChild(svg);
  }

  function getHeadSymbol(){const v=[value('headShape'),value('faceShape')].join(' ');if(contains(v,/larg|quadr|robust|ampl/))return'base-wide';if(contains(v,/estreit|along|fino|triang|diamante/))return'base-narrow';return'base-oval'}
  function getEarSymbol(sp){const e=value('ears'),m=value('specialMorphology');if(contains(e,/felin/)||sp==='Felran'||contains(m,/felin/))return'ears-feline';if(contains(e,/lupin/)||sp==='Lupran'||contains(m,/lupin/))return'ears-lupine';if(contains(e,/along|élfic|elfic|pontiag/)||sp==='Elfo')return'ears-elf';if(contains(e,/reduz|discret/)||sp==='Nerathi')return'ears-reduced';return'ears-human'}
  function getHornSymbol(sp){const h=value('horns');if(!h||contains(h,/sem chifre/))return sp==='Valdrin'?'horns-medium':'';if(contains(h,/espiral/))return'horns-spiral';if(contains(h,/longo/))return'horns-long';if(contains(h,/curto/))return'horns-short';return'horns-medium'}
  function getEyeShape(){return contains(value('eyeShape'),/redond|amplo|grande/)?'round':'almond'}
  function getBrowSymbol(){const b=value('brows');if(contains(b,/arquead/))return'brows-arched';if(contains(b,/angul/))return'brows-angular';return'brows-straight'}
  function getNoseSymbol(){const n=value('nose');if(contains(n,/aquilin/))return'nose-aquiline';if(contains(n,/arredond|curto|largo/))return'nose-round';return'nose-straight'}
  function getMouthSymbol(){const m=value('mouth');if(contains(m,/cheio/))return'mouth-full';if(contains(m,/fino/))return'mouth-thin';return'mouth-medium'}
  function getHairSymbol(){
    const type=value('hairType'),len=value('hairLength'),style=value('hairstyle');
    if(contains(style,/tranç/))return'hair-braided';if(contains(style,/preso|coque|rabo/))return'hair-tied';
    if(contains(type,/cachead|crespo|encaracol/)||contains(style,/cachead|crespo|volume/))return'hair-curly';
    if(contains(len,/long|comprid/)||contains(style,/long|solto/))return'hair-long';return'hair-short';
  }
  function getGarment(){const a=value('armor');if(contains(a,/armadur|proteção|oficina|couraça|capacete/))return['garment-armor','#5b5146'];if(contains(a,/manto|capa|frio|chuva|religios/))return['garment-cloak','#4f4339'];if(contains(a,/formal|cortes|acadêm|técnic/))return['garment-tunic','#65513f'];return['garment-tunic','#58493c']}
  function selectedSpecials(){return['specialItems','specialItems2','specialItems3'].map(value).filter(Boolean).join(' | ')}
  function getAccessory(){const s=selectedSpecials();if(contains(s,/capuz/))return['accessory-hood','#2b2722'];if(contains(s,/faixa|véu ocular/))return['accessory-veil','#4e4035'];if(contains(s,/máscara parcial/))return['accessory-mask','#3d342c'];if(contains(s,/óculos opacos|óculos escurecidos/))return['accessory-dark-glasses','#282522'];if(contains(s,/óculos comuns|lentes corretivas|monóculo|visor/))return['accessory-glasses','#42382e'];return['','']}
  function hasScar(){return!!document.querySelector('input[name="markChoices"][value="Cicatriz facial"]:checked')}
  function coherenceLabel(){try{if(typeof window.biologicalCoherenceState==='function'){const s=window.biologicalCoherenceState();return s&&s.label?s.label:''}}catch(e){}return''}

  const target=$('hairColor')?.closest('.panel')||$('people')?.closest('.panel');
  if(!target||target.querySelector('.character-preview-module'))return;

  const module=document.createElement('section');module.className='character-preview-module';
  module.innerHTML=`<div class="character-preview-copy"><div class="character-preview-kicker">RETRATO MODULAR</div><h3>Retrato do personagem</h3><p>As escolhas da ficha compõem uma ilustração em camadas. O sistema usa peças fixas, coerentes entre si, sem gerar uma imagem nova a cada alteração.</p><div class="character-preview-state" id="characterPreviewState">Escolha a espécie e a aparência para começar.</div></div><div class="character-preview-frame" id="characterPreviewFrame" role="img" aria-label="Prévia visual modular do personagem"><div class="character-preview-stage" id="characterPreviewStage"></div><div class="character-preview-caption" id="characterPreviewCaption">Retrato modular</div></div>`;
  const head=target.querySelector('.panel-head');head?head.insertAdjacentElement('afterend',module):target.prepend(module);

  const stage=$('characterPreviewStage');
  const slots={
    garment:makeSlot(stage,'garment',1),ears:makeSlot(stage,'ears',2),base:makeSlot(stage,'base',3),
    eyesL:makeSlot(stage,'eyes-left',4),eyesR:makeSlot(stage,'eyes-right',4),structure:makeSlot(stage,'structure',5),
    brows:makeSlot(stage,'brows',6),nose:makeSlot(stage,'nose',7),mouth:makeSlot(stage,'mouth',8),mark:makeSlot(stage,'mark',9),
    hair:makeSlot(stage,'hair',10),horns:makeSlot(stage,'horns',11),accessory:makeSlot(stage,'accessory',12)
  };

  const style=document.createElement('style');style.id='lumyriel-character-preview-style';style.textContent=`
    .character-preview-module{display:grid;grid-template-columns:minmax(220px,.72fr) minmax(290px,1.28fr);gap:24px;align-items:stretch;margin:0 0 28px;padding:18px;border:1px solid rgba(91,68,42,.34);background:linear-gradient(145deg,rgba(245,236,217,.58),rgba(210,191,158,.23));box-shadow:inset 0 0 40px rgba(75,52,29,.045)}
    .character-preview-copy{align-self:center;padding:8px 5px}.character-preview-kicker{font-size:.63rem;font-weight:800;letter-spacing:.2em;color:#745a38}.character-preview-copy h3{font:400 1.72rem/1.05 Georgia,serif;margin:7px 0 11px;color:#30261d}.character-preview-copy p{margin:0;color:#6a5f50;font-size:.88rem;line-height:1.58}.character-preview-state{margin-top:15px;padding-top:12px;border-top:1px solid rgba(82,61,37,.18);color:#745d3e;font-size:.78rem}
    .character-preview-frame{position:relative;min-height:440px;overflow:hidden;border:1px solid #786349;background:radial-gradient(ellipse at 50% 28%,rgba(238,222,190,.92) 0,rgba(198,173,132,.65) 48%,rgba(72,54,36,.34) 86%),linear-gradient(155deg,#d7c29e,#8f7452);box-shadow:inset 0 0 55px rgba(49,34,21,.23),0 8px 22px rgba(54,38,23,.1);isolation:isolate}
    .character-preview-frame:before{content:"";position:absolute;inset:9px;border:1px solid rgba(237,217,179,.23);box-shadow:inset 0 0 0 1px rgba(50,35,22,.12);pointer-events:none;z-index:30}.character-preview-frame:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:29;opacity:.2;background:repeating-linear-gradient(103deg,rgba(61,43,27,.035) 0 1px,transparent 1px 5px),radial-gradient(circle at 24% 17%,rgba(70,46,26,.2) 0 1px,transparent 1.6px);background-size:auto,12px 11px;mix-blend-mode:multiply}
    .character-preview-stage{position:absolute;inset:2% 0 0;display:grid;place-items:center;filter:saturate(.86) contrast(1.04)}.character-preview-slot{position:absolute;inset:0;pointer-events:none}.character-preview-layer{display:block;width:100%;height:100%;filter:drop-shadow(0 2px 1px rgba(42,28,18,.1))}.slot-structure .character-preview-layer,.slot-brows .character-preview-layer,.slot-nose .character-preview-layer,.slot-mouth .character-preview-layer{filter:none}.character-preview-caption{position:absolute;left:14px;bottom:12px;z-index:31;padding:5px 8px;background:rgba(28,23,17,.82);border:1px solid rgba(207,183,133,.42);color:#e7dac4;font:600 .66rem/1.2 Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}
    .character-preview-snapshot{display:block;width:100%;height:100%}
    @media(max-width:760px){.character-preview-module{grid-template-columns:1fr}.character-preview-frame{min-height:380px}.character-preview-copy{padding:0}.character-preview-copy h3{font-size:1.45rem}}
    @media print{.character-preview-frame,.character-preview-layer,.character-preview-snapshot{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.character-preview-frame:after{display:none}}
  `;document.head.appendChild(style);

  async function render(){
    const local=await loadSpriteLibrary(),sp=species(),garment=getGarment(),accessory=getAccessory(),ink='#4a3528';
    setSymbol(slots.garment,garment[0],garment[1],null,local);setSymbol(slots.ears,getEarSymbol(sp),skinColor(),null,local);setSymbol(slots.base,getHeadSymbol(),skinColor(),null,local);
    setSymbol(slots.eyesL,'eye-left-'+getEyeShape(),eyeColor('eyeLeft'),null,local);setSymbol(slots.eyesR,'eye-right-'+getEyeShape(),eyeColor('eyeRight'),null,local);
    setSymbol(slots.structure,'face-structure',ink,.78,local);setSymbol(slots.brows,getBrowSymbol(),ink,.9,local);setSymbol(slots.nose,getNoseSymbol(),ink,.82,local);setSymbol(slots.mouth,getMouthSymbol(),ink,.82,local);
    setSymbol(slots.mark,hasScar()?'mark-scar':'','#74483c',null,local);setSymbol(slots.hair,getHairSymbol(),hairColor(),null,local);setSymbol(slots.horns,getHornSymbol(sp),'#6d5a43',null,local);setSymbol(slots.accessory,accessory[0],accessory[1],null,local);
    const parts=[];if(sp)parts.push(sp);if(value('hairColor'))parts.push(value('hairColor'));if(value('hairLength'))parts.push(value('hairLength'));
    const state=coherenceLabel();$('characterPreviewCaption').textContent=parts.length?parts.join(' · '):'Retrato modular';$('characterPreviewState').textContent=state||(sp?'Prévia atualizada a partir das escolhas da ficha.':'Escolha a espécie e a aparência para começar.');$('characterPreviewFrame').setAttribute('aria-label','Prévia visual de '+(sp||'personagem')+(state?' — '+state:''));sanitizeVisibleEscapes(module);return true;
  }

  async function snapshot(){
    await render();await loadSpriteLibrary();
    const library=$('lumyriel-character-preview-library');if(!library)return null;
    const out=document.createElementNS(ns,'svg');out.setAttribute('viewBox','0 0 800 1000');out.setAttribute('xmlns',ns);out.setAttribute('role','img');out.setAttribute('aria-label',$('characterPreviewFrame')?.getAttribute('aria-label')||'Retrato do personagem');out.classList.add('character-preview-snapshot');
    const defs=document.createElementNS(ns,'defs'),paint=library.querySelector('#paint');if(paint)defs.appendChild(paint.cloneNode(true));out.appendChild(defs);
    Object.values(slots).forEach(function(slot){
      const id=slot.dataset.symbol;if(!id)return;const symbol=library.querySelector('#'+CSS.escape(id));if(!symbol)return;
      const g=document.createElementNS(ns,'g');if(slot.dataset.color)g.style.color=slot.dataset.color;if(slot.dataset.opacity)g.style.opacity=slot.dataset.opacity;
      Array.from(symbol.childNodes).forEach(n=>g.appendChild(n.cloneNode(true)));out.appendChild(g);
    });
    return out;
  }

  const watched=['skin','hairColor','hairType','hairLength','hairstyle','eyeLeft','eyeRight','eyeShape','people','ears','horns','armor','specialItems','specialItems2','specialItems3','headShape','faceShape','brows','nose','mouth','specialMorphology'];
  form.addEventListener('change',render);form.addEventListener('input',e=>{if(e.target&&watched.includes(e.target.id))render()});window.addEventListener('lumyriel-character-loaded',render);
  setTimeout(render,80);setTimeout(render,500);
  window.LumyrielCharacterPreview={render,snapshot,sanitizeVisibleEscapes,loadSpriteLibrary};
})();