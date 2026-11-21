import fs from 'node:fs';
const inputs=['cards','care','source-cache','medical-index'];
const names=['cards','careTopics','sourceCache','medicalIndex'];
const data=inputs.map((input,i)=>'const '+names[i]+'='+fs.readFileSync('worker/'+input+'.json','utf8')+';');
const modules=['matching.js','discovery.mjs','medical-search.mjs','assistant.mjs'].map(file=>fs.readFileSync('worker/'+file,'utf8'));
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js',[...data,...modules].join('\n'));
