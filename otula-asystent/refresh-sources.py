import json, concurrent.futures, datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup
root=Path(__file__).parent
cards=json.loads((root/'worker/cards.json').read_text('utf-8-sig'))
care=json.loads((root/'worker/care.json').read_text('utf-8'))
def load(url):
 try:
  r=requests.get(url,timeout=(10,15));r.raise_for_status()
  page=BeautifulSoup(r.content,'html.parser')
  article=page.select_one('#read_content') or page.find('article') or page.find('main') or page.select_one('.journal-content-article, #article, .article-content, [role=main], #mainContent, #read_content')
  if not article:return
  for tag in article.select('script,style,footer,nav,header,aside'):tag.decompose()
  seen=set();lines=[];header=''
  for p in article.select('h1,h2,h3,h4,p,li'):
   if p.name.startswith('h'):
    header=' '.join(p.stripped_strings)[:140];continue
   if p.find(['p','li']):continue
   t=' '.join(' '.join(p.stripped_strings).split())
   if len(t)<11 or t in seen:continue
   seen.add(t);lines.append(header+' — '+t if header else t)
  if len(lines)<4:return
  # Keep only a short, verified excerpt from the Academy in the backup copy.
  academy={
   'Swaddling-Is-it-Safe.aspx':'Stop swaddling as soon as your baby shows any signs of trying to roll over.'
  }
  excerpt=academy.get(url.rsplit('/',1)[-1])
  if excerpt:
   if not any(excerpt in line for line in lines):return
   lines=[excerpt]
  return url,{'checked':datetime.datetime.now(datetime.timezone.utc).isoformat(),'lines':lines[:320]}
 except requests.RequestException:return
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 snapshots=dict(x for x in pool.map(load,{c['source'] for c in cards+care}) if x)
cache=root/'worker/source-cache.json'
previous=json.loads(cache.read_text('utf8')) if cache.exists() else {}
cache.with_suffix('.tmp').write_text(json.dumps({url:v for url,v in {**previous,**snapshots}.items() if url in {c['source'] for c in cards+care}},ensure_ascii=False),'utf8')
cache.with_suffix('.tmp').replace(cache)
print('Odczytane instrukcje:',len(snapshots))
