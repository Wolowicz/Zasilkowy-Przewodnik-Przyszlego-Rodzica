// Sprawdza pliki przygotowane do commita; nie wypisuje wartości wykrytych sekretów.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const files=execFileSync('git',['ls-files','--cached','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const issues=[];let bytes=0;
const secret=/sk-or-v1-[a-z0-9]{32,}|github_pat_[a-z0-9_]{20,}|ghp_[a-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i;
for(const file of files){
  if(/(^|\/)(\.openai|\.aws|node_modules|\.env\.local|\.dev\.vars)(\/|$)/.test(file))issues.push(file+': niedozwolony plik');
  const absolute=path.join(root,file),body=fs.readFileSync(absolute);bytes+=body.length;
  if(/\.(md|js|mjs|cjs|json|html|css|py|txt)$/.test(file)&&secret.test(body.toString('utf8')))issues.push(file+': wzorzec sekretu');
  if(file.endsWith('.md')){
    const content=body.toString('utf8');
    const matches=[...content.matchAll(/\]\(([^\s)]+)\)/g)].map(m=>m[1]).concat([...content.matchAll(/src="([^"]+)"/g)].map(m=>m[1]));
    for(const target of matches){
      if(/^(https?:|mailto:|#)/.test(target))continue;
      const local=decodeURIComponent(target.split('#')[0]);
      if(!fs.existsSync(path.resolve(path.dirname(absolute),local)))issues.push(file+': brak '+target);
    }
  }
}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
else console.log(`Pakiet: ${files.length} plików, ${(bytes/1024/1024).toFixed(1)} MiB. Odnośniki lokalne poprawne; brak wykrytych wzorców sekretów.`);
