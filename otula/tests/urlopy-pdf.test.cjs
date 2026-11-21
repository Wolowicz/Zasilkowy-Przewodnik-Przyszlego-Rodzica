const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const api=require('../dist/urlopy-pdf.js');
const dir=path.join(__dirname,'../dist/assets');
const jsPDF=require(path.join(dir,'report-jspdf.min.js')).jsPDF;
const PDFLib=require(path.join(dir,'wniosek-pdf-lib.min.js'));
const fonts={window:{}};vm.runInNewContext(fs.readFileSync(path.join(dir,'report-fonts.js'),'utf8'),fonts);
const libraries={jsPDF,font:fonts.window.otulaReportFonts.Sans};
const base={kind:'maternity',event:'birth',employee:'Żaneta Testowa',employer:'Pracodawca testowy, ul. Łąkowa 1',applicationDate:'2027-01-02',from:'2027-01-01',to:'2027-05-20',children:'Dziecko testowe, 01.01.2027',employed:true,reviewed:true,documentStatus:'attached',documents:'Kopia aktu urodzenia'};
async function run(){
 const cases=[base,{...base,kind:'parental',from:'2027-05-21',to:'2027-07-22',usedParts:'0',usedPeriods:'Nie korzystaliśmy',otherUse:'no',combine:'yes',workPeriods:[{from:'2027-05-21',to:'2027-07-22',fraction:'0.5'}],extendedWork:'no'}, {...base,kind:'paternity',from:'2027-02-01',to:'2027-02-07',usedDays:'7',usedPeriods:'01.01.2027–07.01.2027, pracodawca testowy'}, {...base,kind:'childcare',from:'2027-08-01',to:'2027-11-30',usedParts:'0',usedPeriods:'Nie korzystaliśmy',otherUse:'no',employmentSixMonths:true}, {...base,kind:'loss',event:'loss',children:undefined,eventDate:'2027-01-01',proof:'medical',periodConfirmed:true,from:'2027-01-01',to:'2027-02-25',documents:'Zaświadczenie uprawnionego lekarza lub położnej'}];
 for(const d of cases){assert.deepEqual(api.validate(d),[],d.kind);const bytes=await api.generatePdf(d,libraries),pdf=await PDFLib.PDFDocument.load(bytes);assert(pdf.getPageCount()>=1);assert.equal(pdf.getTitle(),api.TITLES[d.kind]);assert.equal(pdf.getForm().getFields().length,0);assert.match(api.paragraphs(d).at(-1).text,/\.{10}/,'Puste miejsce na podpis');}
 const loss=cases[4];assert(!/imię dziecka|płeć|rozpoznanie|Dziecko testowe/i.test(api.paragraphs(loss).map(p=>p.text).join(' ')));assert(api.validate({...loss,proof:''}).length);
 assert.equal(api.normalize({kind:'maternity',answers:{event:'childDeath'}}).kind,'loss');
 assert.equal(api.normalize({kind:'loss',answers:{event:'childDeath',lossDocument:'act'}}).proof,'death');
 assert.equal(api.normalize({kind:'loss',answers:{event:'loss',lossDocument:'act'}}).proof,'record');
 assert.equal(api.normalize({kind:'parental',answers:{previousParental:'no'}}).usedParts,'0');
 assert.equal(api.normalize({kind:'paternity',answers:{paternityUsedDays:7}}).usedDays,7);
 assert.match(api.normalize({kind:'parental',answers:{parentalParts:[{parent:'other',from:'2027-01-01',to:'2027-01-07'}]}}).usedPeriods,/Drugi rodzic/);
 assert(api.validate({...base,reviewed:false}).length);assert(api.validate({...base,employed:false}).length);assert(api.validate({...base,from:'2027-02-30'}).length);
 assert(api.validate({...cases[2],usedDays:'14'}).some(x=>x.includes('14 dni')),'Nie przyznawaj drugich 14 dni');
 assert(api.validate({...cases[1],usedParts:'5'}).length,'Nie twórz szóstej zwykłej części');
 assert(api.validate({...cases[1],otherUse:''}).length,'Nie zgaduj oświadczenia drugiego rodzica');
 assert(api.validate({...cases[1],workPeriods:[{from:'2027-05-21',to:'2027-06-30',fraction:1}]}).length);
 assert(api.validate({...cases[1],workPeriods:[{from:'2027-05-21',to:'2027-06-30',fraction:.5},{from:'2027-06-01',to:'2027-07-01',fraction:.25}]}).length);
 assert(api.validate({...cases[1],extendedWork:''}).length);assert(api.validate({...cases[1],extendedWork:'yes',extendedFraction:1}).length);
 assert(api.validate({...cases[3],otherUse:'exception',exception:''}).length);
 const long={...base,documents:'Opis dokumentu. '.repeat(200)};const pages=(await PDFLib.PDFDocument.load(await api.generatePdf(long,libraries))).getPageCount();assert(pages>1,'Długie załączniki przechodzą na nową stronę, nie ucinają się');
 console.log('Urlopy PDF: 5 rodzajów, Unicode, podział stron, puste podpisy, strata bez danych dziecka, świadome oświadczenia i praca w okresach OK');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
