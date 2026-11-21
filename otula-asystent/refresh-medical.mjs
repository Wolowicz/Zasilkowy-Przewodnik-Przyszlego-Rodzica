import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const directory=new URL('./worker/',import.meta.url);
const modules=await Promise.all(['matching.js','discovery.mjs','medical-search.mjs','assistant.mjs'].map(name=>fs.readFile(new URL(name,directory),'utf8')));
const runtime="const cards=[],careTopics=[],sourceCache={},medicalIndex={};\n"+modules.join('\n')+'\nexport {medicalSubjects, medycynaPraktycznaSearch, canadianPaediatricSearch, medicalLiteratureSearch};';
const api=await import('data:text/javascript;base64,'+Buffer.from(runtime).toString('base64'));
const path=fileURLToPath(new URL('medical-index.json',directory));
const entries={};
const queue=api.medicalSubjects.slice();
let updated=0;
async function refresh(){
  while(queue.length){
    const [,pl,en]=queue.shift();
    const subject={pl,en:[en],maternal:/postpartum|gestational|perineal|cesarean|labor|pelvic floor|mastitis/.test(en)};
    const jobs=[api.medycynaPraktycznaSearch(subject),api.canadianPaediatricSearch(subject),api.medicalLiteratureSearch(subject)];
    const settled=await Promise.allSettled(jobs);
    const groups=settled.map(result=>result.status==='fulfilled'?result.value:[]);
    const results=[...groups.map(group=>group[0]),...groups.flatMap(group=>group.slice(1,2))].filter(Boolean);
    if(results.length){entries[pl]={checked:new Date().toISOString().slice(0,10),results};updated++;}
  }
}
await Promise.all([refresh(),refresh()]);
if(!updated)throw Error('Żaden serwis nie zwrócił aktualnych wyników.');
await fs.writeFile(path+'.tmp',JSON.stringify(entries,null,2));
await fs.rename(path+'.tmp',path);
console.log('Odświeżone hasła:',updated,'/ w indeksie:',Object.keys(entries).length);
