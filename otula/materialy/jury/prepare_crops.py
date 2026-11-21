"""Lossless rectangular crops of supplied screenshots, without redrawing UI."""
from pathlib import Path
from PIL import Image
import json

SHOTS=Path(__file__).resolve().parent.parent/'zrzuty-final'
CROPS={
    'web-start-detail.png': {'source':'web-start.jpg','box':[160,120,1280,605]},
    'web-support-detail.png': {'source':'web-support-detail-source.jpg','box':[818,205,1360,605]},
    'web-calculator-result-detail.png': {'source':'web-calculator-result.jpg','box':[313,293,1224,838]},
    'phone-daily-detail-crop.png': {'source':'phone-daily-detail.jpg','box':[15,354,345,735]},
    'web-documents-detail.png': {'source':'web-documents.jpg','box':[592,455,1320,867]},
}
for name,entry in CROPS.items():
    source=SHOTS/entry['source']
    if not source.exists():continue
    im=Image.open(source)
    x,y,r,b=entry['box']
    assert 0<=x<r<=im.width and 0<=y<b<=im.height
    im.crop((x,y,r,b)).save(SHOTS/name)
(SHOTS/'crops.json').write_text(json.dumps(CROPS,ensure_ascii=False,indent=2),encoding='utf-8')
