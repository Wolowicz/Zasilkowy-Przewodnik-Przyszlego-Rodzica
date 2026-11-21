// Adapter wyłącznie do pracy lokalnej. Nie jest serwerem produkcyjnym.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../otula/dist/',import.meta.url));
const workerRoot=new URL('../otula-asystent/worker/',import.meta.url);
const port=Number(process.env.OTULA_PORT||4173);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('OTULA_PORT: wymagany port 1024–65535');
const origin=`http://127.0.0.1:${port}`;
const names=['cards','care','source-cache','medical-index'];
const vars=['cards','careTopics','sourceCache','medicalIndex'];
const data=await Promise.all(names.map(async(n,i)=>`const ${vars[i]}=${await fs.readFile(new URL(n+'.json',workerRoot),'utf8')};`));
const modules=await Promise.all(['matching.js','discovery.mjs','medical-search.mjs','assistant.mjs'].map(n=>fs.readFile(new URL(n,workerRoot),'utf8')));
// Lokalny origin dodajemy wyłącznie do instancji w pamięci; produkcyjna lista pozostaje bez zmian.
const worker=(await import('data:text/javascript;base64,'+Buffer.from([...data,...modules,`origins.add(${JSON.stringify(origin)});`].join('\n')).toString('base64'))).default;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.pdf':'application/pdf','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  const send=(status,text)=>{res.writeHead(status,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});res.end(text);};
  try{
    if(req.headers.host!==`127.0.0.1:${port}`)return send(403,'Otwórz adres 127.0.0.1 podany w terminalu.');
    const url=new URL(req.url,origin);
    if(url.pathname==='/ask'){
      if(req.headers.origin!==origin)return send(403,'Niedozwolone źródło żądania.');
      if(!['POST','OPTIONS'].includes(req.method))return send(405,'Dozwolone POST i OPTIONS.');
      const chunks=[];let size=0;
      for await(const chunk of req){size+=chunk.length;if(size>4096)return send(413,'Pytanie jest zbyt długie.');chunks.push(chunk);}
      const headers={'Origin':origin,'Content-Type':req.headers['content-type']||''};
      const request=new Request(origin+'/ask',{method:req.method,headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
      const result=await worker.fetch(request,{OPENROUTER_API_KEY:process.env.OPENROUTER_API_KEY||''});
      res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
    }
    if(!['GET','HEAD'].includes(req.method))return send(405,'Dozwolone GET i HEAD.');
    const pathname=decodeURIComponent(url.pathname);
    if(pathname.includes('\\')||pathname.includes('\0'))return send(400,'Niepoprawna ścieżka.');
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    const real=await fs.realpath(file);
    if(!real.startsWith(root)||!types[path.extname(real)])return send(404,'Brak pliku.');
    let body=await fs.readFile(real);
    if(path.basename(real)==='family.js')body=Buffer.from(body.toString('utf8').replace('https://otula-pytania-rodzicow.etherealdaffodil4.chatgpt.site/ask','/ask'));
    res.writeHead(200,{'content-type':types[path.extname(real)],'cache-control':'no-store','x-content-type-options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{send(404,'Nie udało się otworzyć zasobu.');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Otula: ${origin}\nKlucz AI: ${process.env.OPENROUTER_API_KEY?'ustawiony po stronie serwera':'brak — działa tryb źródeł'}\nZatrzymaj: Ctrl+C`));
