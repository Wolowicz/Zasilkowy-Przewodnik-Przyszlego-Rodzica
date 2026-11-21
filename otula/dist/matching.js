function familyWords(text){
  const clean=text.toLocaleLowerCase('pl').replaceAll('ł','l').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const forms={__proto__:null,kolce:'kolka',kolki:'kolka',kolke:'kolka',kolek:'kolka',czkawce:'czkawka',biegunce:'biegunka'};
  return (clean.match(/[a-z0-9+]+/g)||[]).map(word=>forms[word]||word).filter(w=>w.length>=3&&!['jak','czy','jest','sie','dla','mam','moge','moje','moja','mama','dziecko','dziecka','niemowle','moj','okej','warto','kiedy','ile','zrobic','przy','mnie','nie','moze','tym','tego','byc','oraz','czym','rodzica','jaka','przez','pod','chce','jakie','poznam','poznac','rozpoznac','przygotowac'].includes(w));
}

const urgentAdvice='Jeśli dorosły lub dziecko nie reaguje, nie oddycha prawidłowo, sinieje albo ma drgawki, dzwoń teraz pod 112 lub 999 w Polsce i wykonuj polecenia dyspozytora.';
function urgentQuestion(question){return /\b(nie oddycha|nie reaguje|siniej[aąe]|drgawk|sine ust|siny jezyk|traci przytomno|dusi si)/i.test(question.toLowerCase().replaceAll('ę','e').replaceAll('ą','a'));}

function matchingCare(question,topics){
 if(urgentQuestion(question)){
   const maternal=/\b(mam|mama|mamy|kobiet|zona|partnerka|polog|porodzie|ciazy)/.test(searchNorm(question))&&!/dziec|noworod|niemowl/.test(searchNorm(question));
   return topics.filter(t=>t.id===(maternal?'pilna-pomoc-dla-mamy':'pilna-pomoc'));
 }
 const words=familyWords(question);
 if(!words.length)return [];
 const ranked=topics.map(t=>{
   let score=0;
   for(const phrase of t.keywords){
     // Preserve the intent of an age/timing question even when its other terms are generic.
     if(/^kiedy\b/i.test(phrase) && !/\b(?:kiedy|wiek|wieku|miesiac|zaczac|zaczyna|czas)\b/.test(searchNorm(question)))continue;
     const tokens=familyWords(phrase);
     if(!tokens.length)continue;
     const hits=tokens.map(k=>words.includes(k)?4:words.some(w=>w.length>=5&&k.length>=5&&w.slice(0,5)===k.slice(0,5))?2:0);
     if(hits.every(Boolean))score=Math.max(score,hits.reduce((n,s)=>n+s,0));
   }
   return {t,score};
 });
 return ranked.filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,2).map(x=>x.t);
}

function searchNorm(s){return s.toLowerCase().replaceAll('ł','l').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
const searchFillers = new Set(('przy pomaga pomóc pomoc moj mojej mojemu czy co czemu dlaczego jak jaka jaki jakie jakich jakiego ktore kiedy gdzie skad ile mam mamy moje moj moja musze moge mozna prosze jest sa sie to ten ta tego na o w z u i a od do po mi nam mi tak teraz potrzebuje przygotowac uzyskac dostac zlozyc wyrobic wyrobienie zrobic otrzymac dowiedziec sprawdzic znalezc wyszukac wyglada kosztuje oznacza np ok okej normalne prawidlowa prawidlowe').split(' '));
const searchContext = new Set(['dla','dziecka','dzieci','dziecko','dziecku','niemowle','niemowlat','niemowlecia','noworodka','noworodek','rodzica','rodzicow']);

function officialQuery(question) {
  if(typeof question!=='string')return '';
  const clean=question.slice(0,480)
    .replace(/(?:https?:\/\/|www\.)\S+|\S+@\S+|<[^>]*>/gi,' ')
    .toLowerCase().normalize('NFC');
  const words=clean.match(/[\p{L}\d]+\+?/gu)||[];
  const relevant=words.filter(word=>word.length>=2 && word.length<=32 && !/^\d{5,}$/.test(word) && !searchFillers.has(searchNorm(word)));
  return [...new Set(relevant)].slice(0,7).join(' ').slice(0,100).trim();
}

function searchPlain(value, limit) {
  if(typeof value!=='string')return '';
  const entities={amp:'&',nbsp:' ',quot:'"',apos:"'",ndash:'–',mdash:'—',oacute:'ó',Oacute:'Ó',hellip:'…',bdquo:'„',rdquo:'”',ldquo:'“',lt:'<',gt:'>'};
  return value.slice(0,8000).replace(/<[^>]*>/g,' ').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(raw,key)=>{
    if(key[0]!=='#')return entities[key]??' ';
    const n=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1));
    return n>=32 && n<=0x10ffff?String.fromCodePoint(n):' ';
  }).replace(/\s+/g,' ').trim().slice(0,limit).trim();
}

function officialResult(origin, href, title, snippet) {
  if(typeof href!=='string'||!href.trim()||href.length>2048)return null;
  try{
    const url=new URL(href.replace(/&amp;/gi,'&'),origin);
    if(url.origin!==origin||url.username||url.password||url.pathname==='/')return null;
    if(origin==='https://www.gov.pl'&&!url.pathname.startsWith('/web/'))return null;
    if(origin==='https://pacjent.gov.pl' && /^\/(?:user|wyszukiwarka|redirect|api|sites)(?:\/|$)/.test(url.pathname))return null;
    const name=searchPlain(title,190);
    if(!name)return null;
    return {title:name,url:url.origin+url.pathname,snippet:searchPlain(snippet,350)};
  }catch{return null;}
}

function rankedOfficialResults(query,batches){
  const words=searchNorm(query).split(' ');
  const topic=words.filter(word=>!searchContext.has(word));
  const stems=(topic.length?topic:words).map(word=>word.slice(0,6));
  const child=words.some(word=>/^(?:dziec|niemowl|noworod)/.test(word));
  const distinct=new Map();
  for(const batch of batches){
    for(const result of batch){
      const title=searchNorm(result.title),body=searchNorm(result.snippet),full=title+' '+body;
      if(child && /osob[ay] dorosl/.test(title) && !/dziec/.test(title))continue;
      if(/klauzul[ae] informacyjn|polityk[ai] prywatnosci/.test(title) && !/prywatno|klauzul|danych osobowych/.test(query))continue;
      if(/swiatowy (?:dzien|tydzien)|konferencja|konkurs/.test(title) && !/tydzien|dzien|konferenc|konkurs/.test(searchNorm(query)))continue;
      const hits=stems.filter(stem=>full.includes(stem)).length;
      if(!hits || hits<Math.ceil(stems.length/2))continue;
      const score=hits+stems.filter(stem=>title.includes(stem)).length*3
        +Number(child && /dziec|niemowl|noworod/.test(title))*2
        +Number(result.url.startsWith('https://www.gov.pl/web/gov/'))*3
        +Number(result.url.startsWith('https://pacjent.gov.pl/'))*2;
      if(!distinct.has(result.url))distinct.set(result.url,{score,result});
    }
  }
  const results=[...distinct.values()].sort((a,b)=>b.score-a.score).slice(0,5).map(hit=>hit.result);
  return results;
}
