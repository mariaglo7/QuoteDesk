# Wyceny Design by Maria: specyfikacja

Data: 22.10.2026, aktualizacja 05.11.2026 (PDF w stylu oferty Harbour Light Co)
Status: do akceptacji przez Marię

## 1. Cel

Aplikacja ma maksymalnie skrócić drogę od zapytania klienta do rozmowy o zleceniu. Maria wkleja wiadomość od klienta, a aplikacja:

* rozpoznaje, czego klient chce, i buduje ofertę z cennika i typu klienta,
* pisze teksty oferty i wiadomość do klienta w jego języku (polski lub angielski),
* tworzy PDF z ofertą w stylu oferty Harbour Light Co,
* tworzy link do skróconej oferty online z przyciskiem „Chcę rozmawiać”,
* pilnuje statusu oferty i podpowiada follow up.

**Sukces:** zwykła wycena (zapytanie z Instagrama lub maila) zajmuje do 5 minut, od wklejenia wiadomości do skopiowania odpowiedzi z PDF i linkiem. PDF wygląda jak oferta, którą Maria złożyła sama.

## 2. Ustalenia z Marią

* Sposób pracy: kierunek 4 (wklej wiadomość) prowadzi do kierunku 1 (Biurko na jednym ekranie).
* Zapytania przychodzą głównie z Instagrama, Facebooka i maila.
* Urządzenia: komputer i telefon.
* Cena = cennik bazowy × mnożnik typu klienta.
* Język: wykrywany z wiadomości klienta, do zmiany jednym kliknięciem.
* Bez klucza API: aplikacja działa jako artefakt na koncie claude.ai Marii i korzysta z Claude w ramach jej planu.
* Wzór PDF: `DESIGN_BY/Oferty/reference_offer.pdf`.
* Link: skrócona oferta na designbymaria.co.uk (Hostinger) z przyciskiem „Chcę rozmawiać”. Bez wyboru wariantu i bez zaliczki w linku.
* Oferta ważna 7 dni.
* Font: tylko Poppins. Bez Caveat.
* Projekt na studia (RGU): komentarz o pomocy Claude na górze każdego pliku z kodem.

## 3. Cennik i zasady liczenia

**Cennik:** Maria uzupełnia go sama w Ustawieniach (kwoty po wrześniowej obniżce). Aplikacja startuje z dwiema stałymi pozycjami: post £35 i opieka nad stroną £50 miesięcznie, i prosi o resztę.

Każda usługa w cenniku ma: nazwę, opis i listę punktów (PL i EN), cenę bazową, oznaczenie „od” (cena orientacyjna), jednostkę (sztuka, miesiąc, podstrona), informację, czy podlega mnożnikowi, oraz kategorię (branding, druk, strona, social media, opieka, inne).

**Mnożniki typu klienta** (do zmiany w Ustawieniach):

| Typ klienta | Mnożnik |
|---|---|
| Jednoosobowa firma | 1.0 (cena bazowa) |
| Mała lokalna firma z lokalem | 1.2 |
| Pośrednik | 1.2 |
| Średnia firma z budżetem na marketing | 1.4 |
| Duża marka lub sieć | 1.6 |

**Zasady:**

* Post (£35) i opieka nad stroną (£50/mies.) nie podlegają mnożnikowi.
* Ceny po mnożniku zaokrąglane w górę do pełnych £5.
* Ekspres (termin krótszy niż 7 dni): +25%, włączany przełącznikiem.
* Dodatkowa runda poprawek: stałe £40 (do zmiany w Ustawieniach).
* Każdą cenę Maria może nadpisać ręcznie.
* Pakiet łączący usługi: suma przekreślona, cena pakietu to suma minus 10%, w dół do najbliższej kwoty kończącej się na 9 (jak w ofercie Harbour Light: £355 na £319, £455 na £409, £834 na £749). Cenę pakietu można nadpisać.
* Hosting i domena nigdy nie są wliczane do ceny strony.

Ceny zawsze liczy kod aplikacji, nie Claude. Claude rozpoznaje usługi i pisze teksty.

## 4. Ekrany

### 4.1 Nowa wycena
Duże pole „Wklej wiadomość od klienta” i przycisk **Przeczytaj**. Claude zwraca: imię i nazwę firmy, język, przypuszczalny typ klienta, usługi z cennika z ilościami i podziałem na sekcje oferty, termin, budżet oraz listę rzeczy, których brakuje. Fragmenty wiadomości, z których coś wynika, są podświetlone na różowo.

Przycisk **Zacznij od zera** pomija Claude i otwiera puste Biurko.

### 4.2 Biurko
Na komputerze dwie kolumny, na telefonie jedna kolumna z zakładkami.

**Lewa strona, układ oferty:** klient, typ klienta, ekspres, sekcja „Czego potrzebujecie”, grafika na okładkę, a pod spodem sekcje oferty, które można dodawać, usuwać i przesuwać:

* **Warianty:** 2 lub 3 karty do wyboru, jedna oznaczona „Polecam”.
* **Usługi:** lista usług z opisem i ceną.
* **Pakiety:** łączą wybrane usługi, jako wiersz z przekreśloną ceną albo ciemny baner.

Każdy tekst można edytować. Przycisk **Napisz teksty** prosi Claude o nagłówki, wstępy, opisy i punkty. Pozycja bez ceny ma oznaczenie „Do sprawdzenia” i blokuje PDF, link oraz wiadomość.

**Prawa strona, trzy zakładki:**

* **Wiadomość:** tekst gotowy do wklejenia w DM lub maila. Przyciski: Kopiuj, Napisz ponownie, Krócej, Cieplej, PL/EN. Zawiera krótki opis oferty, ceny lub zakres cen, 2 rundy poprawek, pytania o braki, link i podpis.
* **PDF:** podgląd i **Pobierz PDF**.
* **Link:** **Kopiuj link do oferty**.

Przycisk **Oznacz jako wysłaną** zapisuje datę wysłania.

### 4.3 Oferty
Lista ofert ze statusem: szkic, wysłana, chce rozmawiać, ustalona, zaliczka wpłacona, odrzucona, wygasła (po 7 dniach). Statusy zmienia Maria jednym kliknięciem. Przy każdej ofercie wartość orientacyjna: suma wariantów „Polecam” i usług. Oferta „wysłana” bez odpowiedzi od 3 dni dostaje oznaczenie i przycisk **Napisz follow up**.

### 4.4 Ustawienia
Cennik, mnożniki, ekspres, cena dodatkowej rundy, rabat pakietowy, warunki (PL i EN), treść instrukcji Hostingera (PL i EN), teksty kart „W cenie” i „Pliki”, podpis, adres strony z ofertami i klucz do podpisywania linków.

## 5. PDF z ofertą

**Wzór:** `reference_offer.pdf`. A4, czysta biel, Poppins (Light, Medium, SemiBold), tekst w brązie #1E1613, szare opisy, cienkie jasne linie, różowe akcenty #FF7AE5. Tekst w PDF jest prawdziwym tekstem, nie obrazkiem.

**Okładka:**
* Po lewej: logo, wielki nagłówek „Oferta dla [firma]” z różową kropką, „Dla: [imię]”, data ważności, a na dole sekcja „Czego potrzebujecie” (wiersze: etykieta i opis).
* Po prawej ciemny panel na całą wysokość: grafika klienta, a gdy jej nie ma, białe logo Design by Maria. Na dole panelu lista nazw sekcji oferty.

**Kolejne strony:** nagłówek z małym logo, po prawej „Oferta dla [firma]” i numer strony, cienka linia. Każda sekcja ma rozstrzelony mały nadtytuł, duży tytuł z różową kropką i szary wstęp.

**Klocki:**
* Karty wariantów (2 lub 3 w rzędzie, równa wysokość): nazwa, podtytuł, cena, „/ mies.” przy miesięcznych, punkty z różową kropką. Karta polecana jest ciemna z różową etykietą „Polecam”.
* Wiersze usług: nazwa, opis, cena po prawej, „od £250”, opcjonalna mała notka pod ceną („8 kart”).
* Wiersze pakietów: nazwa, cena przekreślona, cena pakietu.
* Baner pakietu: ciemny, różowy tytuł, lista z ptaszkami w dwóch kolumnach, cena przekreślona, duża cena, podpis „jednorazowo”.
* Trzy karty informacji: W cenie, Pliki, Czas.
* Notka drobnym drukiem pod sekcją.

**Koniec oferty:** blok „Warunki” w dwóch kolumnach (Płatność, Poprawki, Prawa, a przy druku Druk, przy stronach Hosting), jak w ofercie Harbour Light. Przy stronach dodatkowa strona z instrukcją Hostingera. Link do oferty online jako mała linijka pod warunkami.

**Składanie stron:** aplikacja mierzy każdy klocek. Klocek, który się nie mieści, przechodzi w całości na następną stronę, a tytuł sekcji nigdy nie zostaje sam na dole strony. Długa nazwa firmy zawija się i zmniejsza na okładce.

* Język PDF taki sam jak język wiadomości. Forma „Wy” lub „Ty” zależnie od klienta.
* Nazwa pliku: `klient_oferta_RRRRMMDD.pdf`, np. `bakehouseaberdeen_oferta_20261022.pdf` (nazwa firmy bez spacji i polskich znaków).
* Bez numeru konta w PDF.

## 6. Strona oferty online (Hostinger)

**Adres:** `designbymaria.co.uk/oferta/` (jeden folder na serwerze, wgrany raz).

**Jak działa:**

1. Aplikacja zapisuje skrót oferty w samym linku, po znaku `#`. Ta część linku nie trafia do logów serwera. Link jest podpisany tajnym kluczem, więc nikt nie zmieni w nim ceny.
2. Skrót to nazwy sekcji, wariantów i usług z cenami. Pełne opisy są w PDF, dzięki czemu link pozostaje krótki i nie psuje się w Instagramie.
3. Klient widzi skróconą ofertę w tym samym stylu i przycisk **Chcę rozmawiać**.
4. Po kliknięciu serwer sprawdza podpis i wysyła Marii maila „Bakehouse Aberdeen chce porozmawiać o ofercie”. Klient widzi podziękowanie i informację, że Maria się odezwie.
5. Po 7 dniach strona pokazuje „Oferta wygasła, napisz do mnie po aktualną”.
6. Maria w aplikacji zmienia status na „chce rozmawiać”. Aplikacja nie może sama odczytać tego z serwera, bo artefakty nie łączą się z innymi stronami.

**Pliki na serwerze:** `index.html` (wygląd), `contact.php` (sprawdzenie podpisu i mail), `config.php` (klucz i adres maila). Maria wgrywa je raz przez Menedżer plików Hostingera według instrukcji krok po kroku.

## 7. Jak działa w środku (dla porządku)

* **Aplikacja:** strona HTML z modułami JS opublikowana jako artefakt na koncie Marii.
* **Uprawnienia artefaktu:**
  * `sample` (Claude czyta wiadomości i pisze teksty),
  * `db` (cennik, ustawienia, oferty, zapisane prywatnie tylko dla Marii),
  * `assets` (grafiki na okładki),
  * `downloads` (zapis PDF),
  * `user` (sprawdzenie, że to Maria).
* **Claude:** trzy rodzaje zadań: odczyt wiadomości, teksty oferty, wiadomość do klienta. W instrukcji: ton Marii, podpis, zasady płatności i zakaz myślników. Kod dodatkowo usuwa myślniki z gotowego tekstu.
* **PDF:** rysowany w przeglądarce biblioteką jsPDF z własnymi klockami układu i wbudowanym fontem Poppins, z polskimi znakami.
* **Link:** dane skompresowane i podpisane (HMAC SHA256). Ten sam klucz jest w Ustawieniach i w `config.php`.
* Kod i napisy w kodzie po angielsku, interfejs po polsku.

## 8. Gdy coś pójdzie nie tak

* Claude niedostępny albo brak zgody: komunikat i ręczny tryb (puste Biurko, teksty z cennika, wiadomość z szablonu PL/EN).
* Za dużo zapytań do Claude: komunikat „Spróbuj za chwilę”, bez automatycznego ponawiania.
* Claude nie rozpozna usługi: pozycja „Do sprawdzenia” z oryginalnym fragmentem, cena do wpisania ręcznie.
* Pusty cennik: aplikacja prowadzi do Ustawień, zanim pozwoli liczyć.
* Brak klucza do linków: zakładka Link pokazuje, co uzupełnić.
* Zapis danych niedostępny (np. otwarcie poza claude.ai): aplikacja zapisuje w tej przeglądarce i pokazuje pasek „Zapis tylko na tym urządzeniu”.
* Zmieniony albo uszkodzony link: strona oferty pokazuje „Ten link jest nieprawidłowy” i nie pokazuje przycisku.

## 9. Sprawdzenie przed oddaniem

* Testy automatyczne dla liczenia ceny (mnożniki, wyjątki, zaokrąglenia, ekspres, pakiety) i dla podpisywania linków (poprawny, zmieniony, wygasły).
* **Test wzoru:** odtworzenie oferty Harbour Light w aplikacji i porównanie stron PDF z oryginałem obok siebie.
* Test `contact.php` na serwerze: poprawny podpis, zły podpis, wygasła oferta, podwójne kliknięcie.
* Próba na 3 prawdziwych typach wiadomości: DM po polsku, mail po angielsku, krótki niejasny DM.
* Sprawdzenie na szerokości telefonu i komputera.
* PDF: polskie znaki, łamanie stron, nazwa pliku, brak myślników.

## 10. Poza pierwszą wersją

Faktury z oferty, formularz briefu dla klienta, wybór wariantu i akceptacja z zaliczką w linku, wiadomości na każdy etap projektu z licznikiem poprawek, podpowiedź ceny z historii, notatka głosowa.

## 11. Potwierdzone przez Marię

* Ekspres +25%. Dodatkowa runda poprawek stałe £40.
* Maile z linku: info@designbymaria.co.uk.
* Okładka: grafika klienta albo białe logo.
* Link: tylko „Chcę rozmawiać”.
* Maria ma plan na Hostingerze. Obsługę PHP i funkcji mail sprawdzamy przy wgrywaniu plików. Gdyby mail z PHP nie działał, wysyłka idzie przez SMTP skrzynki info@ na Hostingerze.
