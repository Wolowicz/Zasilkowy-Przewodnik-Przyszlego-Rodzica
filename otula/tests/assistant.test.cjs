const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../otula-asystent/worker/assistant.mjs'),'utf8');
const context={cards:[],careTopics:[],URL,Map,Set};vm.createContext(context);
vm.runInContext(source.slice(0,source.indexOf('const norm =')),context);
context.sources=[{lines:['Fragment pierwszy','Fragment drugi']}];
function facts(value){context.input=value;return vm.runInContext('citationFacts(input,sources)',context);}
assert.equal(facts([{ref:1,line:2,text:' Odpowiedź '}])[0].quote,'Fragment drugi');
assert.equal(facts([{ref:1,line:2,text:' Odpowiedź '}])[0].text,'Odpowiedź');
for(const input of [null,{},[{ref:0,line:1,text:'A'}],[{ref:2,line:1,text:'A'}],[{ref:1,line:3,text:'A'}],[{ref:1,line:1,text:''}],[{ref:1,line:1,text:'x'.repeat(851)}],Array(5).fill({ref:1,line:1,text:'A'})])assert.equal(facts(input),null);
context.env={};assert.equal(vm.runInContext('assistantModels(env)[0]',context),'openrouter/free');
context.env={OPENROUTER_MODEL:'provider/model',OPENROUTER_FALLBACK_MODEL:'provider/model'};assert.equal(vm.runInContext('assistantModels(env).length',context),1);
context.env={OPENROUTER_MODEL:'https://bad.example/?secret=yes'};assert.ok(!vm.runInContext('assistantModels(env).includes(env.OPENROUTER_MODEL)',context));
console.log('Asystent: referencje, długość odpowiedzi i konfiguracja modeli OK. To nie jest ocena zgodności znaczenia odpowiedzi ze źródłem.');
