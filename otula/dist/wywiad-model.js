/* Stan i wyszukiwanie wywiadu. Wyłącznie dane podane przez rodzica, bez danych identyfikacyjnych PDF. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OtulaWywiadModel=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const PROFILE_KEY='otula-plan-v1',LEGACY_KEY='otula-wywiad-v1';
 const statuses=['Przygotowano','Wysłano','Do uzupełnienia','Przyznano','Odmowa'];
 const situations=[
  {id:'pregnancy',title:'Spodziewamy się dziecka',roles:['mother'],event:'pregnancy',icon:'sun',color:'peach',tags:'ciąża narodziny termin porodu'},
  {id:'birth',title:'Dziecko już jest',roles:['mother','father'],event:'birth',icon:'baby',color:'peach',tags:'urodzenie narodziny macierzyński pieniądze świadczenia'},
  {id:'hospital',title:'Wcześniak lub pobyt w szpitalu',roles:['mother','father'],event:'birth',events:['birth','adoption','foster'],patch:{hospital:'yes'},icon:'medical',color:'sky',tags:'wcześniactwo hospitalizacja pobyt szpital uzupełniający masa waga'},
  {id:'pregnancy-sick',title:'Choroba lub zwolnienie w ciąży',roles:['mother'],event:'pregnancy',patch:{pregnancySick:'yes'},icon:'heartbeat',color:'sky',tags:'chorobowe zwolnienie eZLA L4 kod B'},
  {id:'loss',title:'Straciłam ciążę lub dziecko',titles:{father:'Strata w rodzinie'},roles:['mother','father'],event:'loss',events:['loss','childDeath'],icon:'heart',color:'rose',tags:'poronienie strata ciąży martwe urodzenie śmierć zgon dziecka'},
  {id:'return-work',title:'Wracam do pracy',roles:['mother'],event:'birth',events:['birth','adoption','foster'],patch:{workDuringParental:'yes'},icon:'briefcase',color:'sage',tags:'etat praca podczas rodzicielskiego łączenie urlop powrót wychowawczy'},
  {id:'adoption-foster',title:'Adopcja lub piecza',titles:{guardian:'Przyjąłem dziecko na wychowanie'},roles:['mother','guardian'],event:'adoption',events:['adoption','foster'],icon:'family',color:'lilac',tags:'adopcja przyjęcie wychowanie piecza przysposobienie'},
  {id:'adoption',title:'Adopcja',roles:['guardian'],event:'adoption',icon:'family',color:'lilac',tags:'przysposobienie sąd adopcja'},
  {id:'foster',title:'Rodzina zastępcza niezawodowa',roles:['guardian'],event:'foster',patch:{fosterType:'nonprofessional'},icon:'heart',color:'sage',tags:'piecza rodzina zastępcza'},
  {id:'paternity',title:'Urlop ojcowski',roles:['father'],event:'birth',icon:'calendar',color:'sage',tags:'ojcowski 14 dni dwa tygodnie'},
  {id:'parental-father',title:'Rodzicielski dla taty',roles:['father'],event:'birth',icon:'family',color:'sage',tags:'9 tygodni dziewięć nieprzenoszalne rodzicielski tata'},
  {id:'transfer',title:'Przejmuję opiekę od mamy',roles:['father'],event:'transfer',icon:'family',color:'rose',tags:'przejęcie rezygnacja mamy szpital matki'},
  {id:'zus-letter',title:'Dostałam pismo z ZUS',titles:{father:'Dostałem pismo z ZUS',guardian:'Dostałem pismo z ZUS',supporter:'Pismo z ZUS'},roles:['mother','father','guardian'],icon:'mail',color:'lilac',tags:'pismo wezwanie odmowa decyzja zawiadomienie uzupełnienie odwołanie'},
  {id:'contribution-debt',title:'Zaległości składkowe',roles:[],event:'birth',events:['pregnancy','birth','adoption','foster','care','transfer','loss','childDeath'],patch:{debt:'unknown'},icon:'coin',color:'gold',tags:'dług zadłużenie składki raty spłata zaległość firma'},
  {id:'care',title:'Potrzebna opieka nad bliskim',roles:[],event:'care',icon:'family',color:'sky',tags:'opiekuńczy chore dziecko opieka zwolnienie'}
  ,{id:'mother-health',title:'Zdrowie mamy po porodzie',roles:['mother'],event:'motherHealth',icon:'heartbeat',color:'sky',tags:'depresja zdrowie połóg samopoczucie hospitalizacja mamy'}
 ];
 const normalize=s=>String(s||'').toLowerCase().replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 const synonyms=[['poronienie','strata','martwe urodzenie'],['dlug','zadluzenie','zaleglosci','skladki'],['wezwanie','pismo','uzupelnienie','odmowa'],['l4','zwolnienie','chorobowe'],['wczesniak','hospitalizacja','szpital'],['tacierzynski','ojcowski','rodzicielski']];
 function terms(query){const q=normalize(query);if(!q)return[];const hit=synonyms.filter(g=>g.some(w=>q.includes(w)));return [...new Set([q,...hit.flat()])];}
 function matches(query,text){const normalized=normalize(text);return !query||terms(query).some(t=>normalized.includes(t)||t.split(' ').every(w=>normalized.includes(w)));}
 function tiles(role,query='',extra=false){return situations.filter(s=>(query||extra||role==='supporter'||s.roles.includes(role))&&matches(query,[s.title,...Object.values(s.titles||{}),s.tags].join(' ')));}
 function library(query,cases=[]){return query?cases.filter(c=>matches(query,[c.title,c.name,c.summary,c.intro,c.id].filter(Boolean).join(' '))).slice(0,8):[];}
 function title(s,role){return s.titles?.[role]||s.title;}
 const scalar=v=>(typeof v==='string'&&v.length<=350)||(typeof v==='number'&&Number.isFinite(v));
 const recordKeys=['parent','from','to','child','gestationWeeks','birthWeight','zaZyciem','fraction','extended','alive','deathDate'];
 function cleanAnswers(input,prune=x=>x){
  const out={};for(const[k,v]of Object.entries(input||{})){if(['__proto__','constructor','prototype'].includes(k)||/pesel|name|address|email|phone|iban|nip|regon|scan/i.test(k))continue;if(scalar(v))out[k]=v;else if(k==='extraSituations'&&Array.isArray(v))out[k]=v.filter(x=>situations.some(s=>s.id===x)).slice(0,5);else if(['parentalParts','hospitalStays','childrenClinical','workPeriods','lossChildren'].includes(k)&&Array.isArray(v))out[k]=v.slice(0,100).map(r=>Object.fromEntries(Object.entries(r||{}).filter(([f,val])=>recordKeys.includes(f)&&scalar(val))));}
  const clean=prune(out)||{};if(situations.some(s=>s.id===out.situation))clean.situation=out.situation;if(out.extraSituations)clean.extraSituations=out.extraSituations;return clean;
 }
 function cleanLetter(data){return Object.fromEntries(['kind','benefit','decisionScope','deadline','owner','missingDocument','reason'].filter(k=>scalar(data?.[k])).map(k=>[k,data[k]]));}
 function cleanStatuses(input){return Object.fromEntries(Object.entries(input||{}).filter(([k,v])=>/^[a-z0-9_-]{1,80}$/.test(k)&&statuses.includes(v)));}
 function empty(){return{version:2,answers:{},statuses:{},letter:{},consent:false};}
 function sanitize(data,prune){return{version:2,answers:cleanAnswers(data?.answers,prune),statuses:cleanStatuses(data?.statuses),letter:cleanLetter(data?.letter),consent:data?.consent===true};}
 function read(storage,prune){let profile={};try{profile=JSON.parse(storage.getItem(PROFILE_KEY))||{};}catch(_){}if(profile.wywiad)return{...sanitize(profile.wywiad,prune),migrated:false};let legacy;try{legacy=JSON.parse(storage.getItem(LEGACY_KEY));}catch(_){}return legacy?.version===1?{...sanitize({answers:legacy.answers,consent:true},prune),migrated:true}:empty();}
 function write(storage,data,prune){let profile={};try{profile=JSON.parse(storage.getItem(PROFILE_KEY))||{};}catch(_){}if(!profile||typeof profile!=='object'||Array.isArray(profile))profile={};const next=sanitize({...data,consent:true},prune);storage.setItem(PROFILE_KEY,JSON.stringify({...profile,wywiad:next}));storage.removeItem(LEGACY_KEY);return next;}
 function clear(storage){let profile;try{profile=JSON.parse(storage.getItem(PROFILE_KEY));}catch(_){}if(profile&&typeof profile==='object'&&!Array.isArray(profile)){delete profile.wywiad;storage.setItem(PROFILE_KEY,JSON.stringify(profile));}storage.removeItem(LEGACY_KEY);}
 function transition(input,id,value){let a={...input};if(a[id]!==undefined&&JSON.stringify(a[id])!==JSON.stringify(value)){
  if(id==='event')a=Object.fromEntries(['role','behalf','situation','extraSituations'].filter(k=>a[k]!==undefined).map(k=>[k,a[k]]));
  else if(['role','behalf'].includes(id)){const keep=['role','event','eventDate','childDob','count','otherSurviving','lossDocument','funeralCosts','adoptionCourt','fosterType','schoolDeferred','hospital','gestationWeeks','birthWeight','hospitalFrom','hospitalUntil','hospitalMore','hospitalFrom2','hospitalUntil2','hospitalMoreThanTwo','hospitalConfirmed','zaZyciem','hospitalStays','childrenClinical'];a=Object.fromEntries(keep.filter(k=>a[k]!==undefined).map(k=>[k,a[k]]));}
  else if(id==='work'){for(const k of ['insurance','coverageVerified','baseKnown','benefitBase','debt','debtPaidDate','debtResolved','insuranceDispute','employmentEnded','coverageEnd','terminationReason','suspended','studentContract','leave','workPeriods','workDuringParental','insuranceStart','reEnrolled','resumedAfterBenefit'])delete a[k];}
 }a[id]=value;return a;}
 function choose(input,id,additional=false){const s=situations.find(x=>x.id===id);if(!s)return{answers:input};const current=situations.find(x=>x.id===input.situation);if(additional&&id!=='zus-letter'&&current&&s.event&&input.event&&!(s.events||[s.event]).includes(input.event))return{conflict:true,answers:input};let a={...input};if(!additional){if(s.event&&!(s.events||[s.event]).includes(a.event))a=transition(a,'event',s.event);a.situation=id;a.extraSituations=[];}else a.extraSituations=[...new Set([...(a.extraSituations||[]),id])].filter(x=>x!==a.situation).slice(0,5);if(additional&&s.event&&!a.event)a.event=s.event;if(s.patch)Object.assign(a,s.patch);return{answers:a};}
 return{PROFILE_KEY,LEGACY_KEY,statuses,situations,normalize,terms,matches,tiles,library,title,cleanAnswers,cleanStatuses,cleanLetter,read,write,clear,empty,sanitize,transition,choose};
});
