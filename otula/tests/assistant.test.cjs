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
context.messages=[{role:'user',content:'Fikcyjne pytanie'}];
const request=vm.runInContext('assistantRequest("google/gemini-2.5-flash-lite",messages,sources)',context);
assert.equal(request.response_format.type,'json_schema');assert.equal(request.response_format.json_schema.strict,true);assert.equal(request.provider.require_parameters,true);assert.equal(request.max_tokens,2400);assert.equal(request.stream,false);
assert.equal(request.response_format.json_schema.schema.additionalProperties,false);assert.equal(request.response_format.json_schema.schema.properties.facts.items.additionalProperties,false);
function completion(content,finish='stop',extra={}){
  context.payload={choices:[{finish_reason:finish,message:{content}}],...extra};
  return vm.runInContext('assistantCompletion(payload,sources)',context);
}
const valid=JSON.stringify({facts:[{text:' Odpowiedź: „tak”, z cytatem "źródło". ',ref:1,line:2}]});
let answer=completion(valid);assert.equal(answer.issue,undefined);assert.equal(answer.facts[0].quote,'Fragment drugi');assert.equal(answer.facts[0].text,'Odpowiedź: „tak”, z cytatem "źródło".');
assert.equal(completion('{"facts":[').issue,'invalid_json');
answer=completion('{"facts":[{"text":"PRIVATE_SENTINEL','length',{usage:{completion_tokens:2400}});assert.equal(answer.issue,'truncated');assert.equal(answer.diagnostic.completion_tokens,2400);assert.ok(!JSON.stringify(answer).includes('PRIVATE_SENTINEL'));
assert.equal(completion(valid,'length').issue,'truncated','even syntactically valid output with a length finish must not become an answer');
assert.equal(completion(valid,'content_filter').issue,'incomplete');assert.equal(completion(valid,'provider_echo_PRIVATE_SENTINEL').diagnostic.finish_reason,'unknown');
assert.equal(completion('```json\n'+valid+'\n```').issue,'invalid_json','strict output is not repaired');
assert.equal(completion(JSON.stringify({facts:[{text:'A',ref:1,line:99}]})).issue,'invalid_citations');
assert.equal(completion(JSON.stringify({facts:[{text:'A',ref:2,line:1}]})).issue,'invalid_citations');
assert.equal(completion(JSON.stringify({facts:[{text:'A',ref:1,line:1,quote:'invented'}]})).issue,'invalid_schema');
assert.equal(completion(JSON.stringify({facts:[{text:'x'.repeat(851),ref:1,line:1}]})).issue,'invalid_citations');
assert.equal(completion('{"facts":[],"extra":true}').issue,'invalid_schema');
assert.equal(completion('{"facts":[]}').facts.length,0);assert.equal(completion('').issue,'empty_content');
assert.equal(completion(valid,'stop',{error:{message:'PRIVATE_SENTINEL'}}).issue,'provider_error');
console.log('Asystent: ścisły schemat JSON, ucięcie odpowiedzi, bezpieczna diagnostyka, referencje i konfiguracja modeli OK. To nie jest ocena zgodności znaczenia odpowiedzi ze źródłem.');
