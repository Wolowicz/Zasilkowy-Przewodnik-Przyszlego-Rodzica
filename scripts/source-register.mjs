import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(root+p,'utf8');
const guide=vm.runInNewContext(read('otula/dist/catalog.js')+';GUIDE');
const care=vm.runInNewContext(read('otula/dist/care.js')+';CARE_TOPICS');
const rows=[];
for(const [kind,items] of [['Sprawa',guide.cases],['Podręcznik',care]])for(const item of items){rows.push({type:kind,id:item.id,title:item.title,url:item.source});for(const extra of item.extraSources||[])rows.push({type:kind,id:item.id,title:extra.title||item.title,url:extra.url});}
const text='# Rejestr źródeł kart i podręcznika\n\nWygenerowano z kodu aplikacji. Jest to indeks odnośników, a nie nowe potwierdzenie aktualności treści. Data w katalogu spraw: '+guide.reviewed+'. Reguły kalkulatora i sposób weryfikacji: [REGULY-I-ZRODLA.md](REGULY-I-ZRODLA.md).\n\n| Rodzaj | Identyfikator | Temat | Źródło |\n| --- | --- | --- | --- |\n'+rows.map(r=>`| ${r.type} | \`${r.id}\` | ${String(r.title).replaceAll('|','/')} | [Otwórz](${r.url}) |`).join('\n')+'\n';
fs.writeFileSync(root+'docs/REJESTR-ZRODEL.md',text);fs.writeFileSync(root+'docs/rejestr-zrodel.json',JSON.stringify(rows,null,2)+'\n');
console.log(`${guide.cases.length} spraw, ${care.length} tematów podręcznika, ${rows.length} odnośników.`);
