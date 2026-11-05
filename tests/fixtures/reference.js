// Code written with help from Claude (Anthropic)
// The reference offer rebuilt as a Quote. Prices are overrides so the fixture does not depend on a price list.

const item = (id, name, price, extra = {}) => ({
  id, serviceId: null, name, subtitle: '', description: '', bullets: [], qty: 1,
  unitPriceOverride: price, priceFrom: false, subNote: '', sourceQuote: null, ...extra,
});

export const REFERENCE = {
  id: 'reference', kind: 'quote', createdAt: '2026-10-20T12:00:00Z', sentAt: null, status: 'draft',
  client: { name: 'Alex Morgan', company: 'Harbour Light Co', email: '' },
  lang: 'pl', address: 'wy', clientTypeId: 'sole', rush: false, deadline: null,
  coverAssetId: null, sourceMessage: '', missing: [], message: '',
  needs: [
    { label: 'Katalog', text: 'Profesjonalny katalog w stylu premium, który przyciąga uwagę, jest czytelny i pasuje do ciemnej kolorystyki strony. Wszystkie obecne informacje zostają.' },
    { label: 'Pliki', text: 'PDF do wysyłki mailem oraz PDF do druku.' },
    { label: 'Ulotka', text: 'Ulotka A5 dwustronna na spotkania z firmami i do showroomów. Dobre pierwsze wrażenie, telefon i prośba o katalog.' },
    { label: 'Marketing', text: 'Pokazanie nowego produktu na rynku UK wszystkim grupom klientów: firmom, architektom, showroomom i klientom prywatnym.' },
  ],
  coverList: ['Katalog produktów', 'Ulotka A5', 'Marketing marki'],
  sections: [
    {
      id: 's1', type: 'options', eyebrow: 'Katalog i ulotka', title: 'Dwie wersje katalogu',
      intro: 'Obie wersje mają nowy, spójny projekt w ciemnej kolorystyce marki. Różnią się tylko zdjęciami.',
      note: '', recommendedId: 'k2',
      items: [
        item('k1', 'Katalog', 280, { subtitle: 'na Waszych zdjęciach', bullets: [
          'Nowy układ wszystkich stron, mniej powtarzalny i bardziej premium',
          'Wszystkie obecne informacje, możliwie mniej stron',
          'Czytelne tabele specyfikacji w jednym wzorze',
          'Lekka korekta tekstów, nazw i numeracji',
          'Wybór i dopasowanie obecnych zdjęć',
        ] }),
        item('k2', 'Katalog z nowymi zdjęciami', 380, { subtitle: 'wizualizacje AI ode mnie', bullets: [
          'Wszystko z wersji obok',
          'Do 12 nowych, realistycznych zdjęć paneli we wnętrzach: piwnica, łazienka, biuro, korytarz, spa',
          'Naturalne światło i tekstury, bez sztucznego wyglądu',
          'Zdjęcia możecie używać też na stronie i w social media',
        ] }),
      ],
    },
    {
      id: 's2', type: 'services', eyebrow: '', title: '', intro: '', note: '',
      items: [item('u1', 'Ulotka A5 dwustronna', 75, { description: 'W stylu katalogu. Przód: mocne pierwsze wrażenie i czym jest Harbour Light Co. Tył: najważniejsze korzyści i serie, telefon oraz kod QR do katalogu.' })],
    },
    {
      id: 's3', type: 'bundles', eyebrow: '', title: '', intro: '', note: '', style: 'rows',
      bundles: [
        { id: 'b1', name: 'Pakiet: katalog i ulotka', itemIds: ['k1', 'u1'], priceOverride: null, caption: '' },
        { id: 'b2', name: 'Pakiet: katalog z nowymi zdjęciami i ulotka', itemIds: ['k2', 'u1'], priceOverride: null, caption: '' },
      ],
    },
    {
      id: 's4', type: 'info',
      included: 'Dwie rundy poprawek do katalogu i dwie do ulotki.',
      files: 'PDF do wysyłki, PDF do druku w CMYK ze spadami 3 mm, pliki do edycji.',
      time: 'Termin realizacji do ustalenia z klientem.',
    },
    {
      id: 's5', type: 'options', eyebrow: 'Marketing co miesiąc', title: 'Pakiety social media i reklam',
      intro: 'Nowy produkt na rynku UK potrzebuje regularnej obecności tam, gdzie są Wasi klienci. Facebook i Instagram dla klientów prywatnych i showroomów, LinkedIn dla firm i architektów. Wszystkie posty powstają na nowych, realistycznych zdjęciach i video AI Waszych paneli we wnętrzach.',
      note: 'Budżet na płatne reklamy opłacacie bezpośrednio w Meta, osobno od pakietu. Na start polecam od £150 miesięcznie. Pakiety rozliczane są co miesiąc, rezygnacja z 30 dniowym wyprzedzeniem.',
      recommendedId: 'm2', newPage: true,
      items: [
        item('m1', 'Start', 199, { monthly: true, subtitle: 'Facebook i Instagram', bullets: ['8 postów miesięcznie na nowych zdjęciach AI Waszych paneli', 'Stories z produktami', 'Opisy i hashtagi', 'Planowanie publikacji', 'Uporządkowanie profili'] }),
        item('m2', 'Wzrost', 329, { monthly: true, subtitle: 'Facebook, Instagram i LinkedIn', bullets: ['12 postów miesięcznie na nowych zdjęciach AI, w tym 2 reels', 'Prowadzenie LinkedIn dla firm i architektów', 'Prowadzenie reklam na Facebooku i Instagramie', 'Krótki raport co miesiąc'] }),
        item('m3', 'Premium', 479, { monthly: true, subtitle: 'pełna obsługa marki', bullets: ['Wszystko z pakietu Wzrost', '16 postów miesięcznie na nowych zdjęciach AI, w tym 4 reels', 'Posty w wizytówce Google'] }),
      ],
    },
    {
      id: 's6', type: 'services', eyebrow: 'Na start', title: 'Usługi jednorazowe', intro: '', note: '', newPage: true,
      items: [
        item('o1', 'Wizytówka Google i SEO', 180, { description: 'Założenie i pełne uzupełnienie wizytówki Google ze zdjęciami, żeby klienci znajdowali Was w Mapach i wyszukiwarce. Do tego podstawowe SEO strony i katalog do pobrania.' }),
        item('o2', 'Odświeżenie strony internetowej', 250, { priceFrom: true, description: 'Poprawa wyglądu i czytelności strony, żeby pasowała do nowego katalogu i lepiej zamieniała odwiedzających w zapytania. Dokładna cena po przeglądzie strony.' }),
        item('o3', 'Karty techniczne serii', 120, { subNote: '8 kart', description: 'Osobna jednostronicowa karta PDF dla każdej serii (A, B, C, D, E, F, G, H): zdjęcie, opis i specyfikacja. Dla architektów i projektantów do pobrania ze strony lub wysłania mailem.' }),
        item('o4', 'Materiały dla showroomów', 90, { priceFrom: true, description: 'Plakat przy ekspozycji produktu i projekt stojaka na ulotki w stylu katalogu. Dla showroomów partnerskich, którym obiecujecie materiały sprzedażowe.' }),
      ],
    },
    {
      id: 's7', type: 'bundles', eyebrow: '', title: '', intro: '', note: '', style: 'banner',
      bundles: [{
        id: 'b3', name: 'Pakiet Start na rynku UK', itemIds: ['k2', 'u1', 'o1', 'm1'], priceOverride: null, caption: 'jednorazowo',
        labels: ['Katalog z nowymi zdjęciami', 'Ulotka A5 dwustronna', 'Wizytówka Google i SEO', 'Pierwszy miesiąc pakietu Start'],
      }],
    },
  ],
};
