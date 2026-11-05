# Jak wgrać stronę oferty na Hostinger

Robisz to tylko raz.

1. W folderze `hostinger/oferta` zrób kopię pliku `config.sample.php` i nazwij ją `config.php`.
2. W aplikacji wejdź w Ustawienia, sekcja Link do oferty, i kliknij **Kopiuj klucz**.
3. W `config.php` wklej klucz między apostrofy w linii `SECRET`.
4. Zaloguj się do Hostingera, otwórz **Menedżer plików** i wejdź do `public_html`.
5. Utwórz folder `oferta`.
6. Wgraj do niego: `index.html`, `offer.js`, `offer-page.js`, `contact.php`, `config.php`. Nie wgrywaj tej instrukcji ani `config.sample.php`.

## Sprawdzenie

W pliku `hostinger/test-links.txt` są trzy linki testowe. Na czas testu wpisz w `config.php` klucz podany w pierwszej linii tego pliku, a po teście wstaw z powrotem swój.

* **Valid:** widzisz ofertę. Kliknij dwa razy **Chcę rozmawiać**, na info@designbymaria.co.uk ma przyjść jeden mail.
* **Edited:** widzisz „Ten link jest nieprawidłowy”.
* **Expired:** widzisz „Oferta wygasła”.

Jeśli mail nie przychodzi, sprawdź spam. Gdy dalej go nie ma, daj znać, przestawimy wysyłkę na skrzynkę SMTP z Hostingera.
