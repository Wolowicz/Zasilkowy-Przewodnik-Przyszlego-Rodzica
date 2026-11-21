const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const context={structuredClone,document:{addEventListener(){}},window:{addEventListener(){}},
parseDate:s=>s?new Date(s+'T12:00:00'):null,today:()=>new Date('2026-11-21T12:00:00'),daysBetween:(a,b)=>Math.round((b-a)/86400000)};
vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/zus.js'),'utf8'),context);
const defaults={kind:'birth',count:1,special:false,insurance:'yes',insuranceB:'yes',baseA:5000,baseB:6000,shareA:32,fractionA:0,fractionB:0,rate:'standard',eventDate:'2026-11-01',childDob:'2026-11-01',deferred:false,payer:'employer',exception:'none',workA:'employee',workB:'employee',coverageEnd:'',debt:'clear',applicationDate:'2026-11-15'};
let checks=0;
function calc(data={}){checks++;context.input={...defaults,...data};return vm.runInContext('zusCalculation(input)',context)}
let r=calc();assert.equal(r.issues.length,0);assert.equal(r.maternity,20);assert.equal(r.parental,41);assert.equal(r.segments.length,3);assert.equal(r.segments[0].days,140);assert.equal(r.segments[1].days,224);assert.equal(r.segments[2].days,63);assert.equal(r.segments[2].daily,140);
r=calc({fractionA:.5});assert.equal(r.segments[1].days,448);assert.equal(r.segments[1].daily,58.33);
r=calc({rate:'combined'});assert.equal(r.segments[0].rate,81.5);assert.equal(r.segments[1].rate,81.5);assert.equal(r.segments[2].rate,70);
r=calc({count:2,shareA:34});assert.equal(r.maternity,31);assert.equal(r.parental,43);assert.equal(r.shareB,9);
r=calc({special:true,shareA:56});assert.equal(r.parental,65);assert.equal(r.shareB,9);
r=calc({insuranceB:'no'});assert.equal(r.unused,9);assert.equal(r.shareB,0);
for(const data of [{insurance:'no'},{insurance:'unknown'},{shareA:41},{shareA:1},{fractionA:.6},{fractionA:.5,workA:'business'},{baseA:NaN},{count:0},{rate:'combined',applicationDate:'2026-11-23'},{workA:'business',debt:'unknown'},{exception:'loss'},{kind:'adoption',childDob:'2012-11-05',eventDate:'2026-11-01'}])assert.ok(calc(data).issues.length,JSON.stringify(data));
r=calc({kind:'adoption',childDob:'2024-01-01'});assert.equal(r.issues.length,0);
r=calc({insuranceB:'unknown'});assert.ok(r.issues.some(s=>s.includes('drugiego rodzica')));assert.equal(r.total,undefined);
r=calc({multiple:true,count:1});assert.ok(r.issues.some(s=>s.includes('mnogą')));
r=calc({multiple:true,count:2,shareA:34});assert.equal(r.issues.length,0);
r=calc({baseA:0});assert.ok(r.issues.length);
r=calc({insuranceB:'no',baseB:0});assert.equal(r.issues.length,0);
r=calc({workB:'business',debtB:'unknown'});assert.ok(r.issues.some(s=>s.includes('drugiego rodzica')));
r=calc({workB:'business',debtB:'clear'});assert.equal(r.issues.length,0);
r=calc({evidenceRequired:true});assert.ok(r.issues.some(s=>s.includes('teczce')));
r=calc({evidenceRequired:true,reviewInsurance:true,reviewBasis:true,reviewDates:true});assert.equal(r.issues.length,0);assert.equal(r.total,Math.round(r.total*100)/100);
r=calc({rate:'combined',applicationDate:'2026-11-22'});assert.equal(r.issues.length,0);
r=calc({rate:'combined',applicationDate:'2026-10-31'});assert.equal(r.issues.length,0,'wniosek o 81,5% przed porodem jest dopuszczalny (art. 30a ust. 1 – tylko górna granica 21 dni)');
r=calc({rate:'combined',applicationDate:'2026-11-23'});assert.ok(r.issues.length,'22. dzień po porodzie jest po terminie');

// Synthetic father-only variants, based on public rules; no official case data.
const father={insurance:'no',insuranceB:'yes',fatherWeeks:32,baseA:0,shareA:NaN,fractionA:NaN,workA:'business',debt:'unknown',coverageEnd:'2020-01-01'};
r=calc(father);assert.equal(r.issues.length,0);assert.equal(r.fatherOnly,true);assert.equal(r.maternity,0);assert.equal(r.shareA,0);assert.equal(r.shareB,32);assert.equal(r.unused,9);assert.equal(r.segments.length,1);assert.equal(r.segments[0].days,224);assert.equal(r.segments[0].rate,70);assert.equal(r.total,31360);
r=calc({...father,fatherWeeks:9});assert.equal(r.issues.length,0);assert.equal(r.segments[0].days,63);assert.equal(r.unused,32);
r=calc({...father,fatherWeeks:1});assert.equal(r.issues.length,0);assert.equal(r.segments[0].days,7);
r=calc({...father,count:2,fatherWeeks:34});assert.equal(r.issues.length,0);assert.equal(r.parental,43);assert.equal(r.unused,9);
r=calc({...father,special:true,fatherWeeks:56});assert.equal(r.issues.length,0);assert.equal(r.parental,65);assert.equal(r.unused,9);
r=calc({...father,count:2,special:true,fatherWeeks:58});assert.equal(r.issues.length,0);assert.equal(r.parental,67);assert.equal(r.unused,9);
r=calc({...father,fractionB:.5});assert.equal(r.issues.length,0);assert.equal(r.segments[0].days,448);assert.equal(r.segments[0].daily,70);assert.equal(r.total,31360);
for(const data of [{fatherWeeks:33},{fatherWeeks:0},{fatherWeeks:1.5},{insurance:'unknown'},{insuranceB:'unknown'},{insuranceB:'no'},{baseB:0},{rate:'combined'},{kind:'adoption'},{exception:'hospital'},{eventDate:''},{workB:'business',debtB:'unknown'},{workPattern:'variable'}])assert.ok(calc({...father,...data}).issues.length,JSON.stringify(data));
r=calc({workPattern:'variable'});assert.ok(r.issues.some(s=>s.includes('odcinkami')));assert.equal(r.total,undefined);
r=calc({insurance:'no',insuranceB:'no'});assert.ok(r.issues.length);assert.equal(r.total,undefined);

// Drafts follow stable child IDs, not list positions, and never cross family profiles.
context.state={active:0,role:'mama',work:'employee',children:[{uid:'child-a',stage:'birth',date:'2026-11-01',multiple:false},{uid:'child-b',stage:'pregnancy',date:'2027-03-09',multiple:true}]};
assert.equal(vm.runInContext('zusCurrentDraft().workA',context),'employee');
context.input={...defaults,baseA:4321};vm.runInContext('zusSaveDraft(input)',context);
context.state.active=1;
assert.equal(vm.runInContext('zusCurrentDraft().count',context),0);
assert.equal(vm.runInContext('zusCurrentDraft().baseA',context),'');
context.input={...defaults,baseA:7654,count:2};vm.runInContext('zusSaveDraft(input)',context);
context.state.active=0;
assert.equal(vm.runInContext('zusCurrentDraft().baseA',context),4321);
context.state.children.reverse();context.state.active=1;
assert.equal(vm.runInContext('zusCurrentDraft().baseA',context),4321);
context.state.children[1].date='2026-11-02';
assert.equal(vm.runInContext('zusCurrentDraft().baseA',context),'');
vm.runInContext('zusResetDrafts()',context);context.state.active=0;
assert.equal(vm.runInContext('zusCurrentDraft().baseA',context),'');
context.state.role='tata';context.state.work='business';
assert.equal(vm.runInContext('zusCurrentDraft().workA',context),'any');
assert.equal(vm.runInContext('zusCurrentDraft().workB',context),'business');
console.log(checks+' autorskich przypadków kalkulatora OK');
console.log('Szkice dzieci: izolacja UID, zmiana danych rodziny, reset i rola taty OK');
