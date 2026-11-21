// Public searches receive subject headings, without the family's free-form question.
const medicalSubjects = [
  [/ulewa|refluks|regurgit/, 'ulewanie', 'reflux'],
  [/czkaw(?:k|ce)|czka po/, 'czkawka', 'hiccups'],
  [/ciemnozielon|zielon\w* (?:kup|stol)/, 'zielony stolec', 'green stool'],
  [/\bkol(?:k|ce\b|ek\b|ik)/, 'kolka niemowlęca', 'colic'],
  [/zapar|wyprozn/, 'zaparcie', 'constipation'],
  [/biegun(?:k|ce)|rozwoln/, 'biegunka', 'diarrhea'],
  [/wymiot/, 'wymioty', 'vomiting'],
  [/stolc|stolec|kupk|kupie|kupe|kupa/, 'stolec niemowlęcia', 'stool'],
  [/alerg|uczul/, 'alergia', 'allergy'],
  [/orzesz|orzech|arachid/, 'orzeszki ziemne', 'peanut'],
  [/wysyp/, 'wysypka', 'rash'],
  [/wyprysk|atopow|egzem/, 'wyprysk atopowy', 'eczema'],
  [/ciemieniuch/, 'ciemieniucha', 'cradle cap'],
  [/pieluszkow|odparze/, 'pieluszkowe zapalenie skóry', 'diaper rash'],
  [/potowk/, 'potówki', 'heat rash'],
  [/zabkow|pierwsz\w* zab/, 'ząbkowanie', 'teething'],
  [/goracz|(?:zmierz|mierz|wysok)\w* temperatur|temperatur\w* ciala|ma temperatur/, 'gorączka', 'fever'],
  [/gryp[ayę]|grypie/, 'grypa', 'influenza'],
  [/osp[ayę]|ospie/, 'ospa wietrzna', 'chickenpox'],
  [/rotawirus/, 'rotawirus', 'rotavirus'],
  [/\brsv\b|oskrzelik/, 'zapalenie oskrzelików', 'bronchiolitis'],
  [/krztusiec|krztusc/, 'krztusiec', 'pertussis'],
  [/\b(?:odra|odry|odre|odrze)\b/, 'odra', 'measles'],
  [/zapalen\w* (?:ucha|uszu)/, 'zapalenie ucha', 'otitis'],
  [/bol\w* (?:ucho|ucha|uszu)|ucho boli/, 'ból ucha', 'ear pain'],
  [/spojowk|ropiej\w* ocz/, 'zapalenie spojówek', 'conjunctivitis'],
  [/miod\w*\b/, 'miód niemowlę', 'infant botulism'],
  [/szczep|szczepi/, 'szczepienia ochronne', 'vaccination'],
  [/kaszel|kaszl/, 'kaszel', 'cough'],
  [/katar|zatkan\w* nos/, 'katar', 'common cold'],
  [/odwodn/, 'odwodnienie', 'dehydration'],
  [/zoltacz/, 'żółtaczka noworodków', 'jaundice'],
  [/pepk|pepek|pepow/, 'pępek noworodka', 'umbilical cord'],
  [/przepukl/, 'przepuklina', 'hernia'],
  [/ciemiacz/, 'ciemiączko', 'fontanelle'],
  [/bioder|biodr|dysplazj/, 'dysplazja stawów biodrowych', 'hip dysplasia'],
  [/plesniawk/, 'pleśniawki', 'oral thrush'],
  [/asymetr|kr[eę]cz/, 'kręcz szyi', 'torticollis'],
  [/plaska glow|splaszcz\w* glow/, 'spłaszczenie głowy', 'plagiocephaly'],
  [/zadlaw|zakrztus/, 'zadławienie', 'choking'],
  [/zelaz|anemi|niedokrw/, 'niedobór żelaza', 'iron deficiency'],
  [/rozszerz\w* diet|stal\w* pokarm|pierwsz\w* posil/, 'rozszerzanie diety', 'complementary feeding'],
  [/butelk|mleko modyfik|mieszank/, 'mleko modyfikowane', 'infant formula'],
  [/laktac|karm\w* piers|brodawk|odciag\w* (?:mlek|pokarm)/, 'karmienie piersią', 'breastfeeding'],
  [/zapaleni\w* piers/, 'zapalenie piersi', 'mastitis'],
  [/bezpieczn\w* sen|sids|lozecz|do snu|usyp|zasyp/, 'sen niemowlęcia', 'infant sleep'],
  [/smoczk|smoczek/, 'smoczek', 'pacifier'],
  [/slon[cń]|krem\w* z filtrem/, 'ochrona przed słońcem', 'sun protection'],
  [/oparze|oparzyl/, 'oparzenie', 'burns'],
  [/uraz glow|upadek|spadl\w* z |upadl\w* na /, 'uraz głowy', 'head injury'],
  [/drgawk/, 'drgawki', 'seizures'],
  [/sluch/, 'słuch niemowlęcia', 'hearing'],
  [/wzrok|zez\b/, 'wzrok niemowlęcia', 'vision'],
  [/wczesni|skorygowan/, 'wcześniak', 'preterm'],
  [/mow[ayę]|gaworz/, 'rozwój mowy', 'language development'],
  [/depresj|baby blues/, 'depresja poporodowa', 'postpartum depression'],
  [/cukrzyc\w* ciaz/, 'cukrzyca ciążowa', 'gestational diabetes'],
  [/naci\w* krocz|peknieci\w* krocz|krocz/, 'krocze po porodzie', 'perineal trauma'],
  [/cesarsk/, 'cięcie cesarskie', 'cesarean'],
  [/indukcj|wywol\w* porod/, 'indukcja porodu', 'induction of labor'],
  [/krwawi\w* po porod|odchod\w* polog/, 'krwawienie po porodzie', 'postpartum bleeding'],
  [/dna miednic|dno miednic/, 'dno miednicy', 'pelvic floor'],
  [/skor\w* do skor/, 'kontakt skóra do skóry', 'skin to skin']
];

function medicalSearchTerms(question, topics) {
  const normalized=norm(question);
  const subjects=medicalSubjects.filter(([pattern])=>pattern.test(normalized)).slice(0,2);
  if(subjects.length)return {pl:subjects.map(s=>s[1]).join(' '), en:subjects.map(s=>s[2]), maternal:/po porod|polog|w ciazy|ciazow|porodow|cesarsk|indukcj|krocz|miednic|laktac/.test(normalized)};
  const topic=topics.length===1?topics[0]:topics.length && matchingCare(question,topics)[0];
  if(topic?.keywords?.length)return {pl:topic.keywords[0],en:[],maternal:topic.section==='mother'||topic.section==='before'};
  return null;
}

function medicalText(value, length=250) {
  return searchPlain(value,length).replace(/\s+/g,' ').trim();
}

function relevantPolishTitle(title, subject) {
  const words=norm(subject.pl).split(/\s+/).filter(w=>w.length>=3&&!/^(?:niemowl|dziec|ciaz|porodz|pielegn|noworod)/.test(w));
  const text=norm(title);
  if(/swiatowy tydzien|promuje |kampani| w metrze|konferencj|konkurs|co \d+ sekund/.test(text))return false;
  if(subject.pl==='gorączka' && /reumatycz|trzydniow|krwotoczn/.test(text))return false;
  return !words.length || words.some(word=>text.includes(word.slice(0,Math.min(5,Math.max(3,word.length-1)))));
}

async function medycynaPraktycznaSearch(subject) {
  const endpoint=new URL('https://www.mp.pl/pacjent/szukaj/');
  endpoint.searchParams.set('q',subject.pl);
  const html=await readSearch(endpoint,'text/html',750000);
  const found=[];
  // The patient portal embeds its public search data as JSON in a React Flight stream.
  for(const script of html.matchAll(/<script\b[^>]*>self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)\s*;?\s*<\/script>/g)){
    let rows;
    try{rows=JSON.parse(script[1])[1].split('\n');}catch{continue;}
    for(const row of rows){
      if(!row.includes('"ArticleHit"'))continue;
      let hits;
      try{hits=JSON.parse(row.slice(row.indexOf(':')+1))?.[3]?.results?.hits;}catch{continue;}
      if(!Array.isArray(hits))continue;
      for(const hit of hits){
        if(hit?.__typename!=='ArticleHit'||!/^\d{1,10}$/.test(hit._id))continue;
        const section=String(hit.site?.url||'');
        const relevant=subject.maternal?/^https:\/\/www\.mp\.pl\/pacjent\/(?:ciaza|ginekologia|pediatria|cukrzyca)\//:/^https:\/\/www\.mp\.pl\/pacjent\/pediatria\//;
        if(!relevant.test(section))continue;
        const title=medicalText(hit.title,210);
        if(!title||!relevantPolishTitle(title,subject))continue;
        // The "brief" on a Q&A is often the patient's question. Use the article itself for evidence.
        found.push({title,url:'https://www.mp.pl/artykuly/'+hit._id,snippet:'Medycyna Praktyczna · '+medicalText(hit.site?.breadcrumb||'Poradnik pacjenta',90)});
      }
    }
  }
  return found.slice(0,4);
}

async function canadianPaediatricSearch(subject) {
  if(!subject.en.length || subject.maternal)return [];
  const payload=btoa(JSON.stringify({result_page:'search/results',keywords:subject.en.join(' ')})).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
  const endpoint=new URL('https://caringforkids.cps.ca/search/results/'+payload);
  const html=await readSearch(endpoint,'text/html',450000);
  const found=[];
  const links=html.matchAll(/<h2\b[^>]*>\s*<a\b[^>]*?\shref=["'](\/handouts\/[\w-]+\/[\w-]+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h2>/gi);
  for(const match of links){
    const title=medicalText(match[2],210);
    const rest=html.slice(match.index+match[0].length,match.index+match[0].length+1200);
    const excerpt=rest.match(/^\s*<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1]||'';
    const topicText=norm(title+' '+excerpt);
    if(!subject.en.every(term=>term.split(' ').every(word=>topicText.includes(word))))continue;
    if(/shortage|recall|parenting news/i.test(title))continue;
    found.push({title,url:new URL(match[1],endpoint.origin).href,snippet:'Canadian Paediatric Society · poradnik dla rodzin (ang.)'});
  }
  const titleScore=result=>subject.en.filter(term=>norm(result.title).includes(term)).length;
  return found.sort((a,b)=>titleScore(b)-titleScore(a)).slice(0,3);
}

async function europePmcRecords(query, size, details=false) {
  const endpoint=new URL('https://www.ebi.ac.uk/europepmc/webservices/rest/search');
  endpoint.search=new URLSearchParams({query,format:'json',pageSize:String(size),resultType:details?'core':'lite'});
  const data=JSON.parse(await readSearch(endpoint,'application/json',320000));
  if(!Array.isArray(data?.resultList?.result))throw Error('Nieczytelna odpowiedź Europe PMC');
  return data.resultList.result;
}

async function medicalLiteratureSearch(subject) {
  if(!subject.en.length)return [];
  const audience=subject.maternal?'(postpartum OR maternal OR pregnancy OR labour)':'(infant OR newborn OR neonatal OR pediatric OR paediatric)';
  const topics=subject.en.map(term=>'TITLE:"'+term+'"').join(' AND ');
  const year=new Date().getUTCFullYear();
  const query=topics+' AND TITLE_ABS:'+audience+' AND SRC:MED AND HAS_ABSTRACT:Y AND (PUB_TYPE:"Practice Guideline" OR PUB_TYPE:"Guideline" OR PUB_TYPE:"Systematic Review") AND NOT PUB_TYPE:"Retracted Publication" AND NOT TITLE:protocol AND FIRST_PDATE:['+(year-10)+'-01-01 TO '+year+'-12-31]';
  const candidates=await europePmcRecords(query,12);
  const matches=candidates.filter(p=>subject.maternal || !/maternal|intrapartum|during pregnancy|pregnant women|antenatal/i.test(p.title));
  const broadAudience=subject.maternal?/maternal|postpartum|pregnan|labor|labour/i:/newborn|infan|neonat|babies/i;
  const score=p=>Number(broadAudience.test(p.title))*4+Number(/guideline|recommendation|guidance/i.test(p.title))*2;
  matches.sort((a,b)=>score(b)-score(a));
  return matches.filter(p=>p.source==='MED'&&/^\d+$/.test(p.id)&&p.title && !/with (?:human immunodeficiency|hiv|cancer|sickle cell)|neutropenic|chemotherapy|trial protocol/i.test(p.title)).slice(0,4).map(p=>({
    title:medicalText(p.title,230),url:'https://pubmed.ncbi.nlm.nih.gov/'+p.id+'/',
    snippet:[medicalText(p.journalTitle||'',100),p.pubYear,'Publikacja medyczna indeksowana w PubMed'].filter(Boolean).join(' · ')
  }));
}

async function medicalSearch(question, topics=[]) {
  const subject=medicalSearchTerms(question,topics);
  if(!subject)return [];
  const settled=await Promise.allSettled([medycynaPraktycznaSearch(subject),canadianPaediatricSearch(subject),medicalLiteratureSearch(subject)]);
  const providers=['MP','CPS','Europe PMC'];
  const groups=settled.map((r,i)=>{
    if(r.status==='fulfilled')return r.value;
    console.warn('Wyszukiwarka '+providers[i],String(r.reason?.message||'unavailable').slice(0,80));
    return [];
  });
  const results=[...groups.map(g=>g[0]),...groups.flatMap(g=>g.slice(1))].filter(Boolean);
  if(results.length)return [...new Map(results.map(r=>[r.url,r])).values()].slice(0,6);
  const cached=medicalIndex[subject.pl];
  if(!cached)return [];
  return cached.results.map(r=>({...r,snippet:r.snippet+' · Z indeksu Otuli z '+cached.checked}));
}

async function readMedicalAbstract(url) {
  const id=String(url).match(/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{1,10})\/?$/)?.[1];
  if(!id)throw Error('Niepoprawny adres publikacji');
  const records=await europePmcRecords('EXT_ID:'+id+' AND SRC:MED AND HAS_ABSTRACT:Y AND NOT PUB_TYPE:"Retracted Publication"',1,true);
  const record=records.find(r=>r.source==='MED'&&String(r.id)===id);
  if(!record?.abstractText)throw Error('Brak treści streszczenia');
  const clean=medicalText(record.abstractText.replace(/<\/(?:p|h[1-6]|div)>/gi,' '),12000);
  const title=medicalText(record.title,230);
  const sentences=clean.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map(s=>s.trim()).filter(s=>s.length>=25)||[];
  if(!sentences.length)throw Error('Brak fragmentów streszczenia');
  // Retain the concluding sentences alongside the methods and patient population.
  const lines=[...new Set([...sentences.slice(0,4),...sentences.slice(-8)])].map(s=>s.slice(0,640));
  return {title,url:'https://pubmed.ncbi.nlm.nih.gov/'+id+'/',lines,checked:new Date().toISOString()};
}
