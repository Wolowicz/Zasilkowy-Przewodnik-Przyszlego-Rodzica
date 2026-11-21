import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const testsDir = path.join(root,'otula/tests');
for (const test of fs.readdirSync(testsDir).filter(name => name.endsWith('.test.cjs')).sort()) {
  execFileSync(process.execPath,[path.join(testsDir,test)],{stdio:'inherit'});
}
for(const name of fs.readdirSync(path.join(root,'otula/dist')).filter(n=>n.endsWith('.js')))execFileSync(process.execPath,['--check',path.join(root,'otula/dist',name)],{stdio:'inherit'});
for(const name of fs.readdirSync(path.join(root,'scripts')).filter(n=>n.endsWith('.mjs')))execFileSync(process.execPath,['--check',path.join(root,'scripts',name)],{stdio:'inherit'});
execFileSync(process.execPath,[path.join(root,'tests/dev.test.mjs')],{stdio:'inherit'});
console.log('Testy i kontrola składni zakończone. Nie stanowią walidacji na zestawach ZUS.');
