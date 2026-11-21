"""Lossless rectangular crops of supplied screenshots, without redrawing UI."""
from pathlib import Path
from PIL import Image
import json

SHOTS=Path(__file__).resolve().parent.parent/'zrzuty-final'
CROPS={
    'web-support-detail.png': {'source':'web-support.jpg','box':[818,226,1360,645]},
}
for name,entry in CROPS.items():
    source=SHOTS/entry['source']
    if not source.exists():continue
    im=Image.open(source)
    x,y,r,b=entry['box']
    assert 0<=x<r<=im.width and 0<=y<b<=im.height
    im.crop((x,y,r,b)).save(SHOTS/name)
(SHOTS/'crops.json').write_text(json.dumps(CROPS,ensure_ascii=False,indent=2),encoding='utf-8')
