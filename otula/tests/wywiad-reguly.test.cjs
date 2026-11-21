/* Synthetic, anonymous examples. These are NOT reproduced jury case records. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../dist/wywiad-reguly.js');
let checks = 0;
function test(name, run) { try {run(); checks++;} catch(error) {error.message = name + ': ' + error.message; throw error;} }
const base = Object.freeze({role:'mother',event:'birth',eventDate:'2026-01-10',count:1,hospital:'no',zaZyciem:'no',work:'employee',employmentEnded:'no',leave:'none',insurance:'yes',coverageVerified:'yes',insuranceDispute:'no',foreign:'no',multipleTitles:'no',otherInsurance:'yes',previousParental:'no',parentalWeeks:32,otherPlannedWeeks:9,parentalStart:'2026-05-30',plan:'standard',workDuringParental:'no',baseKnown:'yes',benefitBase:6000,lowBenefit:'no'});
const results = changes => engine.assess({...base,...changes});
const get = (id,changes={}) => results(changes).find(item=>item.id===id);
const ids = a => engine.questions(a).map(q=>q.id);
const business = {work:'business',suspended:'no',debt:'clear',resumedAfterBenefit:'no'};

test('ordinary mother: one child, separate maternity and parental amounts',()=>{
  assert.equal(get('maternity').estimate.total,28000);
  assert.equal(get('parental').estimate.total,31360);
  assert.equal(get('maternity').pdfContext.periods[0].to,'2026-05-29');
  assert.equal(get('parental').pdfContext.periods[0].from,'2026-05-30');
});
test('estimated future birth stays explicitly conditional',()=>{
  const x=get('birth-plan',{event:'pregnancy',eventDate:'2027-01-05',pregnancySick:'no'});
  assert.equal(x.estimate.total,28000); assert.equal(x.planned,true);
  assert.equal(x.pdfContext.planned,true); assert.match(x.period,/6 tygodni/);
  assert.equal(x.pdfContext.periods[0].from,'2027-01-05');
});
test('unknown benefit base never becomes salary or a zero amount',()=>{
  const x=get('maternity',{baseKnown:'unknown',benefitBase:6000});
  assert.equal(x.estimate,undefined); assert.match(x.missing.join(' '),/podstawę/);
});
test('unknown insurance is not a negative answer or confirmed eligibility',()=>{
  const x=get('maternity',{insurance:'unknown'});
  assert.equal(x.estimate,undefined); assert.match(x.missing.join(' '),/chorobowe/);
});
test('stated insurance without confirmed dates does not justify money',()=>assert.equal(get('maternity',{coverageVerified:'unknown'}).estimate,undefined));
test('unknown Za życiem does not block ordinary maternity',()=>{
  assert.equal(get('maternity',{zaZyciem:'unknown'}).estimate.total,28000);
  assert.equal(get('parental',{zaZyciem:'unknown'}).estimate,undefined);
});
test('81.5 within 21 days, not a parental supplement of 81.5 plus 70',()=>{
  const x=get('maternity',{plan:'combined',applicationDate:'2026-01-31',firstYearParental:'yes'});
  assert.equal(x.estimate.rate,81.5); assert.equal(x.estimate.total,22820);
});
test('22nd day cannot silently use combined rate',()=>assert.equal(get('maternity',{plan:'combined',applicationDate:'2026-02-01',firstYearParental:'yes'}).estimate,undefined));
test('no day of parental in first year triggers maternity adjustment to 100',()=>{
  const x=get('maternity',{plan:'combined',applicationDate:'2026-01-20',firstYearParental:'no'});
  assert.equal(x.estimate.total,28000); assert.match(x.gain,/wyrównanie/);
});
test('contradictory first-year declaration blocks proposed parental period',()=>assert.equal(get('parental',{plan:'combined',applicationDate:'2026-01-20',firstYearParental:'yes',parentalStart:'2027-01-11'}).estimate,undefined));
test('shared pool includes previously used weeks',()=>{
  const x=get('parental',{previousParental:'yes',usedOwnWeeks:10,usedOtherWeeks:0,parentalWeeks:23});
  assert.equal(x.estimate,undefined); assert.match(x.missing.join(' '),/pulę/);
});
test('unknown second-parent usage is not zero',()=>assert.equal(get('parental',{otherPlannedWeeks:'unknown'}).estimate,undefined));
test('each parent keeps nine weeks even when the other parent is uninsured',()=>assert.equal(get('parental',{otherInsurance:'no',parentalWeeks:41,otherPlannedWeeks:0}).estimate,undefined));
test('father has distinct 9-week parental and 2-week paternal benefits',()=>{
  const a={role:'father',parentalWeeks:9,otherPlannedWeeks:32,parentalStart:'2026-02-01',paternityUsedDays:0,paternityStart:'2026-02-01'};
  assert.equal(get('parental',a).estimate.total,8820);
  assert.equal(get('paternity',a).estimate.total,2800);
  assert.equal(get('maternity',a),undefined);
});
test('father cannot schedule either leave before birth',()=>{
  const a={role:'father',parentalWeeks:9,otherPlannedWeeks:32,parentalStart:'2026-01-01',paternityUsedDays:0,paternityStart:'2026-01-01'};
  assert.equal(get('parental',a).estimate,undefined);assert.equal(get('paternity',a).estimate,undefined);
});
test('paternity must finish before first birthday',()=>assert.equal(get('paternity',{role:'father',paternityUsedDays:0,paternityStart:'2027-01-01'}).estimate,undefined));
test('parental combined with work is not mispriced as full leave',()=>assert.equal(get('parental',{workDuringParental:'yes'}).estimate,undefined));

const preterm={hospital:'yes',gestationWeeks:28,birthWeight:1400,hospitalFrom:'2026-01-10',hospitalUntil:'2026-01-20',hospitalMore:'no',hospitalConfirmed:'yes',parentalStart:'2026-06-13'};
test('preterm hospitalization adds distinct 100% period after maternity',()=>{
  const x=get('supplementary',preterm);
  assert.equal(x.estimate.total,2800);assert.equal(x.estimate.rate,100);
  assert.deepEqual(x.pdfContext.periods,[{kind:'supplementary',from:'2026-05-30',to:'2026-06-12'}]);
});
test('supplementary stays 100% under 81.5 combined maternity',()=>assert.equal(get('supplementary',{...preterm,plan:'combined',applicationDate:'2026-01-20',firstYearParental:'yes'}).estimate.rate,100));
test('overlapping transfers between hospitals count each day once',()=>{
  const h=engine.helpers.hospital({...base,...preterm,hospitalUntil:'2026-01-17',hospitalMore:'yes',hospitalFrom2:'2026-01-17',hospitalUntil2:'2026-01-24',hospitalMoreThanTwo:'no'});
  assert.equal(h.days,14);assert.equal(h.weeks,2);
});
test('unknown extra hospitalization does not yield a partial total',()=>assert.equal(get('supplementary',{...preterm,hospitalMore:'unknown'}).estimate,undefined));
test('third hospital stay requires complete input before calculation',()=>assert.equal(get('supplementary',{...preterm,hospitalMore:'yes',hospitalFrom2:'2026-01-21',hospitalUntil2:'2026-01-24',hospitalMoreThanTwo:'yes'}).estimate,undefined));
test('term newborn: a single qualifying day does not create a week',()=>{
  const x=get('supplementary',{...preterm,gestationWeeks:39,birthWeight:3200,hospitalFrom:'2026-01-15',hospitalUntil:'2026-01-15'});
  assert.equal(x.estimate,undefined);assert.match(x.amount,/Brak dodatku/);
});
test('term newborn: two days within the required window qualify',()=>assert.equal(get('supplementary',{...preterm,gestationWeeks:39,birthWeight:3200,hospitalFrom:'2026-01-15',hospitalUntil:'2026-01-16'}).estimate.total,1400));
test('confirmed certificate is needed to estimate hospital weeks',()=>assert.equal(get('supplementary',{...preterm,hospitalConfirmed:'unknown'}).estimate,undefined));
test('Za życiem expands parental pool and separates the municipal payment',()=>{
  const a={zaZyciem:'yes',parentalWeeks:56,otherPlannedWeeks:9};
  assert.equal(get('parental',a).estimate.days,392);
  assert.match(get('za-zyciem',a).period,/65 tygodni/);
  assert.match(get('za-zyciem-payment',a).amount,/4000 zł/);
  assert.equal(get('za-zyciem-payment',a).estimate,undefined);
  assert.match(get('za-zyciem-payment',a).missing.join(' '),/Gmina/);
});
test('Za życiem is not inferred just from prematurity',()=>assert.equal(get('za-zyciem-payment',preterm),undefined));

test('adopting father can use maternity on adoption; guardian needs legal route',()=>{
  const x=get('maternity',{role:'father',event:'adoption',eventDate:'2026-01-10',childDob:'2020-06-01',adoptionCourt:'yes',parentalWeeks:0});
  assert.equal(x.estimate.total,28000);
  assert.equal(get('maternity',{event:'adoption',childDob:'2020-06-01',adoptionCourt:'unknown'}).estimate,undefined);
});
test('near age-14 adoption keeps 9-week maternity minimum and 38-week pool',()=>{
  const a={event:'adoption',eventDate:'2026-01-10',childDob:'2012-02-01',adoptionCourt:'yes',parentalWeeks:29,parentalStart:'2026-03-14',otherPlannedWeeks:9};
  assert.equal(get('maternity',a).estimate.days,63);
  assert.match(get('parental',a).period,/38 tygodni/);
});
test('foster age limit differs from adoption; professional fostering is not assumed',()=>{
  assert.equal(get('maternity',{event:'foster',childDob:'2018-01-01',fosterType:'nonprofessional',schoolDeferred:'no'}).estimate,undefined);
  assert.equal(get('maternity',{event:'foster',childDob:'2020-01-01',fosterType:'professional',schoolDeferred:'no'}).estimate,undefined);
  assert.equal(get('paternity',{role:'father',event:'foster',childDob:'2020-01-01',fosterType:'nonprofessional',schoolDeferred:'no'}),undefined);
});
test('medical stillbirth document can support 56-day benefit without civil act',()=>{
  const x=get('loss',{event:'loss',lossDocument:'medical',otherSurviving:'no',funeralCosts:'no'});
  assert.equal(x.estimate.days,56);assert.equal(x.estimate.total,11200);assert.match(x.why,/zaświadczenie/);
});
test('loss with surviving sibling requires distinct period determination',()=>assert.equal(get('loss',{event:'loss',lossDocument:'medical',otherSurviving:'yes'}).estimate,undefined));
test('child death after birth is not automatically treated as 56 extra days',()=>assert.equal(get('loss',{event:'childDeath',childDob:'2025-10-10',lossDocument:'act',otherSurviving:'no'}).estimate,undefined));
test('repayment plan is not full repayment or an automatic benefit offset',()=>{
  assert.equal(get('maternity',{...business,debt:'instalments'}).estimate,undefined);
  assert.match(get('debt',{...business,debt:'instalments'}).amount,/Nie odejmujemy/);
});
test('return after maternity needs new insurance confirmation',()=>assert.equal(get('maternity',{...business,resumedAfterBenefit:'yes',reEnrolled:'no'}).estimate,undefined));
test('student service contract and suspended business are not automatic insurance',()=>{
  assert.equal(get('maternity',{work:'contract',studentContract:'yes'}).estimate,undefined);
  assert.equal(get('maternity',{...business,suspended:'yes'}).estimate,undefined);
});
test('document request is not labeled a final refusal',()=>assert.match(get('case-followup',{insuranceDispute:'yes',decisionStage:'request'}).why,/nie wydana odmowa/));
test('foreign coordination and multiple titles require individual verification',()=>{
  assert.equal(get('maternity',{foreign:'yes'}).estimate,undefined);
  assert.equal(get('maternity',{multipleTitles:'yes'}).estimate,undefined);
});
test('sickness form belongs to business or post-employment, not every employee',()=>{
  const a={event:'pregnancy',pregnancySick:'yes',sickFrom:'2026-01-01',sickTo:'2026-01-10',sickWaiting:'yes',sickLimit:'no'};
  assert.equal(get('sick',a).estimate.total,2000);
  assert.equal(get('sick',a).pdfContext.formCode,undefined);
  assert.equal(get('sick',{...a,...business}).pdfContext.formCode,'ZAS-53');
  assert.equal(get('sick',{...a,...business}).pdfContext.sickFrom,'2026-01-01');
  assert.equal(get('sick',{...a,role:'father'}),undefined);
});
test('sickness cannot be priced beyond known remaining entitlement or 270 days',()=>{
  const a={event:'pregnancy',pregnancySick:'yes',sickFrom:'2026-01-01',sickTo:'2026-01-10',sickWaiting:'yes',sickLimit:'yes'};
  assert.equal(get('sick',{...a,sickRemainingDays:3}).estimate.total,600);
  assert.match(get('sick',{...a,sickRemainingDays:3}).gain,/7 dni/);
  assert.equal(get('sick',{...a,sickRemainingDays:0}).estimate,undefined);
  assert.match(get('sick',{...a,sickRemainingDays:0}).amount,/0 zł/);
  assert.equal(get('sick',{...a,sickRemainingDays:'unknown'}).estimate,undefined);
  assert.equal(get('sick',{...a,sickLimit:'no',sickTo:'2026-12-31'}).estimate,undefined);
});
test('low benefit top-up is not an extra 1000 paid twice',()=>{
  const x=get('topup',{lowBenefit:'yes'});
  assert.equal(x.estimate,undefined);assert.match(x.amount,/nie jest to dodatkowe 1000/);
});
test('no insurance provides municipal next step rather than zero support',()=>assert.match(get('municipal',{work:'none',insurance:'no'}).amount,/1000 zł/));
test('care limit is family-wide and unknown variant does not fabricate payment',()=>{
  const x=get('care',{event:'care',careReason:'sickChild',childDob:'2025-01-01',otherCarer:'unknown',careUsedDays:'unknown'});
  assert.equal(x.estimate,undefined);assert.match(x.period,/60, 30 lub 14/);assert.ok(x.documents.some(d=>d.code==='Z-15'));
});
const sickChild={event:'care',eventDate:'2026-11-01',careUntil:'2026-11-10',careReason:'sickChild',childDob:'2022-01-01',otherCarer:'no',careUsedDays:0,careProof:'yes',carePersonal:'yes',careOnlyClaimant:'yes'};
test('confirmed care for child under 14 estimates actual 80% days',()=>{
  const x=get('care',sickChild);assert.equal(x.estimate.daily,160);assert.equal(x.estimate.days,10);assert.equal(x.estimate.total,1600);
  assert.deepEqual(x.pdfContext.periods,[{kind:'care',from:'2026-11-01',to:'2026-11-10'}]);
});
test('care cannot exceed remaining shared annual days',()=>{
  const x=get('care',{...sickChild,careUsedDays:57});assert.equal(x.estimate.total,480);assert.equal(x.estimate.days,3);assert.match(x.gain,/7 dni/);
});
test('exhausted care limit does not invent a fresh allowance per child',()=>{
  const x=get('care',{...sickChild,careUsedDays:60});assert.equal(x.estimate,undefined);assert.match(x.amount,/0 zł/);
});
test('child below two may qualify even with another household carer',()=>assert.equal(get('care',{...sickChild,childDob:'2025-01-01',otherCarer:'yes'}).estimate.total,1600));
test('older child with another carer gets daily conditional figure, not a total',()=>{
  const x=get('care',{...sickChild,otherCarer:'yes'});assert.equal(x.estimate,undefined);assert.match(x.amount,/160,00 zł/);assert.ok(x.missing.length>0);
});
test('turning 14 or crossing a year requires separate care calculation',()=>{
  assert.equal(get('care',{...sickChild,childDob:'2012-11-05'}).estimate,undefined);
  assert.equal(get('care',{...sickChild,eventDate:'2026-12-28',careUntil:'2027-01-05'}).estimate,undefined);
});
test('missing care proof or second parent taking same days blocks total',()=>{
  assert.equal(get('care',{...sickChild,careProof:'unknown'}).estimate,undefined);
  assert.equal(get('care',{...sickChild,careOnlyClaimant:'no'}).estimate,undefined);
});
test('transfer remains distinct from own nine weeks and additional care',()=>{
  const x=get('transfer',{event:'transfer',childDob:'2026-01-01',transferReason:'hospital',motherUsedWeeks:2});
  assert.match(x.missing.join(' '),/pierwszych 8 tygodniach/);assert.equal(x.estimate,undefined);
});
test('each public decision branch supplies human-owned official documents',()=>{
  for(const event of ['pregnancy','birth','adoption','foster','loss','childDeath','care','transfer']){
    const items=results({event}); assert.ok(items.length>0,event);
    for(const item of items)for(const d of item.documents){assert.ok(d.owner);assert.ok(d.text);if(d.url)assert.match(d.url,/^https:\/\/(www\.)?(zus\.pl|gov\.pl)/);}
  }
});
test('prune removes stale hospital, debt and loss data after changing situation',()=>{
  const a=engine.prune({...base,...preterm,hospital:'no',hospitalMore:'yes',hospitalMoreThanTwo:'yes',work:'employee',debt:'owing',event:'birth',lossDocument:'medical'});
  for(const key of ['birthWeight','gestationWeeks','hospitalFrom','hospitalMore','debt','lossDocument'])assert.equal(a[key],undefined,key);
});
test('editing role removes now-invalid sickness and plan answers',()=>{
  const a=engine.prune({...base,role:'father',event:'pregnancy',pregnancySick:'yes',sickFrom:'2026-01-01'});
  assert.equal(a.pregnancySick,undefined);assert.equal(a.sickFrom,undefined);assert.equal(a.plan,undefined);
});
test('invalid numeric/date skips remain unknown; dates reject browser rollover',()=>{
  assert.equal(engine.helpers.date('2026-02-30'),null);
  assert.equal(engine.helpers.date('unknown'),null);
  assert.equal(engine.helpers.addDays('2027-02-28',1),'2027-03-01');
  assert.equal(get('maternity',{count:'unknown'}).estimate,undefined);
});
test('question identity is stable and includes answered fields for editing',()=>{
  assert.ok(ids(base).includes('role'));assert.ok(ids(base).includes('eventDate'));
  assert.equal(new Set(ids(base)).size,ids(base).length);
  const q=engine.questions(base).find(x=>x.id==='zaZyciem');
  assert.deepEqual(q.options.map(x=>x.value),['yes','no','unknown']);assert.match(q.help,/nie sam wypis/);
});
test('browser integration reuses the existing calculator rounding/hospital core',()=>{
  const ctx={structuredClone,document:{addEventListener(){}},window:{addEventListener(){}},parseDate:s=>s?new Date(s+'T12:00:00'):null,today:()=>new Date('2026-11-21T12:00:00'),daysBetween:(a,b)=>Math.round((b-a)/86400000)};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/zus.js'),'utf8'),ctx);
  let calledDaily=0,calledHospital=0;
  ctx.window.zusDaily=(...a)=>{calledDaily++;return ctx.zusDaily(...a);};
  ctx.window.zusSupplementary=(...a)=>{calledHospital++;return ctx.zusSupplementary(...a);};
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/wywiad-reguly.js'),'utf8'),ctx);
  const integrated=ctx.window.OtulaWywiadReguly.assess({...base,...preterm});
  assert.ok(calledDaily>0);assert.equal(calledHospital,1);
  assert.equal(integrated.find(x=>x.id==='supplementary').estimate.total,get('supplementary',preterm).estimate.total);
});
console.log(`Wywiad rodzica: ${checks} scenariuszy — jawne braki, osobne świadczenia, daty, dokumenty i integracja obliczeń OK.`);
