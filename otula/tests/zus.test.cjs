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
console.log(checks+' autorskich przypadków kalkulatora OK');
