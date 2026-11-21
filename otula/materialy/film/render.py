"""Otula: autorski montaż 1920x1080 / 60 fps. Python + FFmpeg, bez usług płatnych.
Sceny powstają z prawdziwych ekranów i zachowanego nagrania prototypu.
Uruchom: python render.py [--preview] [--scene N]
"""
from pathlib import Path
import argparse, math, subprocess, json, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import fitz

HERE=Path(__file__).resolve().parent
APP=HERE.parents[1]
ASSETS=APP/'dist/assets'
SHOTS=APP/'materialy/zrzuty-21-11'
OUT=HERE/'render'
OUT.mkdir(exist_ok=True)
W,H,FPS=1920,1080,60
INK='#49313c'; PLUM='#793e58'; ROSE='#bd6574'
CREAM='#fffaf1'; PINK='#f8e3eb'; PEACH='#ffe1c7'; YELLOW='#fff0ad'; SAGE='#e7efdf'
DURATIONS=[5.4,6.6,7.2,6.6,8.4,8.4,8.4,7.2,9.6,7.8,8.4,6.0]
NAMES=['Razem','Twoja rola','Rodzina','Zatrudnienie','Małe kroki','Terminy','Zasiłki','Warianty','Karta wsparcia','Codzienność','Co dalej','Otula']

def font(size,bold=False,serif=False):
    f=ImageFont.truetype(str(ASSETS/('dm-serif-text.ttf' if serif else 'dm-sans.ttf')),size)
    if bold and not serif:
        try:f.set_variation_by_name('Bold')
        except OSError:pass
    return f

def layer():return Image.new('RGBA',(W,H),(0,0,0,0))
def save(im,name):p=OUT/name;im.save(p);return p
def txt(im,xy,text,size=38,color=INK,bold=False,serif=False,spacing=12):
    draw=ImageDraw.Draw(im); f=font(size,bold,serif)
    for n,line in enumerate(text.split('\n')):
        draw.text((xy[0],xy[1]+n*(size+spacing)),line,font=f,fill=color,anchor='lt')
def pill(im,box,label,color=YELLOW,size=28,ink=INK):
    ImageDraw.Draw(im).rounded_rectangle(box,radius=(box[3]-box[1])/2,fill=color)
    d=ImageDraw.Draw(im);d.text(((box[0]+box[2])/2,(box[1]+box[3])/2),label,font=font(size,True),fill=ink,anchor='mm')

def svg_image(name,width):
    svg=fitz.open(str(ASSETS/name)); pdf=fitz.open('pdf',svg.convert_to_pdf());p=pdf[0]
    pix=p.get_pixmap(matrix=fitz.Matrix(width/p.rect.width,width/p.rect.width),alpha=True)
    return Image.frombytes('RGBA',[pix.width,pix.height],pix.samples)
LOGO=svg_image('otula-logo.svg',245)

def rounded(im,size,radius=32):
    im=im.convert('RGBA').resize(size,Image.Resampling.LANCZOS)
    mask=Image.new('L',size);ImageDraw.Draw(mask).rounded_rectangle((0,0,size[0]-1,size[1]-1),radius=radius,fill=255)
    im.putalpha(mask);return im

def frame(im,xy,size,source,phone=False):
    x,y=xy; w,h=size
    shadow=layer();d=ImageDraw.Draw(shadow)
    d.rounded_rectangle((x-4,y+15,x+w+4,y+h+22),radius=42 if phone else 30,fill=(82,41,54,35))
    im.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(24)))
    d=ImageDraw.Draw(im);d.rounded_rectangle((x-9,y-9,x+w+9,y+h+9),radius=44 if phone else 30,fill='#fffdfb',outline='#d7bfc5',width=2)
    im.alpha_composite(rounded(source,(w,h),36 if phone else 25),(x,y))

def flower(im,x,y,r,color=ROSE):
    # Dekoracyjny motyw siedmiu płatków z identyfikacji Otuli.
    d=ImageDraw.Draw(im)
    for a in range(7):
        theta=2*math.pi*a/7; cx=x+math.sin(theta)*r*.5;cy=y-math.cos(theta)*r*.5
        d.ellipse((cx-r*.32,cy-r*.32,cx+r*.32,cy+r*.32),fill=color)
    d.ellipse((x-r*.2,y-r*.2,x+r*.2,y+r*.2),fill='#f7cf78')

def base(n,bg=CREAM):
    im=Image.new('RGBA',(W,H),bg);d=ImageDraw.Draw(im)
    d.ellipse((1310,-300,2200,600),fill=[PINK,PEACH,YELLOW,SAGE][n%4])
    d.ellipse((1500,800,2030,1330),fill=[YELLOW,PINK,PEACH,SAGE][(n+1)%4])
    im.alpha_composite(LOGO,(104,65))
    txt(im,(104,1020),'ZASIŁKOWY PRZEWODNIK PRZYSZŁEGO RODZICA',21,color='#745c66',bold=True)
    txt(im,(1460,75),'HACKNATION 2026 / ZUS',23,color='#745c66',bold=True)
    for i in range(12):d.rounded_rectangle((1480+i*26,1032,1496+i*26,1037),radius=3,fill=PLUM if i==n else '#decbd0')
    return im

def words(tag,title,body,chip=None,title_size=91):
    im=layer();txt(im,(108,250),tag.upper(),26,PLUM,True)
    while max(ImageDraw.Draw(im).textlength(line,font=font(title_size,True)) for line in title.split('\n'))>660:title_size-=1
    txt(im,(101,315),title,title_size,INK,True,spacing=8)
    yy=315+len(title.split('\n'))*(title_size+8)+37
    body_size=35
    while max(ImageDraw.Draw(im).textlength(line,font=font(body_size)) for line in body.split('\n'))>640:body_size-=1
    txt(im,(108,yy),body,body_size,color='#715963',spacing=15)
    if chip:
        width=min(640,ImageDraw.Draw(im).textlength(chip,font=font(27,True))+52)
        pill(im,(108,yy+len(body.split('\n'))*50+50,108+width,yy+len(body.split('\n'))*50+110),chip)
    return im

def make_scene(n):
    bg=base(n,[CREAM,CREAM,PINK,CREAM,CREAM,PEACH,CREAM,CREAM,PINK,CREAM,CREAM,PEACH][n]);visual=layer();extra=layer();video=None
    if n==0:
        text=words('Dobrze mieć wsparcie','Rodzicielstwo?\nOgarnijmy\nto razem.','Sprawy, terminy i bliscy.\nW jednej Otuli.',title_size=91)
        art=Image.open(ASSETS/'powitanie-z-bliskimi.webp');frame(visual,(830,340),(990,396),art)
        pill(extra,(1110,260,1630,328),'małe kroki, dużo wsparcia',YELLOW,30)
        flower(extra,1725,780,68)
    elif n==1:
        text=words('Zaczynamy od Ciebie','Twój plan.\nTwoje tempo.','Mama, tata, bliska osoba.\nWybierz swoją rolę.','Bez zakładania konta')
        frame(visual,(1120,160),(368,797),Image.open(SHOTS/'start.png'),True)
        pill(extra,(885,420,1094,483),'mama',PINK,30);pill(extra,(1510,545,1740,608),'tata',YELLOW,30);pill(extra,(880,735,1097,798),'bliscy',PEACH,30)
    elif n==2:
        text=words('Wasza rodzina','Każde dziecko.\nWłasny plan.','Dodaj imię, etap i datę.\nRodzeństwo? Też ma swój plan.','Daty i postęp osobno',title_size=83)
        frame(visual,(980,170),(720,780),Image.open(SHOTS/'dziecko-karta.png'))
        pill(extra,(1285,870,1780,941),'+ kolejne dziecko',YELLOW,31)
    elif n==3:
        text=words('Dopasowanie','Twoja praca\nma znaczenie.','Kilka prostych wyborów.\nSprawy bliżej Twojej sytuacji.','Zmienisz to w każdej chwili',title_size=87)
        frame(visual,(870,240),(900,737),Image.open(SHOTS/'praca-lista.png'))
    elif n==4:
        text=words('Ścieżka rodzica','Mały krok.\nMniej na głowie.','Widzisz, co już za Tobą\ni czym możesz zająć się teraz.','Bez presji. W swoim tempie.',title_size=85)
        frame(visual,(920,210),(344,744),Image.open(SHOTS/'pulpit.png'),True)
        frame(visual,(1390,150),(368,797),Image.open(SHOTS/'sciezka.png'),True)
        flower(extra,1310,560,50)
    elif n==5:
        text=words('Moje terminy','Daty\npod kontrolą.','Dodaj przygotowanie dokumentów.\nWybierz przypomnienie.','Alarm po imporcie do kalendarza',title_size=88)
        video=(38.0,6.0,(218,0,1062,700),(790,225,1070,705))
        txt(extra,(810,956),'Własne terminy + eksport ICS. Bez automatycznej synchronizacji.',25,color='#715963')
    elif n==6:
        text=words('Kalkulator zasiłku','Zasiłki.\nBez zgadywania.','Porównaj okresy i warianty.\nZobacz udział obojga rodziców.','Obliczenia według jawnych reguł',title_size=85)
        video=(48.0,4.0,(218,0,1062,700),(790,225,1070,705))
        txt(extra,(810,956),'Wynik orientacyjny brutto. Podstawa zasiłku od płatnika.',26,color='#715963')
    elif n==7:
        text=words('Wasz wariant','Praca na\npół etatu?','Sprawdź, jak zmieniają się\nokres opieki i kwota dzienna.','Własne 9 tygodni drugiego rodzica',title_size=91)
        video=(56.0,3.5,(218,0,1062,700),(790,225,1070,705))
        txt(extra,(810,956),'Symulacja zakłada stały wymiar pracy przez cały okres.',26,color='#715963')
    elif n==8:
        text=words('Nasza Karta wsparcia','Łatwiej\npoprosić\no pomoc.','Jedna sprawa. Konkretna prośba.\nPo Twojemu. Z życzliwością.',title_size=91)
        frame(visual,(940,170),(850,780),Image.open(SHOTS/'karta.png'))
        pill(extra,(1045,885,1700,956),'edytuj  ·  skopiuj  ·  udostępnij',YELLOW,30)
    elif n==9:
        text=words('Podręcznik rodzica','Na co dzień:\nspokojniej.','Karmienie, sen, połóg i opieka.\nWiedza z podanymi źródłami.','Pytania? Zapytaj Otulę.',title_size=91)
        frame(visual,(1130,160),(368,797),Image.open(SHOTS/'poradnik.png'),True)
        pill(extra,(855,400,1100,463),'opieka',PINK,29);pill(extra,(1515,535,1790,598),'źródła',SAGE,29);pill(extra,(880,745,1105,808),'bliskość',YELLOW,29)
    elif n==10:
        text=layer();txt(text,(108,230),'DZIAŁAJĄCY PROTOTYP',27,PLUM,True)
        txt(text,(104,295),'Działa dziś. Rozwija się dalej.',85,INK,True)
        for x,label,body,color in [(108,'Plan + wsparcie','Sprawy, kalendarz i raport.\nKarta wsparcia dla bliskich.',PINK),(710,'Jawne granice','E-usługi są symulacją.\nPodstawa zasiłku od płatnika.',YELLOW),(1312,'Kolejny krok','Walidacja na przypadkach ZUS.\nSytuacje szczególne.',SAGE)]:
            ImageDraw.Draw(visual).rounded_rectangle((x,490,x+500,790),radius=34,fill=color)
            txt(extra,(x+30,535),label,39,INK,True);txt(extra,(x+30,620),body,29,spacing=14)
        txt(extra,(108,875),'Wcześniejszy prototyp: 16–17 XI 2026. Moduł ZUS: 21 XI 2026.',27,color='#715963')
        txt(extra,(108,921),'Kod i materiały: wsparcie Codex i Claude. Ilustracje: ImageGen.',25,color='#715963')
    else:
        text=words('Otula. Blisko rodziny.','Masz plan.\nMasz wsparcie.','Sprawdź na telefonie.\nZacznij od jednego kroku.','Bez logowania',title_size=93)
        frame(visual,(870,345),(900,360),Image.open(ASSETS/'powitanie-z-bliskimi.webp'))
        pill(extra,(1010,250,1650,319),'Twoje tempo. Wasza Otula.',YELLOW,32)
        txt(extra,(108,945),'otula-dla-rodziny.etherealdaffodil4.chatgpt.site',30,color=PLUM,bold=True)
    if video:
        _,_,_,(x,y,w,h)=video
        shadow=layer();ImageDraw.Draw(shadow).rounded_rectangle((x-5,y+12,x+w+5,y+h+18),radius=30,fill=(82,41,54,40));bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(24)))
        ImageDraw.Draw(bg).rounded_rectangle((x-9,y-9,x+w+9,y+h+9),radius=32,fill='white',outline='#d6bdc4',width=2)
    paths=[save(bg,f'{n:02}-bg.png'),save(visual,f'{n:02}-visual.png'),save(text,f'{n:02}-text.png'),save(extra,f'{n:02}-extra.png')]
    # Contact-sheet preview shows the stable composition, including real video frames.
    preview=bg.copy()
    if video:
        sec,_,crop,box=video;p=OUT/f'{n:02}-source.png'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(sec+.5),'-i',str(HERE/'source-demo.mp4'),'-frames:v','1',str(p)],check=True)
        source=Image.open(p).crop((crop[0],crop[1],crop[0]+crop[2],crop[1]+crop[3]))
        preview.alpha_composite(rounded(source,(box[2],box[3])),box[:2])
    for item in [visual,text,extra]:preview.alpha_composite(item)
    save(preview,f'{n:02}-preview.png')
    return paths,video

def render_scene(n,paths,video):
    duration=DURATIONS[n]+(.3 if n<11 else 0)
    cmd=['ffmpeg','-hide_banner','-loglevel','error','-y']
    for p in paths:cmd+=['-loop','1','-framerate',str(FPS),'-i',str(p)]
    filters=[]
    if video:
        start,length,crop,box=video
        cmd+=['-ss',str(start),'-t',str(length),'-i',str(HERE/'source-demo.mp4')]
        x,y,w,h=box;cx,cy,cw,ch=crop
        filters+=[f'[4:v]crop={cw}:{ch}:{cx}:{cy},scale={w}:{h}:flags=lanczos,setsar=1,fps={FPS},tpad=stop_mode=clone:stop_duration={duration},format=rgba[v]',f'[0:v][v]overlay={x}:{y}:shortest=1[b]']
    else:filters+=['[0:v]format=rgba[b]']
    # Motion is rendered at 60 fps; interface actions retain their recorded timing.
    filters += [
      '[1:v]format=rgba,fade=t=in:st=0:d=0.45:alpha=1[v1]',
      "[b][v1]overlay=x='42*pow(max(0,1-t/0.8),3)+4*sin(t*0.7)':y='3*sin(t*0.6)':shortest=1[m1]",
      '[2:v]format=rgba,fade=t=in:st=0.08:d=0.4:alpha=1[v2]',
      "[m1][v2]overlay=x=0:y='32*pow(max(0,1-t/0.7),3)':shortest=1[m2]",
      '[3:v]format=rgba,fade=t=in:st=0.3:d=0.45:alpha=1[v3]',
      "[m2][v3]overlay=x=0:y='-20*pow(max(0,1-t/0.95),3)':shortest=1,format=yuv420p[out]"
    ]
    cmd+=['-filter_complex_threads','2','-filter_complex',';'.join(filters),'-map','[out]','-an','-t',str(duration),'-r',str(FPS),'-c:v','libx264','-preset','fast','-crf','18','-threads','4','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/f'{n:02}.mp4')]
    print('Render',n,NAMES[n],flush=True);subprocess.run(cmd,check=True)

def soundtrack():
    # Oryginalny podkład proceduralny: miękkie akordy, pluck, bas i lekki rytm.
    sr=48000; duration=sum(DURATIONS); out=np.zeros((int(sr*duration),2),dtype=np.float32);rng=np.random.default_rng(21112026)
    beat=.6
    def add(start,signal,vol=.1,pan=0):
        p=int(start*sr);end=min(p+len(signal),len(out));
        if end<=p:return
        s=signal[:end-p]*vol;out[p:end,0]+=s*np.sqrt((1-pan)/2);out[p:end,1]+=s*np.sqrt((1+pan)/2)
    def tone(midi,seconds,kind):
        t=np.arange(int(seconds*sr))/sr;f=440*2**((midi-69)/12)
        if kind=='pad':return (np.sin(2*np.pi*f*t)+.24*np.sin(2*np.pi*f*2.003*t))*(1-np.exp(-t*3))*np.exp(-t/2.2)*np.minimum(1,(seconds-t)/.25)
        if kind=='bass':return np.sin(2*np.pi*f*t)*np.exp(-t*5)*np.minimum(1,t/.015)
        return (np.sin(2*np.pi*f*t)+.24*np.sin(2*np.pi*2*f*t)+.08*np.sin(2*np.pi*3*f*t))*np.exp(-t*6)*np.minimum(1,t/.006)
    chords=[[57,60,64,67],[53,57,60,64],[48,55,60,64],[55,59,62,67]]
    melody=[0,2,1,3,2,1,3,2]
    for bar in range(math.ceil(duration/(beat*4))):
        start=bar*beat*4;chord=chords[bar%4]
        for i,note in enumerate(chord):add(start,tone(note,3.1,'pad'),.055,(i-1.5)/3)
        for step in range(8):
            if step in [1,5] and bar%3==0:continue
            add(start+step*beat/2,tone(chord[melody[(step+bar)%8]]+12,1.0,'pluck'),.085,(-.35 if step%2 else .35))
        for step in [0,2]:add(start+step*beat,tone(chord[0]-12,1.0,'bass'),.18)
        if bar>1:
            for step in [0,2]:
                t=np.arange(int(sr*.2))/sr;phase=2*np.pi*(47*t+45*.025*(1-np.exp(-t/.025)));add(start+step*beat,np.sin(phase)*np.exp(-t*25),.16)
            for step in [1,3]:
                t=np.arange(int(sr*.12))/sr;noise=rng.normal(size=len(t));add(start+step*beat,(noise-np.roll(noise,1))*np.exp(-t*45),.023)
            for step in range(8):
                t=np.arange(int(sr*.055))/sr;noise=rng.normal(size=len(t));add(start+step*beat/2,(noise-np.roll(noise,1))*np.exp(-t*90),.014,.4 if step%2 else -.4)
    time=np.arange(len(out))/sr;fade=np.minimum(1,time/1.2)*np.minimum(1,(duration-time)/2.5);out*=fade[:,None]
    out=np.tanh(out*1.1);pcm=(np.clip(out,-1,1)*32767).astype('<i2')
    with wave.open(str(OUT/'music.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes(pcm.tobytes())

def join():
    # Pairwise transitions avoid decoding all twelve Full HD streams at once.
    paths=[]
    for n in range(12):
        source=OUT/f'{n:02}.mp4';start=.3 if n else 0;dur=DURATIONS[n]-(.3 if n else 0)
        body=OUT/f'part-{2*n:02}.mp4'
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(start),'-i',str(source),'-t',str(dur),'-an','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-r','60','-pix_fmt','yuv420p',str(body)],check=True);paths.append(body)
        if n<11:
            transition=OUT/f'part-{2*n+1:02}.mp4'
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(DURATIONS[n]),'-i',str(source),'-i',str(OUT/f'{n+1:02}.mp4'),'-filter_complex_threads','2','-filter_complex','[0:v]setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=0.3:offset=0,format=yuv420p[v]','-map','[v]','-an','-t','0.3','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-r','60',str(transition)],check=True);paths.append(transition)
    listing=OUT/'parts.txt';listing.write_text('\n'.join("file '"+p.name+"'" for p in paths),encoding='utf8')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-i',str(OUT/'music.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-af','loudnorm=I=-19:TP=-2:LRA=8','-t','90','-movflags','+faststart',str(OUT/'Otula-demo.mp4')],check=True)

def captions():
    titles=['Rodzicielstwo? Ogarnijmy to razem.','Twój plan. Twoje tempo. Wybierz rolę.','Każde dziecko ma własny plan, daty i postęp.','Twoja praca pomaga dopasować sprawy.','Małe kroki. Bez presji, w swoim tempie.','Moje terminy. Alarm po imporcie ICS do kalendarza.','Kalkulator: wynik orientacyjny, podstawa od płatnika.','Pół etatu: porównaj okres opieki i kwotę dzienną.','Karta wsparcia: edytuj, skopiuj i udostępnij prośbę.','Podręcznik rodzica i pytania do Otuli. Wiedza ze źródłami.','Prototyp: e-usługi są symulacją. Kolejny krok to walidacja ZUS.','Masz plan. Masz wsparcie. Otula — bez logowania.']
    def ts(t):return f'{int(t)//3600:02}:{int(t)//60%60:02}:{t%60:06.3f}'
    t=0;lines=['WEBVTT','']
    for d,title in zip(DURATIONS,titles):lines += [f'{ts(t)} --> {ts(t+d)}',title,''];t+=d
    (OUT/'Otula-demo.vtt').write_text('\n'.join(lines),encoding='utf8')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true');parser.add_argument('--scene',type=int);args=parser.parse_args()
    selected=[args.scene] if args.scene is not None else list(range(12))
    for n in selected:
        paths,video=make_scene(n)
        if not args.preview:render_scene(n,paths,video)
    if args.scene is None:
        sheet=Image.new('RGB',(1440,1620),'#efe7e6')
        for n in range(12):sheet.paste(Image.open(OUT/f'{n:02}-preview.png').convert('RGB').resize((480,270)),((n%3)*480,(n//3)*405));ImageDraw.Draw(sheet).text(((n%3)*480+20,(n//3)*405+292),f'{n+1:02}  {NAMES[n]}',font=font(26,True),fill=INK)
        sheet.save(OUT/'storyboard.jpg',quality=94)
        if not args.preview:soundtrack();join();captions();print('Gotowe: 90 sekund / Full HD / 60 fps',flush=True)
