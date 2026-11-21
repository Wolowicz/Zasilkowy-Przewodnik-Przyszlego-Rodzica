async function readSearch(endpoint, accept, limit) {
  const control=new AbortController();
  const timer=setTimeout(()=>control.abort(),7500);
  try{
    const response=await fetch(endpoint.href,{redirect:'manual',headers:{Accept:accept},signal:control.signal});
    if(!response.ok || !response.body || !response.headers.get('content-type')?.toLowerCase().includes(accept))throw Error('Search HTTP '+response.status);
    return await limitedText(response,limit);
  }finally{clearTimeout(timer);}
}

async function govSearch(query) {
  const endpoint=new URL('https://www.gov.pl/api/data/search');
  endpoint.searchParams.set('query',query);
  const data=JSON.parse(await readSearch(endpoint,'application/json',350000));
  if(!Array.isArray(data.results))throw Error('Unknown government search response');
  return data.results.slice(0,16).map(item=>officialResult(endpoint.origin,item?.url,item?.title,item?.intro)).filter(Boolean);
}

async function patientSearch(query) {
  const endpoint=new URL('https://pacjent.gov.pl/wyszukiwarka');
  endpoint.searchParams.set('szukaj',query);
  const html=await readSearch(endpoint,'text/html',550000);
  const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if(!main)throw Error('Unknown patient search response');
  const titles=[...main.matchAll(/<h2\b[^>]*>\s*<span\b[^>]*>\s*<a\b[^>]*?\shref=(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>\s*<\/span>\s*<\/h2>/gi)].slice(0,16);
  if(!titles.length && !/brak wyników dla szukanej frazy/i.test(main))throw Error('Unknown patient search results');
  return titles.map((match,i)=>{
    const next=main.slice(match.index+match[0].length,titles[i+1]?.index);
    const snippet=next.match(/<div\b[^>]*class=["'][^"']*field--search-api-excerpt[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
    return officialResult(endpoint.origin,match[2],match[3],snippet);
  }).filter(Boolean);
}

async function discoverOfficial(question) {
  const query=officialQuery(question);
  if(!query)return {results:[],available:true,query};
  const sources=await Promise.allSettled([govSearch(query),patientSearch(query)]);
  const results=rankedOfficialResults(query,sources.filter(s=>s.status==='fulfilled').map(s=>s.value));
  // An empty list is conclusive only if both official searches responded.
  return {results,available:results.length>0||sources.every(source=>source.status==='fulfilled'),query};
}
