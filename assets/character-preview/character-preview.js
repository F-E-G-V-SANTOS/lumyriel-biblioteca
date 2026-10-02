/* Preview visual modular do Criador de Personagens — v0.1. */
(function(){
  'use strict';
  if(window.__LUMYRIEL_CHARACTER_PREVIEW__) return;
  window.__LUMYRIEL_CHARACTER_PREVIEW__ = true;

  const $ = id => document.getElementById(id);
  const form = $('creatorForm');
  if(!form) return;

  const SPRITE = 'assets/character-preview/sprite.svg';
  const ns = 'http://www.w3.org/2000/svg';

  const palette = {
    skin: {
      'muito clara':'#ead2b9','clara':'#dfb997','bege':'#cf9f7e','dourada':'#b9825e','oliva':'#a67858',
      'morena':'#8d5d42','castanha':'#75462f','escura':'#573422','muito escura':'#352219','cinza':'#8c8379',
      'acinzentada':'#8c8379','cobre':'#a56843','ocre':'#a57849'
    },
    hair: {
      'preto':'#211c19','carvão':'#302923','castanho escuro':'#493327','castanho médio':'#694735','castanho claro':'#8a624a',
      'loiro':'#c9a66a','dourado':'#c6a252','ruivo':'#9b482f','cobre':'#a95f3d','rosa':'#b86f7f','coral':'#b96c5a',
      'magenta':'#8a4569','violeta quente':'#704863','amarelo':'#c0a74f','azul':'#516d86','ciano':'#5d8f92',
      'azul-acinzentado':'#657988','prata':'#a7a7a0','violeta frio':'#655f7e','cinza':'#77736c','branco':'#d7d0c3','pastel':'#aaa0a5'
    },
    eye: {
      'castanho':'#6b482d','mel':'#9a743b','âmbar':'#b5842f','verde':'#587052','azul':'#526f8e','cinza':'#777d82',
      'violeta':'#735a93','dourado':'#b99442','vermelho':'#81463e','preto':'#211d1a','branco':'#d7d2c6','prata':'#9da4a7','ciano':'#62969d'
    }
  };

  function value(id){ const el=$(id); return el ? String(el.value||'') : ''; }
  function low(v){ return String(v||'').trim().toLowerCase(); }
  function contains(v, re){ return re.test(low(v)); }

  function pickColor(value, map, fallback){
    const s=low(value);
    for(const key of Object.keys(map)) if(s.includes(key)) return map[key];
    return fallback;
  }

  function species(){
    if(value('ancestryMode')==='mutari') return 'Mutari';
    return value('people') || '';
  }

  function svgUse(id, className){
    const svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 800 1000');
    svg.setAttribute('aria-hidden','true');
    svg.classList.add('character-preview-layer',className);
    const use=document.createElementNS(ns,'use');
    use.setAttribute('href',SPRITE+'#'+id);
    svg.appendChild(use);
    return svg;
  }

  function makeSlot(stage,name,z){
    const slot=document.createElement('div');
    slot.className='character-preview-slot slot-'+name;
    slot.dataset.slot=name;
    slot.style.zIndex=String(z);
    stage.appendChild(slot);
    return slot;
  }

  function setSymbol(slot,id,color,opacity){
    slot.replaceChildren();
    if(!id) return;
    const svg=svgUse(id,'layer-'+slot.dataset.slot);
    svg.style.color=color||'#2c251d';
    if(opacity!=null) svg.style.opacity=String(opacity);
    slot.appendChild(svg);
  }

  function getHeadSymbol(){
    const v=[value('headShape'),value('faceShape')].join(' ');
    if(contains(v,/larg|quadr|robust|ampl/)) return 'base-wide';
    if(contains(v,/estreit|along|fino|triang/)) return 'base-narrow';
    return 'base-oval';
  }

  function getEarSymbol(sp){
    const e=value('ears');
    const morph=value('specialMorphology');
    if(contains(e,/felin/)||sp==='Felran'||contains(morph,/felin/)) return 'ears-feline';
    if(contains(e,/lupin/)||sp==='Lupran'||contains(morph,/lupin/)) return 'ears-lupine';
    if(contains(e,/along|élfic|elfic/)||sp==='Elfo') return 'ears-elf';
    if(contains(e,/reduz|discret/)||sp==='Nerathi') return 'ears-reduced';
    return 'ears-human';
  }

  function getHornSymbol(sp){
    const h=value('horns');
    if(!h||contains(h,/sem chifre/)) return sp==='Valdrin' ? 'horns-medium' : '';
    if(contains(h,/espiral/)) return 'horns-spiral';
    if(contains(h,/longo/)) return 'horns-long';
    if(contains(h,/curto/)) return 'horns-short';
    return 'horns-medium';
  }

  function getEyeShape(){
    const s=value('eyeShape');
    return contains(s,/redond|amplo|grande/) ? 'round' : 'almond';
  }

  function getHairSymbol(){
    const type=value('hairType'), len=value('hairLength'), style=value('hairstyle');
    if(contains(type,/cachead|crespo|encaracol/)||contains(style,/cachead|crespo|volume/)) return 'hair-curly';
    if(contains(len,/long|comprid/)||contains(style,/long|trança|solto/)) return 'hair-long';
    return 'hair-short';
  }

  function getGarment(){
    const a=value('armor');
    if(contains(a,/armadur|proteção|oficina|couraça|capacete/)) return ['garment-armor','#5f5548'];
    if(contains(a,/manto|capa|frio|chuva|religios/)) return ['garment-cloak','#55463a'];
    if(contains(a,/formal|cortes/)) return ['garment-tunic','#625040'];
    return ['garment-tunic','#58493c'];
  }

  function selectedSpecials(){
    return ['specialItems','specialItems2','specialItems3'].map(value).filter(Boolean).join(' | ');
  }

  function getAccessory(){
    const s=selectedSpecials();
    if(contains(s,/capuz/)) return ['accessory-hood','#2b2722'];
    if(contains(s,/faixa|véu ocular/)) return ['accessory-veil','#4e4035'];
    if(contains(s,/máscara parcial/)) return ['accessory-mask','#3d342c'];
    if(contains(s,/óculos opacos|óculos escurecidos/)) return ['accessory-dark-glasses','#282522'];
    if(contains(s,/óculos comuns|lentes corretivas|monóculo|visor/)) return ['accessory-glasses','#42382e'];
    return ['', ''];
  }

  function hasScar(){
    return !!document.querySelector('input[name="markChoices"][value="Cicatriz facial"]:checked');
  }

  function skinColor(){ return pickColor(value('skin'),palette.skin,'#b98463'); }
  function hairColor(){ return pickColor(value('hairColor'),palette.hair,'#3f3027'); }
  function eyeColor(id){ return pickColor(value(id),palette.eye,'#6a513a'); }

  function coherenceLabel(){
    try{
      if(typeof window.biologicalCoherenceState==='function'){
        const s=window.biologicalCoherenceState();
        return s && s.label ? s.label : '';
      }
    }catch(e){}
    return '';
  }

  const target = $('hairColor')?.closest('.panel') || $('people')?.closest('.panel');
  if(!target || target.querySelector('.character-preview-module')) return;

  const module=document.createElement('section');
  module.className='character-preview-module';
  module.innerHTML=`
    <div class="character-preview-copy">
      <div class="character-preview-kicker">PREVIEW VISUAL</div>
      <h3>Retrato do personagem</h3>
      <p>As escolhas de aparência são combinadas aqui em tempo real. O retrato usa peças visuais padronizadas e respeita as regras biológicas disponíveis no Criador.</p>
      <div class="character-preview-state" id="characterPreviewState">Escolha a espécie e a aparência para começar.</div>
    </div>
    <div class="character-preview-frame" id="characterPreviewFrame" role="img" aria-label="Prévia visual modular do personagem">
      <div class="character-preview-stage" id="characterPreviewStage"></div>
      <div class="character-preview-caption" id="characterPreviewCaption">Retrato modular</div>
    </div>`;

  const head=target.querySelector('.panel-head');
  head ? head.insertAdjacentElement('afterend',module) : target.prepend(module);

  const stage=$('characterPreviewStage');
  const slots={
    ears:makeSlot(stage,'ears',1),
    base:makeSlot(stage,'base',2),
    eyesL:makeSlot(stage,'eyes-left',3),
    eyesR:makeSlot(stage,'eyes-right',3),
    face:makeSlot(stage,'face',4),
    mark:makeSlot(stage,'mark',5),
    hair:makeSlot(stage,'hair',6),
    horns:makeSlot(stage,'horns',7),
    garment:makeSlot(stage,'garment',8),
    accessory:makeSlot(stage,'accessory',9)
  };

  const style=document.createElement('style');
  style.id='lumyriel-character-preview-style';
  style.textContent=`
    .character-preview-module{display:grid;grid-template-columns:minmax(220px,.72fr) minmax(280px,1.28fr);gap:22px;align-items:stretch;margin:0 0 28px;padding:18px;border:1px solid rgba(100,75,45,.28);background:rgba(247,239,223,.34)}
    .character-preview-copy{align-self:center;padding:6px 4px}.character-preview-kicker{font-size:.64rem;font-weight:800;letter-spacing:.19em;color:#785f3a}.character-preview-copy h3{font:400 1.7rem/1.05 Georgia,serif;margin:7px 0 10px;color:#33291e}.character-preview-copy p{margin:0;color:#6e6252;font-size:.88rem}.character-preview-state{margin-top:14px;padding-top:12px;border-top:1px solid rgba(85,63,38,.17);color:#765f40;font-size:.78rem}
    .character-preview-frame{position:relative;min-height:410px;overflow:hidden;border:1px solid #8f7957;background:radial-gradient(circle at 50% 32%,rgba(255,248,228,.72),rgba(222,207,176,.56) 48%,rgba(128,99,61,.18) 78%),repeating-linear-gradient(96deg,rgba(75,54,31,.025) 0 1px,transparent 1px 5px);box-shadow:inset 0 0 32px rgba(77,55,30,.11)}
    .character-preview-frame:before{content:"";position:absolute;inset:9px;border:1px solid rgba(92,67,39,.16);pointer-events:none;z-index:20}.character-preview-stage{position:absolute;inset:0;display:grid;place-items:center}.character-preview-slot{position:absolute;inset:0;pointer-events:none}.character-preview-layer{display:block;width:100%;height:100%}.slot-garment{z-index:1!important}.slot-ears{z-index:2!important}.slot-base{z-index:3!important}.slot-eyes-left,.slot-eyes-right{z-index:4!important}.slot-face{z-index:5!important}.slot-mark{z-index:6!important}.slot-hair{z-index:7!important}.slot-horns{z-index:8!important}.slot-accessory{z-index:9!important}.character-preview-caption{position:absolute;left:14px;bottom:12px;z-index:21;padding:5px 8px;background:rgba(28,23,17,.72);border:1px solid rgba(207,183,133,.34);color:#e7dac4;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase}
    @media(max-width:760px){.character-preview-module{grid-template-columns:1fr}.character-preview-frame{min-height:360px}.character-preview-copy{padding:0}.character-preview-copy h3{font-size:1.45rem}}
  `;
  document.head.appendChild(style);

  function render(){
    const sp=species();
    const headSymbol=getHeadSymbol();
    const ear=getEarSymbol(sp);
    const horns=getHornSymbol(sp);
    const eyeShape=getEyeShape();
    const hair=getHairSymbol();
    const garment=getGarment();
    const accessory=getAccessory();

    setSymbol(slots.garment,garment[0],garment[1]);
    setSymbol(slots.ears,ear,skinColor());
    setSymbol(slots.base,headSymbol,skinColor());
    setSymbol(slots.eyesL,'eye-left-'+eyeShape,eyeColor('eyeLeft'));
    setSymbol(slots.eyesR,'eye-right-'+eyeShape,eyeColor('eyeRight'));
    setSymbol(slots.face,'face-details','#4a3528',.8);
    setSymbol(slots.mark,hasScar()?'mark-scar':'','#74483c');
    setSymbol(slots.hair,hair,hairColor());
    setSymbol(slots.horns,horns,'#6d5a43');
    setSymbol(slots.accessory,accessory[0],accessory[1]);

    const parts=[];
    if(sp) parts.push(sp);
    if(value('hairColor')) parts.push(value('hairColor'));
    if(value('hairLength')) parts.push(value('hairLength'));
    const state=coherenceLabel();
    $('characterPreviewCaption').textContent=parts.length?parts.join(' · '):'Retrato modular';
    $('characterPreviewState').textContent=state || (sp?'Prévia atualizada a partir das escolhas da ficha.':'Escolha a espécie e a aparência para começar.');
    $('characterPreviewFrame').setAttribute('aria-label','Prévia visual de '+(sp||'personagem')+(state?' — '+state:''));
  }

  form.addEventListener('change',render);
  form.addEventListener('input',function(e){
    if(e.target && ['skin','hairColor','hairType','hairLength','hairstyle','eyeLeft','eyeRight','eyeShape','people','ears','horns','armor','specialItems','specialItems2','specialItems3'].includes(e.target.id)) render();
  });
  window.addEventListener('lumyriel-character-loaded',render);
  setTimeout(render,80);
  setTimeout(render,500);
  window.LumyrielCharacterPreview={render};
})();