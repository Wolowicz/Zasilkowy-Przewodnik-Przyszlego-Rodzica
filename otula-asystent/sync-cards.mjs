import fs from 'node:fs';
import vm from 'node:vm';
const catalog=fs.readFileSync('../otula/dist/catalog.js','utf8');
const cards=vm.runInNewContext(catalog+';GUIDE.cases.map(({id,title,meaning,benefit,cost,short,docs,source})=>({id,title,why:meaning,benefit,cost,short,docs,source}))');
fs.writeFileSync('worker/cards.json',JSON.stringify(cards,null,2));
const care=vm.runInNewContext(fs.readFileSync('../otula/dist/care.js','utf8')+';CARE_TOPICS');
fs.writeFileSync('worker/care.json',JSON.stringify(care,null,2));
fs.copyFileSync('../otula/dist/matching.js','worker/matching.js');
