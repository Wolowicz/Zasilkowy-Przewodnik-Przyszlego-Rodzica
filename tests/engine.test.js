import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../shared/engine.js';
import { analyzeText } from '../shared/audit.js';

test('podstawa = brutto − 13,71%; wariant A = 81,5%', () => {
  const r = calculate({ grossSalary: 7450, motherParentalWeeks: null });
  assert.equal(r.base, 6428.6);
  assert.equal(r.variants.A.monthly, 5239.31);
  assert.equal(r.weeks.maternity, 20);
  assert.equal(r.weeks.parentalTotal, 41);
});
test('9 tygodni drugiego rodzica płatne 70%', () => {
  const r = calculate({ grossSalary: 7450 });
  assert.equal(r.segments.find((s) => s.kind.includes('nieprzenoszalne')).rate, 70);
});
test('bliźnięta + Za życiem: 31 + 67 tyg.', () => {
  const r = calculate({ children: 2, zaZyciem: true });
  assert.equal(r.weeks.maternity, 31);
  assert.equal(r.weeks.parentalTotal, 67);
});
test('łączenie z pracą 1/2 etatu przez 8 tyg. = +4 tyg.', () => {
  assert.equal(calculate({ work: { fraction: 0.5, weeks: 8 } }).work.extension, 4);
});
test('JDG z zadłużeniem > 1% płacy minimalnej — wstrzymanie (art. 2a)', () => {
  assert.equal(calculate({ employment: 'jdg', debt: 100 }).status, 'blocked');
  assert.equal(calculate({ employment: 'jdg', debt: 40 }).status, 'ok');
});
test('brak ubezpieczenia — brak prawa', () => {
  assert.equal(calculate({ employment: 'none' }).status, 'denied');
});
test('płatnik: > 20 ubezpieczonych = pracodawca', () => {
  assert.equal(calculate({ employerSize: 21 }).payer.mother, 'employer');
  assert.equal(calculate({ employerSize: 20 }).payer.mother, 'zus');
});
test('martwe urodzenie: 8 tygodni, bez rodzicielskiego', () => {
  const r = calculate({ stillbirth: true });
  assert.equal(r.weeks.maternity, 8);
  assert.equal(r.weeks.parentalTotal, 0);
});
test('minimum 1000 zł', () => {
  assert.equal(calculate({ grossSalary: 1000 }).segments[0].monthly, 1000);
});
test('analizator odczytuje podstawę, kod i PESEL', () => {
  const a = analyzeText('Z-3 PESEL 94051203491 kod 01 10 00. Podstawa wymiaru zasiłku 6 428,60 zł. 81,5%');
  assert.equal(a.base, 6428.6);
  assert.equal(a.code, '01 10 00');
  assert.equal(a.peselMasked, '940512*****');
});
