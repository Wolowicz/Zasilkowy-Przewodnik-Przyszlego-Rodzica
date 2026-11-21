const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dist=path.join(__dirname,'../dist');
const storage=new Map();
function appContext(){
  const events={},windowEvents={},timers=new Map();let nextTimer=0;
  const ctx={structuredClone,Intl,Date,URL,
    document:{addEventListener(name,fn){(events[name]??=[]).push(fn)}},
    window:{addEventListener(name,fn){(windowEvents[name]??=[]).push(fn)}},
    setTimeout(fn){timers.set(++nextTimer,fn);return nextTimer},clearTimeout(id){timers.delete(id)},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val),removeItem:key=>storage.delete(key)},
    location:{hash:'e-uslugi'},route:()=>({page:'e-uslugi',id:''}),
    render(){},main:{querySelector(){return null}},
    state:{role:'mama',work:'employee',active:0,children:[{uid:'test-child',name:'Test <b>dziecko</b>',stage:'pregnancy',date:'2027-06-15',multiple:false}]},
    parseDate:s=>s?new Date(s+'T12:00:00'):null,
    backLink:()=>'<a href="#start">Wróć</a>',icon:n=>`<i>${n}</i>`,
    esc:v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
    childLabel:()=>ctx.state.children[ctx.state.active].name,childSwitch:()=>'<select id="active-child"></select>'};
  vm.createContext(ctx);
  for(const file of ['catalog.js','zus.js','e-uslugi.js'])vm.runInContext(fs.readFileSync(path.join(dist,file),'utf8'),ctx);
  return {ctx,events,windowEvents,timers,run:s=>vm.runInContext(s,ctx)};
}
const test=appContext(),{ctx,run}=test;
run('zusSaveDraft({...zusInitial(),insurance:"yes",baseA:5555})');
let page=run('eUslugiPage({page:"e-uslugi"})');
assert.ok(page.includes('Umowa o pracę')&&page.includes('15 czerwca 2027')&&page.includes('Przewidywany termin porodu'));
assert.ok(page.includes('Tak — według Twoich danych')&&page.includes('Test &lt;b&gt;dziecko&lt;/b&gt;'));
assert.ok(!page.includes('Anna Przykładowa')&&!page.includes('data-eu="zaloguj"'));
assert.ok(page.includes('href="#sytuacja"')&&page.includes('href="#uprawnienia"'));
assert.ok(page.includes('href="https://www.zus.pl/ezus/logowanie?jezyk=pl"')&&page.includes('href="https://www.zus.pl/wzory-formularzy/zasilki"'));
assert.ok(page.includes('<details class="eu-demo-details"><summary>Pokaz przyszłych e-usług</summary>'));
// A previously opened demonstration never replaces the real center or family profile.
const before=JSON.stringify(ctx.state);
run('EU.zalogowany=true;EU.pobrane=true');
ctx.route=()=>({page:'e-uslugi',id:'dane'});
const click=a=>test.events.click.forEach(fn=>fn({target:{closest:s=>s==='[data-eu]'?{dataset:{eu:a}}:null}}));
click('do-kalkulatora');
assert.equal(run('zusCurrentDraft().baseA'),6200);
assert.equal(run('zusCurrentDraft().eventDate'),'2026-11-01');
assert.equal(run('zusCurrentDraft().reviewInsurance'),false);
assert.equal(run('zusOwnDraft().baseA'),5555);
assert.equal(JSON.stringify(ctx.state),before);
assert.ok(run('eUslugiPage({page:"e-uslugi"})').includes('Tak — według Twoich danych'));
click('wlasny');assert.equal(run('zusCurrentDraft().baseA'),5555);
// Own data survive reload. The demonstration and its documents do not.
const reloaded=appContext();assert.equal(reloaded.run('zusOwnDraft().baseA'),5555);
assert.equal(reloaded.run('EU.zalogowany'),false);
assert.equal(reloaded.run('zusCurrentEvidence().sample'),'');
// Switching fictional people resets only the demonstration, including old certificates.
run('EU.wnioski.push({typ:"zasilek"});EU.zaswiadczenie={data:"2026-11-01"}');
test.events.change.forEach(fn=>fn({target:{name:'eu-osoba',value:'firma'}}));
assert.equal(run('EU.osoba'),'firma');assert.equal(run('EU.wnioski.length'),0);assert.equal(run('EU.zaswiadczenie'),null);
assert.equal(run('zusOwnDraft().baseA'),5555);
// Leaving during the fake login cancels its timer: it cannot redirect back later.
click('zaloguj');click('potwierdz');assert.equal(test.timers.size,1);
ctx.route=()=>({page:'start'});test.windowEvents.hashchange.forEach(fn=>fn());
assert.equal(test.timers.size,0);assert.equal(run('EU.zalogowany'),false);
// No fabricated promise of an official answer; text in the mock transcript is escaped.
run('EU.wiadomosci=[{temat:"<img>",tresc:"<script>",nr:"TEST"}]');
const message=run('euPanel("ezus")');assert.ok(message.includes('&lt;img&gt;')&&message.includes('&lt;script&gt;'));
assert.ok(!message.includes('Odpowiemy w ciągu 7 dni'));
console.log('Centrum: jeden profil, zapis po odświeżeniu, izolacja przykładu, anulowanie logowania i bezpieczny tekst OK');
