// Code written with help from Claude (Anthropic)
// Polish text is the key; English comes from the dictionary. {v} and {n} are filled from vars.

export const EN = {
  'Nowa wycena': 'New quote', 'Oferty': 'Offers', 'Ustawienia': 'Settings',
  'Główne': 'Main', 'Zapis tylko na tym urządzeniu.': 'Saved on this device only.',
  'Cennik ma tylko post i opiekę nad stroną. ': 'The price list only has a post and website care. ',
  'Uzupełnij cennik': 'Complete the price list', 'Skopiowano': 'Copied',
  'Klucz API jest nieprawidłowy. Sprawdź go w Ustawieniach.': 'The API key is not valid. Check it in Settings.',
  'Claude odmówił odpowiedzi. Uzupełnij ten fragment ręcznie.': 'Claude declined to answer. Fill in this part by hand.',
  'Dodaj swój klucz API w Ustawieniach, żeby Claude czytał wiadomości. Bez klucza uzupełnisz ofertę ręcznie.': 'Add your API key in Settings so Claude can read messages. Without a key you complete the offer by hand.',
  'Klucz API Anthropic': 'Anthropic API key', 'Claude': 'Claude',
  'Wklej własny klucz API z console.anthropic.com. Klucz zostaje tylko w tej przeglądarce i nie trafia do kopii zapasowej. Koszt zapytań płacisz na swoim koncie Anthropic. Wiadomości klientów są wysyłane do Anthropic, więc usuń z nich dane wrażliwe.': 'Paste your own API key from console.anthropic.com. The key stays only in this browser and is never included in backups. Requests are billed to your Anthropic account. Client messages are sent to Anthropic, so remove sensitive details first.',
  'Zapisano klucz': 'Key saved', 'Zapisz klucz': 'Save key', 'Usunięto klucz': 'Key removed', 'Usuń klucz': 'Remove key',
  'To nie jest kopia zapasowa QuoteDesk.': 'This is not a QuoteDesk backup.', 'Kopia zawiera ofert: {n}. Wczytanie zastąpi Twoje ustawienia.': 'The backup holds {n} offers. Loading it replaces your settings.',
  'Wczytano kopię zapasową': 'Backup loaded', 'Wczytaj i zastąp': 'Load and replace', 'Kopia zapasowa': 'Backup',
  'Zapisz kopię ustawień i ofert w pliku. Bez klucza API i bez klucza do linków.': 'Save your settings and offers to a file. API key and link key are left out.',
  'Pobierz kopię zapasową': 'Download backup', 'Wczytaj kopię': 'Load backup',
  'Co zyskujecie': 'What you gain', 'Bez obietnic liczb i wyników. Sprawdź tekst przed wysłaniem.': 'No promised numbers or results. Check the text before sending.',
  'Napisz z Claude': 'Write with Claude', 'Claude pisze sekcję „Co zyskujecie”…': 'Claude is writing the "What you gain" section…',
  'Zakres rynkowy z Twojego researchu. Aplikacja pokaże, gdzie wypada Twoja cena.': 'Market range from your own research. The app shows where your price sits.',
  'Rynek od': 'Market from', 'Rynek do': 'Market to', 'Źródło': 'Source', 'np. cenniki 5 studiów z Aberdeen': 'e.g. price lists of 5 local studios',
  'Data sprawdzenia': 'Date checked', 'poniżej rynku': 'below market', 'w zakresie rynku': 'within market', 'powyżej rynku': 'above market',
  'Uzupełnij profil firmy, żeby oferty miały Twoje dane. ': 'Fill in your business profile so offers carry your details. ',
  'Otwórz Ustawienia': 'Open Settings', 'Cennik nie ma jeszcze cen. ': 'Your price list has no prices yet. ',
  'Usuń logo': 'Remove logo', 'Profil firmy': 'Business profile', 'Te dane pojawiają się w PDF, w wiadomościach i w podpisie.': 'These details appear in the PDF, in messages and in your signature.',
  'Nazwa firmy': 'Business name', 'E-mail': 'Email', 'Strona www': 'Website', 'Waluta': 'Currency', 'Rundy poprawek w cenie': 'Revision rounds included',
  'Kolor ciemny w PDF': 'PDF dark colour', 'Kolor akcentu w PDF': 'PDF accent colour', 'Logo na jasne tło': 'Logo for light backgrounds',
  'Logo na ciemne tło (opcjonalnie)': 'Logo for dark backgrounds (optional)', 'Adres strony z ofertami (puste wyłącza linki)': 'Offer page address (empty turns links off)', 'Zapisuję…': 'Saving…', 'Zapisano': 'Saved',
  'Oferta się zmieniła. Napisz wiadomość ponownie.': 'The offer changed. Write the message again.',
  'Wiadomość została ucięta, napisz ją ponownie.': 'The message was cut off, write it again.',
  'Część tekstu nie zmieściła się w PDF. Skróć: {v}': 'Some text did not fit in the PDF. Shorten: {v}',
  'Oferta czeka na liście ofert.': 'The offer is waiting in your offers list.',
  'Sprawdź ilość, Claude jej nie odczytał.': 'Check the quantity, Claude could not read it.',
  'Zaznaczono tekst, skopiuj go ręcznie': 'Text selected, copy it manually',
  'Spróbuj za chwilę.': 'Try again in a moment.',
  'Claude niedostępny, uzupełnij ofertę ręcznie.': 'Claude is not available, complete the offer by hand.',
  'Claude nie odpowiedział. Spróbuj ponownie albo uzupełnij ręcznie.': 'Claude did not reply. Try again or complete it by hand.',
  'Nie udało się uruchomić aplikacji. Odśwież stronę.': 'The app could not start. Refresh the page.',
  // Inbox
  'Wklej wiadomość od klienta': 'Paste the client message',
  'Mail, DM z Instagrama albo notatka z rozmowy. Claude rozpozna, czego klient potrzebuje, a Ty sprawdzisz ceny.': 'An email, an Instagram DM or a call note. Claude finds what the client needs and you check the prices.',
  'Hej! Otwieram piekarnię w Aberdeen i potrzebuję logo i prostej strony…': 'Hi! I am opening a bakery in Aberdeen and need a logo and a simple website…',
  'Wklej najpierw wiadomość od klienta.': 'Paste the client message first.',
  'Czytam wiadomość…': 'Reading the message…', 'Przeczytaj': 'Read message', 'Zacznij od zera': 'Start from scratch',
  
  // Settings
  'sztuka': 'item', 'podstrona': 'page', 'miesiąc': 'month', 'Branding': 'Branding', 'Druk': 'Print', 'Strona': 'Website', 'Social media': 'Social media', 'Opieka': 'Care', 'Inne': 'Other',
  'Nowa usługa': 'New service', 'Nazwa PL': 'Name PL', 'Nazwa EN': 'Name EN', 'Cena bazowa': 'Base price', 'Jednostka': 'Unit', 'Kategoria': 'Category',
  'Podlega mnożnikowi i ekspresowi': 'Uses the multiplier and rush fee', 'Cena „od”': '"From" price',
  'Opis PL': 'Description PL', 'Opis EN': 'Description EN', 'Punkty PL, jeden w linii': 'Points PL, one per line', 'Punkty EN, jeden w linii': 'Points EN, one per line',
  'Usuń usługę': 'Remove service', 'Masz niezapisane zmiany': 'You have unsaved changes', 'Zapisano ustawienia': 'Settings saved',
  'Nie udało się zapisać. Spróbuj ponownie.': 'Saving failed. Try again.', 'Cennik': 'Price list',
  'Wpisz kwoty po obniżce. Opisy i punkty są opcjonalne, Claude je napisze przy ofercie.': 'Enter your current prices. Descriptions and points are optional, Claude writes them for each offer.',
  'Dodaj usługę': 'Add service', 'Mnożniki i zasady': 'Multipliers and rules', 'Ekspres (0.25 to +25%)': 'Rush fee (0.25 is +25%)',
  'Dodatkowa runda poprawek': 'Extra revision round', 'Rabat pakietowy (0.1 to 10%)': 'Bundle discount (0.1 is 10%)',
  'Teksty oferty': 'Offer texts', 'W tekście poprawek {extraRound} zamienia się na kwotę z ustawień.': 'In the revisions text {extraRound} becomes the amount from Settings.',
  'W cenie PL': 'Included PL', 'W cenie EN': 'Included EN', 'Pliki PL': 'Files PL', 'Pliki EN': 'Files EN',
  'Instrukcja Hostingera PL, krok w linii': 'Hostinger guide PL, one step per line', 'Instrukcja Hostingera EN, krok w linii': 'Hostinger guide EN, one step per line',
  'Podpis': 'Signature', 'Link do oferty': 'Offer link', 'Adres strony z ofertami': 'Offer page address',
  'Klucz do podpisywania linków, wklej go do config.php na serwerze': 'Link signing key, paste it into config.php on the server',
  'Kopiuj klucz': 'Copy key', 'Zapisz ustawienia': 'Save settings',
  // Sections
  'Warianty': 'Options', 'Usługi': 'Services', 'Pakiety': 'Bundles', 'Karty W cenie, Pliki, Czas': 'Included, Files, Timing cards',
  'Dodaj z cennika…': 'Add from price list…', 'Pozycja własna': 'Custom item', 'Dodaj pozycję': 'Add item',
  'Nazwa': 'Name', 'Ilość': 'Qty', 'Cena ręczna': 'Manual price', 'Polecam': 'Recommended', 'Usuń': 'Remove',
  'Z wiadomości: „{v}”': 'From the message: "{v}"', 'Podtytuł': 'Subtitle', 'Punkty, jeden w linii': 'Points, one per line', 'Opis': 'Description',
  'Mała notka pod ceną': 'Small note under the price', 'Nazwa pakietu': 'Bundle name', 'Bez nazwy': 'No name',
  'Przesuń wyżej': 'Move up', 'Przesuń niżej': 'Move down', 'Wyżej': 'Up', 'Niżej': 'Down',
  'Mały nadtytuł': 'Small overline', 'Tytuł': 'Title', 'Wstęp': 'Intro', 'Dodaj 2 lub 3 warianty.': 'Add 2 or 3 options.',
  'Wygląd': 'Style', 'Wiersze z przekreśloną ceną': 'Rows with a crossed out price', 'Ciemny baner': 'Dark banner', 'Dodaj pakiet': 'Add bundle',
  'W cenie': 'Included', 'Pliki': 'Files', 'Czas': 'Timing', 'Termin realizacji do ustalenia.': 'Delivery date to be agreed.',
  'Notka pod sekcją': 'Note under the section', 'Dodaj sekcję:': 'Add section:', 'Do sprawdzenia': 'To check',
  // Desk
  'Wartość orientacyjna: ': 'Estimated value: ', 'Uzupełnij ceny „Do sprawdzenia”': 'Fill in the "To check" prices',
  'Claude pisze teksty oferty…': 'Claude is writing the offer texts…', 'Claude pisze wiadomość…': 'Claude is writing the message…',
  'Wiadomość do klienta': 'Message to the client', 'Tu pojawi się wiadomość do klienta.': 'The client message appears here.',
  'Napisz ponownie': 'Write again', 'Napisz wiadomość': 'Write message', 'Krócej': 'Shorter', 'Cieplej': 'Warmer', 'Kopiuj': 'Copy',
  'Przygotowuję podgląd…': 'Preparing the preview…', 'Nie udało się zapisać PDF.': 'The PDF could not be saved.',
  'Podgląd pojawi się, gdy oferta będzie mieć sekcje i ceny.': 'The preview appears when the offer has sections and prices.',
  'Strona {n}': 'Page {n}', 'Podgląd jest niedostępny, ale PDF możesz pobrać.': 'The preview is not available, but you can download the PDF.', 'Pobierz PDF': 'Download PDF',
  'Brakuje klucza do linków. Uzupełnij go w Ustawieniach.': 'The link key is missing. Add it in Settings.',
  'Klient zobaczy skrót oferty i przycisk „Chcę rozmawiać”. Pełne opisy są w PDF.': 'The client sees an offer summary and a "Let\'s talk" button. Full descriptions are in the PDF.',
  'Kopiuj link do oferty': 'Copy offer link', 'Najpierw dodaj sekcje i uzupełnij wszystkie ceny.': 'First add sections and fill in all prices.',
  'Wiadomość': 'Message', 'Link': 'Link', 'Nie udało się zapisać oferty.': 'The offer could not be saved.', 'Oznaczono jako wysłaną': 'Marked as sent',
  'Oznacz jako wysłaną': 'Mark as sent', 'Wysłana': 'Sent', 'Wszystkie oferty': 'All offers', 'Polski': 'Polish', 'Angielski': 'English', 'Ty': 'Informal (ty)', 'Wy': 'Plural (wy)',
  'Klient': 'Client', 'Firma': 'Company', 'Imię i nazwisko': 'Full name', 'Język oferty': 'Offer language', 'Forma zwrotu': 'Form of address',
  'Ekspres +{n}%': 'Rush +{n}%', 'Termin: {v}': 'Deadline: {v}', 'Budżet: {v}': 'Budget: {v}', 'Wiadomość od klienta': 'Client message', 'Czego brakuje:': 'What is missing:',
  'Etykieta': 'Label', 'Nie udało się dodać grafiki.': 'The image could not be added.', 'Okładka': 'Cover', 'Dodaj wiersz „Czego potrzebujecie”': 'Add a "What you need" row',
  'Grafika w ciemnym panelu, bez niej pokaże się Twoje logo': 'Image for the dark panel, without it your logo is shown', 'Usuń grafikę': 'Remove image',
  'Napisz teksty': 'Write texts', 'Nowa oferta': 'New offer',
  // Quotes
  'Szkic': 'Draft', 'Chce rozmawiać': 'Wants to talk', 'Ustalona': 'Agreed', 'Zaliczka wpłacona': 'Deposit paid', 'Odrzucona': 'Rejected', 'Wygasła': 'Expired',
  'Claude pisze follow up…': 'Claude is writing the follow up…', 'Follow up': 'Follow up', '{n} dni bez odpowiedzi': '{n} days without a reply', 'Napisz follow up': 'Write follow up',
  'Zmień status': 'Change status', 'Ładuję oferty…': 'Loading offers…', 'Nie udało się wczytać ofert. Odśwież stronę.': 'The offers could not be loaded. Refresh the page.',
  'wysłane w tym miesiącu': 'sent this month', 'ustalone w tym miesiącu': 'agreed this month', 'Brak ofert. Wklej pierwszą wiadomość od klienta.': 'No offers yet. Paste your first client message.',
};

let lang = 'pl';

export function setUiLang(next) {
  lang = next === 'en' ? 'en' : 'pl';
}

export const uiLang = () => lang;

export function t(text, vars = {}) {
  const base = lang === 'en' ? EN[text] ?? text : text;
  return base.replace(/\{(v|n)\}/g, (_, key) => vars[key] ?? '');
}
