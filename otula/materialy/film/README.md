# Dynamiczny film Otuli

Montaż z autentycznych ekranów i zachowanego nagrania aplikacji. Wynik: 90 sekund, 1920×1080, H.264, 60 kl./s dla kompozycji, AAC stereo. Fragmenty interfejsu zachowują rytm źródła 25 kl./s; nie użyto generatywnego upscalingu.

## Odtworzenie

Wymagane: Python 3, FFmpeg/ffprobe w PATH oraz biblioteki z requirements.txt. Zależności instaluj w wybranym środowisku wirtualnym.

~~~sh
python render.py --preview
python render.py
~~~

Podgląd sceny: python render.py --scene 8 --preview. Render sceny: python render.py --scene 8. Numery od 0 do 11.

Skrypt czyta fonty, logo, ilustracje, zrzuty i source-demo.mp4. Roboczy katalog render jest ignorowany przez Git. Pełne wykonanie generuje MP4, VTT, klatki kontrolne i storyboard. Plakat pochodzi z ustabilizowanej klatki początku.

player.html jest źródłem odtwarzacza publikowanego jako dist/Otula-demo.html. Gotowy film i napisy trafiają do dist. Publikacja wymaga osobnego wdrożenia Sites.

## Dźwięk i obrazy

Podkład to oryginalna kompozycja proceduralna w render.py: syntezowane akordy, pluck, bas i miękka perkusja, 100 BPM. Nie zawiera pobranej piosenki, próbek artysty ani sklonowanego głosu. Docelowo −19 LUFS i true peak do −2 dBTP.

Logo i zasoby pochodzą z Otuli, ilustracje wcześniej przygotowano z ImageGen. Napisy i grafiki montażowe powstały lokalnie. Interfejs nie był generatywnie przerysowywany. Dane są fikcyjne.

## Kontrola

Przed podmianą obejrzyj klatki, przejścia i Kartę wsparcia; sprawdź proporcje ilustracji, tekst w 960×540, metadane, dźwięk, czas i brak czarnych klatek. VTT jest opcjonalny, bo kluczowe hasła są w obrazie. Film pozostaje zrozumiały bez dźwięku.
