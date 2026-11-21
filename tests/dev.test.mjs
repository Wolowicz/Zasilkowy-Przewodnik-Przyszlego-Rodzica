import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
const origin='http://127.0.0.1:4179';
const child=spawn(process.execPath,[fileURLToPath(new URL('../scripts/dev.mjs',import.meta.url))],{env:{...process.env,OTULA_PORT:'4179',OPENROUTER_API_KEY:''},stdio:['ignore','pipe','pipe']});
let ready=false;
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Serwer nie wystartował')),10000);child.stdout.on('data',d=>{if(d.toString().includes(origin)){ready=true;clearTimeout(timer);resolve();}});child.on('exit',()=>{clearTimeout(timer);if(!ready)reject(Error('Serwer zakończył pracę'));});child.on('error',reject);});
  assert.equal((await fetch(origin)).status,200);
  const family=await(await fetch(origin+'/family.js')).text();
  assert.ok(family.includes("fetch('/ask'"));
  for(const file of ['/.env.local','/worker/assistant.mjs','/..%5c.env.local','/%2e%2e%2f.env.local'])assert.notEqual((await fetch(origin+file)).status,200,file);
  const request={method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify({question:'Co przygotować do becikowego?',context:'becikowe'})};
  const response=await fetch(origin+'/ask',request);assert.equal(response.status,200);const data=await response.json();assert.equal(data.mode,'guide');assert.ok(data.sources.length);
  assert.equal((await fetch(origin+'/ask',{...request,headers:{...request.headers,Origin:'https://example.com'}})).status,403);
  assert.equal((await fetch(origin+'/ask',{...request,body:JSON.stringify({question:'a'})})).status,400);
  assert.equal((await fetch(origin+'/ask',{...request,body:'x'.repeat(5000)})).status,413);
  console.log('Lokalny serwer: pliki, własne API, źródła bez klucza, CORS, limity i ochrona plików OK');
}finally{const exited=once(child,'exit');child.kill();await exited;}
