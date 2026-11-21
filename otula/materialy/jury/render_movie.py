"""Render authored montage HTML, not the live application, to 1080p60 MP4.

Preview first. Full output is generated in an ignored build directory. Copy to
dist only after checking the frames, captions and final metadata.
"""
from pathlib import Path
from multiprocessing import Pool
import argparse,json,subprocess,sys,time,re
from build_movie import build,OUT,SCENES

HERE=Path(__file__).resolve().parent
FPS=60;DURATION=102

def browser_page(p,url):
    browser=p.chromium.launch(channel='msedge',headless=True)
    page=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1,locale='pl-PL')
    page.goto(url,wait_until='load');page.evaluate('window.ready')
    return browser,page

def render_worker(args):
    index,start,end,url=args
    from playwright.sync_api import sync_playwright
    output=OUT/f'segment-{index:02}.mp4'
    encoder=subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-framerate',str(FPS),'-c:v','mjpeg','-i','-',
        '-an','-vf','scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=full:out_range=limited:flags=accurate_rnd+full_chroma_int,format=yuv420p',
        '-c:v','libx264','-preset','veryfast','-crf','15','-threads','2','-pix_fmt','yuv420p','-r',str(FPS),
        '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv',str(output)],stdin=subprocess.PIPE)
    try:
        with sync_playwright() as p:
            browser,page=browser_page(p,url)
            try:
                for frame in range(start,end):
                    page.evaluate('seek',frame/FPS)
                    encoder.stdin.write(page.screenshot(type='jpeg',quality=95))
            finally:browser.close()
    finally:encoder.stdin.close()
    if encoder.wait()!=0:raise RuntimeError('FFmpeg failed for segment '+str(index))
    return index,end-start

def preview(url):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    with sync_playwright() as p:
        browser,page=browser_page(p,url)
        warnings=[]
        for i,scene in enumerate(SCENES):
            page.evaluate('seek',scene['t0']+min(5,(scene['t1']-scene['t0'])/2))
            page.screenshot(path=str(OUT/f'preview-{i+1:02}.png'))
            warnings += page.evaluate('''() => [...document.querySelectorAll('.scene')].filter(s=>s.style.display!=='none').flatMap(s=>{
              const title=s.querySelector('.heading').getBoundingClientRect(), sub=s.querySelector('.subtitle').getBoundingClientRect();
              const result=[];
              if(title.bottom>sub.top-5)result.push({scene:s.className,issue:'Title overlaps subtitle'});
              for(const e of s.querySelectorAll('.heading,.subtitle,.caption,.credits')){
                const b=e.getBoundingClientRect();if(b.left<40||b.right>1880||b.top<20||b.bottom>1060)result.push({scene:s.className,text:e.textContent,bounds:b.toJSON()});
              }
              return result;
            })''')
        page.evaluate('poster()');page.screenshot(path=str(OUT/'poster.png'))
        browser.close()
    sheet=Image.new('RGB',(1920,2700),'#fffdfb')
    for i in range(10):
        im=Image.open(OUT/f'preview-{i+1:02}.png').convert('RGB').resize((960,540),Image.Resampling.LANCZOS)
        sheet.paste(im,((i%2)*960,(i//2)*540))
    sheet.save(OUT/'storyboard.jpg',quality=95)
    (OUT/'layout-warnings.json').write_text(json.dumps(warnings,ensure_ascii=False,indent=2),encoding='utf-8')
    if warnings:raise RuntimeError('Movie layout requires review: '+str(OUT/'layout-warnings.json'))

def captions():
    def stamp(t,sep='.'):
        ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
        return f'{h:02}:{m:02}:{s:02}{sep}{ms:03}'
    vtt=['WEBVTT',''];srt=[]
    for i,s in enumerate(SCENES,1):
        # Two cues per scene keep the complete disclosure readable.
        mid=s['t0']+(s['t1']-s['t0'])*.5
        for a,b,text in [(s['t0'],mid,s['title']+'. '+s['sub']),(mid,s['t1'],s['note'])]:
            words=text.split();lines=['']
            for word in words:
                if len(lines[-1])+len(word)+1>52:lines.append(word)
                else:lines[-1]+=(' ' if lines[-1] else '')+word
            block='\n'.join(lines)
            number=len(srt)//4+1
            vtt += [f'{stamp(a)} --> {stamp(b)}',block,'']
            srt += [str(number),f'{stamp(a,",")} --> {stamp(b,",")}',block,'']
    (OUT/'Otula-demo.vtt').write_text('\n'.join(vtt),encoding='utf-8')
    (OUT/'Otula-demo.srt').write_text('\n'.join(srt),encoding='utf-8-sig')

def run(args):subprocess.run([str(a) for a in args],check=True)

def audio():
    run([sys.executable,HERE/'music.py',OUT/'timeline.json',OUT/'music.wav'])
    measure=subprocess.run(['ffmpeg','-hide_banner','-i',str(OUT/'music.wav'),'-af','loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
    values=json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}',measure,re.S).group())
    filt=f"loudnorm=I=-18:TP=-1.5:LRA=11:measured_I={values['input_i']}:measured_TP={values['input_tp']}:measured_LRA={values['input_lra']}:measured_thresh={values['input_thresh']}:offset={values['target_offset']}:linear=true,aresample=48000"
    run(['ffmpeg','-v','error','-y','-i',OUT/'music.wav','-af',filt,'-ar','48000',OUT/'music-normalized.wav'])

def finish(workers):
    listing=OUT/'segments.txt';listing.write_text(''.join(f"file 'segment-{i:02}.mp4'\n" for i in range(workers)),encoding='utf-8')
    run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',listing,'-an','-vf','setsar=1',
        '-c:v','libx264','-preset','medium','-crf','18','-profile:v','high','-level:v','4.2','-pix_fmt','yuv420p','-r','60','-g','120','-threads','4',
        '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-t',str(DURATION),OUT/'picture.mp4'])
    audio()
    run(['ffmpeg','-v','error','-y','-i',OUT/'picture.mp4','-i',OUT/'music-normalized.wav','-map','0:v:0','-map','1:a:0',
        '-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',str(DURATION),'-movflags','+faststart',
        '-metadata','title=Otula - aplikacja webowa dla rodziny','-metadata','comment=Real application screenshots with fictional data. Original synthesized soundtrack. No live ZUS integration.',OUT/'Otula-demo.mp4'])
    run(['ffmpeg','-v','error','-y','-i',OUT/'poster.png','-q:v','2',OUT/'Otula-demo-plakat.jpg'])
    captions()

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true');parser.add_argument('--preview',action='store_true');parser.add_argument('--workers',type=int,default=4);parser.add_argument('--finish',action='store_true')
    args=parser.parse_args();html=build(args.draft);preview(html.as_uri())
    if not args.preview:
        if args.draft:raise SystemExit('Draft frames cannot become the final movie.')
        started=time.monotonic()
        if not args.finish:
            count=FPS*DURATION;size=(count+args.workers-1)//args.workers
            jobs=[(i,i*size,min(count,(i+1)*size),html.as_uri()) for i in range(args.workers)]
            with Pool(args.workers) as pool:
                for i,n in pool.imap_unordered(render_worker,jobs):print(f'Segment {i}: {n} klatek ({time.monotonic()-started:.0f}s)',flush=True)
        finish(args.workers);print(OUT/'Otula-demo.mp4',flush=True)
