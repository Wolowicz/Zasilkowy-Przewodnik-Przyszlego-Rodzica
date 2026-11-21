"""Oryginalny podkład instrumentalny do filmu Otuli (100 BPM, F-dur; czas z osi montażu).

Cały dźwięk jest syntetyzowany w tym pliku (numpy/scipy) – bez sampli i bez cudzych nagrań,
na podstawie wcześniejszego montażu zespołu. Synchronizacja z obrazem: plik timeline.json
eksportowany z montażu (granice scen, dotknięcia, pisanie).

Użycie: python music.py timeline.json audio/podklad.wav
"""
import json, sys, wave
import numpy as np
from scipy.signal import butter, lfilter, fftconvolve

SR = 48000
TL = json.load(open(sys.argv[1], encoding='utf-8'))
OUT = sys.argv[2]
DUR = float(TL['duration'])
N = int(SR * DUR)
BPM = 100
BEAT = 60 / BPM          # 0.6 s
BAR = 4 * BEAT           # 2.4 s
rng = np.random.default_rng(2026)

L = np.zeros(N); R = np.zeros(N)          # sucha suma
VL = np.zeros(N); VR = np.zeros(N)        # wysyłka na pogłos


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, pan=0.0, gain=1.0, verb=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= N or i0 + len(sig) <= 0:
        return
    s = sig * gain
    if i0 < 0:
        s = s[-i0:]; i0 = 0
    s = s[:N - i0]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(s)] += s * gl; R[i0:i0 + len(s)] += s * gr
    if verb:
        VL[i0:i0 + len(s)] += s * gl * verb; VR[i0:i0 + len(s)] += s * gr * verb


def env_adsr(n, a, d, s, r, sus_len):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where((t >= a + d) & (t < sus_len), s, e)
    rel = np.clip(1 - (t - sus_len) / max(r, 1e-4), 0, 1)
    return np.where(t >= sus_len, s * rel, e)


def lowpass(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'low')
    return lfilter(b, a, x)


def highpass(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'high')
    return lfilter(b, a, x)


def bandpass(x, f1, f2, order=2):
    b, a = butter(order, [f1 / (SR / 2), f2 / (SR / 2)], 'band')
    return lfilter(b, a, x)


# ---------- harmonia ----------
CHORDS = [  # Fmaj7, Dm7, Bbmaj7, Cadd9
    ([57, 60, 64, 65], 41), ([57, 60, 62, 65], 38), ([57, 58, 62, 65], 34), ([55, 60, 62, 64], 36)
]
NBARS = int(np.ceil(DUR / BAR)) + 1


def section(t):
    by_id = {scene['id']: scene for scene in TL['scenes']}
    if t < by_id['intro']['t1']: return 'intro'
    if by_id['wsparcie']['t0'] <= t < by_id['wsparcie']['t1']: return 'czulosc'
    if t >= by_id['final']['t0']: return 'final'
    if t >= by_id['codziennosc']['t0']: return 'groove2'
    return 'groove'



# ---------- instrumenty ----------
def pad_note(m, dur, bright=1.0):
    n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    sig = np.zeros(n)
    for det in (-0.07, 0.0, 0.06):          # półtony
        f = hz(m + det)
        for k in range(1, 7):
            sig += np.sin(2 * np.pi * f * k * t + k * 0.7) / (k ** 1.6)
    sig = lowpass(sig, 1400 * bright + 300)
    return sig * env_adsr(n, 0.45, 0.4, 0.8, 1.1, dur) * 0.06


def pluck(m, dur=0.5, tone=1.0):
    n = int((dur + 0.4) * SR); t = np.arange(n) / SR
    f = hz(m)
    idx = 1.6 * tone * np.exp(-t * 9)
    sig = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 14)
    return sig * np.exp(-t * 5.2) * np.minimum(1, t / 0.004) * 0.11


def bell(m, dur=1.2):
    n = int((dur + 1.6) * SR); t = np.arange(n) / SR
    f = hz(m) * (1 + 0.0025 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / 0.6))
    ph = 2 * np.pi * np.cumsum(f) / SR
    sig = np.sin(ph) + 0.35 * np.sin(2.01 * ph) * np.exp(-t * 3) + 0.12 * np.sin(3.98 * ph) * np.exp(-t * 6)
    e = np.minimum(1, t / 0.012) * np.exp(-t * 1.25)
    return sig * e * 0.12


def ep_chord(notes, dur):  # miękkie "pianino" (FM)
    out = None
    for m in notes:
        n = int((dur + 1.5) * SR); t = np.arange(n) / SR
        f = hz(m)
        s = np.sin(2 * np.pi * f * t + 0.9 * np.exp(-t * 4) * np.sin(2 * np.pi * f * t)) * np.exp(-t * 1.6) * np.minimum(1, t / 0.006)
        out = s if out is None else out + s
    return out * 0.05


def bass(m, dur):
    n = int((dur + 0.2) * SR); t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)
    s = np.tanh(1.4 * s)
    return s * env_adsr(n, 0.01, 0.15, 0.7, 0.12, dur) * 0.16


def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 11) + 0.04 * lowpass(rng.standard_normal(n), 3000) * np.exp(-t * 160)) * 0.32


def hat(open_=False):
    n = int((0.18 if open_ else 0.06) * SR); t = np.arange(n) / SR
    s = lowpass(highpass(rng.standard_normal(n), 6500), 12000)
    return s * np.exp(-t * (22 if open_ else 70)) * 0.022


def clap():
    n = int(0.3 * SR); t = np.arange(n) / SR
    s = bandpass(rng.standard_normal(n), 900, 3200)
    e = np.zeros(n)
    for d in (0, 0.011, 0.022):
        e += np.where(t >= d, np.exp(-(t - d) * 60), 0)
    e += np.exp(-t * 14) * 0.35
    return s * e * 0.06


def whoosh(length=0.7):
    n = int(length * SR); t = np.arange(n) / SR
    s = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 960
    for i in range(0, n, seg):  # przestrajany filtr pasmowy
        k = i / n
        fc = 500 + 3500 * k ** 1.5
        out[i:i + seg] = bandpass(s[i:i + seg], fc * 0.7, min(fc * 1.4, 20000))[:len(out[i:i + seg])]
    e = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 2 * np.minimum(1, (length - t) / 0.08)
    return out * e * 0.05


def tick(freq=2400, length=0.03, g=0.03):
    n = int(length * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 180) * g


def riser(length=1.4):
    n = int(length * SR); t = np.arange(n) / SR
    s = highpass(rng.standard_normal(n), 2500)
    return s * (t / length) ** 2.2 * 0.03


# ---------- aranżacja ----------
for b in range(NBARS):
    t0 = b * BAR
    if t0 >= DUR: break
    notes, root = CHORDS[b % 4]
    sec = section(t0 + 0.01)
    final = t0 >= 84.0
    # plama (pad)
    if not (final and t0 >= 86.4):
        bright = 0.6 if sec == 'intro' else (0.75 if sec == 'czulosc' else 1.0)
        for m in notes:
            add(pad_note(m, BAR, bright), t0, pan=(m - 60) / 14, gain=0.9 if sec != 'czulosc' else 0.75, verb=0.5)
    # arpeggio (ósemki)
    if sec in ('intro', 'groove', 'groove2') or (final and t0 < 86.4):
        pat = [0, 1, 2, 3, 2, 1, 3, 2]
        for i, pi in enumerate(pat):
            tt = t0 + i * BEAT / 2
            if tt >= DUR: break
            lvl = 0.55 + 0.45 * min(1, tt / 6.0) if sec == 'intro' else 1.0
            add(pluck(notes[pi] + 12, 0.45, 0.8 + 0.2 * (i % 2)), tt, pan=0.35 if i % 2 else -0.35, gain=lvl, verb=0.35)
    # bas
    if sec in ('groove', 'groove2') or (sec == 'intro' and t0 >= 4.8):
        add(bass(root, BEAT * 1.5), t0)
        add(bass(root, BEAT * 0.9), t0 + BEAT * 2.5, gain=0.8)
        add(bass(root + 12 if b % 2 else root + 7, BEAT * 0.9), t0 + BEAT * 3.5, gain=0.6)
    if sec == 'czulosc':
        add(bass(root, BAR * 0.95), t0, gain=0.7)
        add(ep_chord([m + 12 for m in notes[1:]], BEAT * 2), t0, verb=0.6)
        add(ep_chord([m + 12 for m in notes[1:]], BEAT * 2), t0 + 2 * BEAT, gain=0.7, verb=0.6)

# perkusja
for beat in range(int(DUR / BEAT) + 1):
    t = beat * BEAT
    if t >= DUR: break
    sec = section(t + 0.001)
    pos = beat % 4
    if sec in ('groove', 'groove2'):
        if pos in (0, 2):
            add(kick(), t)
        if pos in (1, 3) and t >= 13.2:
            add(clap(), t, pan=0.05, verb=0.25)
        add(hat(), t + BEAT / 2, pan=0.25)
        if beat % 8 == 7:
            add(hat(True), t + BEAT * 0.75, pan=-0.2, gain=0.8)
    elif sec == 'czulosc':
        if pos == 0 and t >= 60.0:
            add(kick(), t, gain=0.35)
        add(hat(), t + BEAT / 2, pan=0.25, gain=0.45)
    elif sec == 'final' and t < 86.4:
        if pos == 0:
            add(kick(), t, gain=0.8)
        add(hat(), t + BEAT / 2, pan=0.25, gain=0.6)

# melodia – serce filmu (Karta wsparcia)
MEL = [(72, 2), (69, 1), (72, 1), (74, 2), (72, 1), (69, 1), (77, 1), (74, 1), (72, 2), (76, 1), (74, 1), (72, 2),
       (72, 2), (69, 1), (72, 1), (74, 2), (77, 1), (76, 1), (74, 1), (72, 1), (69, 2), (67, 2), (69, 2)]
t = 57.6
for m, beats in MEL:
    if t >= 71.4: break
    add(bell(m, beats * BEAT), t, pan=0.1, gain=1.0, verb=0.7)
    t += beats * BEAT

# finał: akord i dzwonki na "Masz plan. Masz wsparcie."
for m in (53, 57, 60, 64, 65, 69):
    add(pad_note(m, 3.6, 0.9), 86.4, pan=(m - 60) / 14, gain=1.05, verb=0.6)
add(bell(72, 2.4), 84.3, gain=0.9, verb=0.7)
add(bell(77, 2.4), 84.9, gain=0.8, verb=0.7)
add(bell(81, 3.0), 86.4, gain=0.7, verb=0.8)
add(bass(41, 3.4), 86.4, gain=0.9)

# efekty pod montaż
for s in TL['scenes'][1:]:
    add(whoosh(0.7), s['t0'] - 0.45, pan=0.0, verb=0.3)
add(riser(1.3), 4.8, verb=0.3)
add(riser(1.2), 70.8, gain=0.8, verb=0.3)
for tt in TL['taps']:
    add(tick(2300, 0.03, 0.028), tt, pan=0.2)
for tt in TL['typing']:
    add(tick(3400, 0.015, 0.012), tt, pan=0.25)

# ---------- pogłos, miks, mastering ----------
ir_len = int(2.2 * SR); ti = np.arange(ir_len) / SR
irL = lowpass(rng.standard_normal(ir_len), 6000) * np.exp(-ti * 2.6)
irR = lowpass(rng.standard_normal(ir_len), 6000) * np.exp(-ti * 2.6)
irL /= np.sqrt(np.sum(irL ** 2)); irR /= np.sqrt(np.sum(irR ** 2))
wetL = fftconvolve(VL, irL)[:N]; wetR = fftconvolve(VR, irR)[:N]
mixL = L + 0.35 * wetL; mixR = R + 0.35 * wetR
mixL = highpass(mixL, 28, 2); mixR = highpass(mixR, 28, 2)
# automatyka: część „czułość” (Karta wsparcia) ok. 3 dB ciszej, finał bez skoku
tt = np.arange(N) / SR
auto = np.ones(N)
auto -= 0.30 * np.clip((tt - 56.2) / 1.2, 0, 1) * np.clip((71.6 - tt) / 0.8, 0, 1)
auto -= 0.22 * np.clip((tt - 86.2) / 0.4, 0, 1)
mixL *= auto; mixR *= auto
# wyciszenie końcówki
fade = np.clip((DUR - tt) / 2.2, 0, 1) ** 1.5
fadein = np.clip(tt / 0.05, 0, 1)
mixL *= fade * fadein; mixR *= fade * fadein
peak = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
mixL /= peak; mixR /= peak
mixL = np.tanh(1.3 * mixL) / np.tanh(1.3); mixR = np.tanh(1.3 * mixR) / np.tanh(1.3)
st = np.stack([mixL, mixR], axis=1) * 0.89
pcm = (st * 32767).astype('<i2')
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('zapisano', OUT, f'{DUR:.1f} s')
