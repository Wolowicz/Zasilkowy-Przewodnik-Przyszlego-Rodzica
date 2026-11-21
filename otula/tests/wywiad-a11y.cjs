/* Numeric checks against the browser's rendered CSS. Gradient endpoints are checked conservatively. */
module.exports=async function audit(page){return page.evaluate(()=>{
 const rgb=value=>{const m=value.match(/^rgba?\(([^)]+)\)$/);return m?m[1].split(/[,\s/]+/).filter(Boolean).map(Number):null;};
 const blend=(fg,bg)=>{const a=fg[3]??1;return fg.slice(0,3).map((v,i)=>v*a+bg[i]*(1-a));};
 const luminance=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 const visible=el=>el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
 const backgrounds=el=>{const chain=[];for(let e=el;e;e=e.parentElement)chain.unshift(e);let colors=[[255,255,255]];for(const e of chain){const style=getComputedStyle(e),base=rgb(style.backgroundColor);if(base)colors=colors.map(c=>blend(base,c));const stops=(style.backgroundImage.match(/rgba?\([^)]+\)/g)||[]).map(rgb);if(stops.length)colors=stops.flatMap(stop=>colors.map(c=>blend(stop,c)));}return colors;};
 const textIssues=[],targetIssues=[];let textCount=0,targetCount=0,minRatio=Infinity,minTarget=Infinity;
 const root=document.querySelector('#app')||document.querySelector('main')||document.body;
 for(const el of root.querySelectorAll('*')){
  if(!visible(el)||el.closest('svg')||el.matches('script,style,option'))continue;
  const own=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).join(' ').trim();
  const isInput=el.matches('input:not([type=checkbox]):not([type=radio]),textarea,select');
  if((own||isInput)&&!el.matches(':disabled')){
   const style=getComputedStyle(el),fg=rgb(style.color);if(fg){const colors=backgrounds(el),r=Math.min(...colors.map(bg=>ratio(blend(fg,bg),bg)));textCount++;minRatio=Math.min(minRatio,r);if(r<4.5)textIssues.push({text:(own||el.value||el.placeholder||el.getAttribute('aria-label')||el.tagName).slice(0,90),ratio:+r.toFixed(2),color:style.color,backgrounds:colors.map(x=>x.map(Math.round)),class:el.className});}
  }
  if(el.matches('button,summary,input:not([type=hidden]),select,textarea,a.button,a.text-button,a[data-back],a.wywiad-back')&&!el.matches(':disabled')){
   let target=el;if(el.matches('input[type=checkbox],input[type=radio]'))target=el.closest('label')||el.labels?.[0]||el;
   const box=target.getBoundingClientRect();targetCount++;minTarget=Math.min(minTarget,box.width,box.height);if(box.width<43.95||box.height<43.95)targetIssues.push({text:(target.innerText||el.getAttribute('aria-label')||el.name||el.tagName).trim().slice(0,90),width:+box.width.toFixed(2),height:+box.height.toFixed(2),class:el.className});
  }
 }
 return {textCount,targetCount,minContrast:+minRatio.toFixed(2),minTarget:+minTarget.toFixed(2),textIssues,targetIssues};
});};
