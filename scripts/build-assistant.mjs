import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../otula-asystent/',import.meta.url));
for(const script of ['sync-cards.mjs','build.mjs'])execFileSync(process.execPath,[script],{cwd,stdio:'inherit'});
console.log('Serwer asystenta: otula-asystent/dist/server/index.js');
