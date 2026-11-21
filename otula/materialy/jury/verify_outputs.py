"""Check final artifact structure. Visual review and source validation remain required."""
from pathlib import Path
import json,subprocess
import fitz

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'materialy/film/render/jury-movie'
PDF=ROOT/'dist/Otula-prezentacja.pdf'
MOVIE=OUT/'Otula-demo.mp4'

def verify():
    doc=fitz.open(PDF)
    assert len(doc)==10, f'Expected 10 pages, got {len(doc)}'
    assert all(abs(p.rect.width/p.rect.height-16/9)<.005 for p in doc), 'PDF ratio differs from 16:9'
    all_text='\n'.join(p.get_text() for p in doc)
    assert 'ROBOCZY' not in all_text and '\ufffd' not in all_text, 'Draft text or replacement glyph in PDF'
    assert all(word in all_text for word in ['Karta wsparcia','źródło','Codex','OpenRouter']), 'Expected content missing'
    links=[link['uri'] for p in doc for link in p.get_links() if 'uri' in link]
    assert any('otula-dla-rodziny.' in link for link in links), 'No clickable demo link'
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(MOVIE)],text=True))
    video=next(s for s in probe['streams'] if s['codec_type']=='video')
    audio=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert (video['width'],video['height'])==(1920,1080)
    assert video['codec_name']=='h264' and video['pix_fmt']=='yuv420p'
    assert video['avg_frame_rate']=='60/1'
    assert video.get('color_space')=='bt709'
    assert audio['codec_name']=='aac' and audio['sample_rate']=='48000'
    duration=float(probe['format']['duration'])
    assert abs(duration-102)<.1 and duration<180
    vtt=(OUT/'Otula-demo.vtt').read_text(encoding='utf-8')
    assert vtt.startswith('WEBVTT') and vtt.count('-->')==20
    report={'pdf':{'pages':len(doc),'size':PDF.stat().st_size,'clickableLinks':links,'textCharacters':len(all_text)},
            'movie':{'durationSeconds':duration,'width':video['width'],'height':video['height'],'fps':video['avg_frame_rate'],
                     'videoCodec':video['codec_name'],'audioCodec':audio['codec_name'],'colorSpace':video['color_space'],'size':MOVIE.stat().st_size},
            'captions':20,'manualReview':'required separately'}
    path=OUT/'artifact-checks.json'
    path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':verify()
