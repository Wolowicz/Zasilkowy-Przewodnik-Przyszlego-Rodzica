# Otula — wskazówki pracy z repozytorium

- Frontend jest w `otula/dist`, serwer AI w `otula-asystent`. Nie zmieniaj opublikowanych domen ani sekretów bez zakresu zadania.
- Czytaj `docs/ARCHITEKTURA.md`, `docs/REGULY-I-ZRODLA.md` i `CONTRIBUTING.md` przed zmianami.
- Zachowaj istniejące zmiany użytkownika, stabilne ID spraw i lokalne dane. Nie importuj starych kopii projektu jako aktualnej wersji.
- Routing hash i przycisk powrotu mają działać na telefonie; nie przywracaj dialogów zamiast ekranów.
- Karta wsparcia: uprzejma prośba, „proszę”, podziękowanie, Ty/Pani/Pan. Pola `ask` i `reason` nowych spraw muszą pasować do szablonu.
- Terminy i reguły świadczeń wymagają źródła, daty i testu. AI nie podejmuje decyzji o uprawnieniu.
- Białe/jasne tło, pastele brzoskwiniowe, żółte i różowe; ciemny tekst, cel kontrastu 4,5:1; sprawdź 320–390 px.
- `npm test`, `npm run build:assistant` i `npm run sources` to podstawowe polecenia. Nie wprowadzaj kluczy do frontendu lub repozytorium.
- Notatki w `docs/historia` są materiałami historycznymi. Bieżący zakres opisują README i docs.
- Wygląd: każdą zmianę interfejsu wykonuj według `docs/STYL-I-DESIGN.md` (paleta, typografia, komponenty, lista kontrolna). Nie wprowadzaj nowych kolorów, trójkątów ▶ ani surowych kontrolek.
