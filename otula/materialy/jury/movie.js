// Deterministic composition of screenshots. No reconstructed UI or simulated clicks.
const stage=document.querySelector('#stage');
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const nodes=SCENES.map((s,i)=>{
 const root=document.createElement('section');root.className='scene '+s.layout;
 const brand=document.createElement('img');brand.className='brand';brand.src=BRAND;
 const chapter=document.createElement('div');chapter.className='chapter';chapter.textContent='OTULA / '+String(i+1).padStart(2,'0');
 const head=document.createElement('h1');head.className='heading';head.textContent=s.title;
 const sub=document.createElement('p');sub.className='subtitle';sub.textContent=s.sub;
 const visual=document.createElement('div');visual.className='visual';
 const main=document.createElement('img');main.className='main';main.src=s.src;visual.append(main);
 let detail=null;if(s.detailSrc){detail=document.createElement('img');detail.className='detail';detail.src=s.detailSrc;visual.append(detail);}
 if(s.phoneSrc){const phone=document.createElement('img');phone.className='phone';phone.src=s.phoneSrc;visual.append(phone);}
 const caption=document.createElement('p');caption.className='caption';caption.textContent=s.note;
 const progress=document.createElement('div');progress.className='progress';
 root.append(brand,chapter,head,sub,visual,caption,progress);
 if(s.id==='final'){const credits=document.createElement('p');credits.className='credits';credits.textContent='Kod i materiały: wsparcie Codex i Claude. Ilustracje: ImageGen. Asystent: OpenRouter. Prototyp od 16–17 XI.';root.append(credits);}
 if(DRAFT){const mark=document.createElement('p');mark.className='draft';mark.textContent='Roboczy podgląd montażu. Część ekranów może pochodzić z wcześniejszej wersji.';root.append(mark);}
 stage.append(root);return{root,head,sub,visual,main,detail,progress};
});
window.seek=t=>{
 t=Math.max(0,Math.min(101.999,t));
 for(let i=0;i<SCENES.length;i++){
  const s=SCENES[i],n=nodes[i],local=t-s.t0,dur=s.t1-s.t0;
  const visible=local>=-.35&&local<dur;
  n.root.style.display=visible?'block':'none';if(!visible)continue;
  const fade=s.t0===0?1:smooth((local+.35)/.35);n.root.style.opacity=fade;
  const entrance=smooth((local+.18)/.65),p=clamp(local/dur);
  n.head.style.transform=`translateY(${(1-entrance)*18}px)`;
  n.sub.style.transform=`translateY(${(1-entrance)*12}px)`;
  n.head.style.opacity=entrance;n.sub.style.opacity=entrance;
  // A restrained 1.5% camera move, preserving the screenshot's aspect ratio.
  n.visual.style.transform=`scale(${1+.015*smooth(p)})`;
  if(n.detail){const k=smooth((local-3.1)/.55);n.detail.style.opacity=k;n.main.style.opacity=1-k;}
  n.progress.style.transform=`scaleX(${t/102})`;
 }
};
window.ready=Promise.all([document.fonts.ready,...Array.from(document.images).map(i=>i.decode())]).then(()=>seek(0));
window.poster=()=>seek(19);
