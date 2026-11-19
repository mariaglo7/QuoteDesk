// Code written with help from Claude (Anthropic)
// Default settings. Prices other than post and website care are entered by Maria in Settings.

export const DEFAULT_SETTINGS = {
  clientTypes: [
    { id: 'sole', labelPl: 'Jednoosobowa firma', labelEn: 'Sole trader', multiplier: 1 },
    { id: 'local', labelPl: 'Mała firma z lokalem', labelEn: 'Local business', multiplier: 1.2 },
    { id: 'intermediary', labelPl: 'Pośrednik', labelEn: 'Intermediary', multiplier: 1.2 },
    { id: 'medium', labelPl: 'Średnia firma', labelEn: 'Medium company', multiplier: 1.4 },
    { id: 'large', labelPl: 'Duża marka lub sieć', labelEn: 'Large brand', multiplier: 1.6 },
  ],
  profile: {
    businessName: '', ownerName: '', email: '', website: '',
    logoLight: null, logoDark: null,
    dark: '#2B211D', accent: '#2F6FDE', currency: 'GBP', includedRounds: 2,
  },
  rushRate: 0.25,
  extraRoundPrice: 40,
  bundleDiscount: 0.1,
  depositRate: 0.5,
  validityDays: 7,
  followUpDays: 3,
  // Examples for creative freelancers. Prices stay empty: every user enters their own.
  priceList: [
    {
      id: 'logo', namePl: 'Logo', nameEn: 'Logo',
      descPl: 'Projekt logo z plikami do druku i internetu.',
      descEn: 'Logo design with files for print and web.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'item', category: 'branding', applyMultiplier: true,
    },
    {
      id: 'post', namePl: 'Post w social media', nameEn: 'Social media post',
      descPl: 'Grafika, opis i hashtagi gotowe do publikacji.',
      descEn: 'Graphic, caption and hashtags ready to publish.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'item', category: 'social', applyMultiplier: false,
    },
    {
      id: 'social-monthly', namePl: 'Social media co miesiąc', nameEn: 'Monthly social media',
      descPl: 'Regularne posty i planowanie publikacji.',
      descEn: 'Regular posts and scheduling.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'month', category: 'social', applyMultiplier: false,
    },
    {
      id: 'website-page', namePl: 'Strona internetowa, podstrona', nameEn: 'Website page',
      descPl: 'Projekt i wykonanie jednej podstrony.',
      descEn: 'Design and build of one page.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'page', category: 'website', applyMultiplier: true,
    },
    {
      id: 'flyer', namePl: 'Ulotka', nameEn: 'Flyer',
      descPl: 'Projekt ulotki z plikiem do druku.',
      descEn: 'Flyer design with a print ready file.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'item', category: 'print', applyMultiplier: true,
    },
    {
      id: 'photo-session', namePl: 'Sesja zdjęciowa', nameEn: 'Photo session',
      descPl: 'Sesja z wyborem i obróbką zdjęć.',
      descEn: 'Shoot with selected and edited photos.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'item', category: 'other', applyMultiplier: true,
    },
    {
      id: 'care', namePl: 'Opieka nad stroną', nameEn: 'Website care',
      descPl: 'Aktualizacje, drobne zmiany i kontrola działania strony.',
      descEn: 'Updates, small changes and regular checks of your website.',
      bulletsPl: [], bulletsEn: [], market: null,
      price: null, priceFrom: false, unit: 'month', category: 'care', applyMultiplier: false,
    },
  ],
  terms: {
    pl: [
      { key: 'payment', bold: 'Płatność', text: 'przelewem: 50% przed startem, 50% przy przekazaniu plików, termin 7 dni.' },
      { key: 'revisions', bold: 'Poprawki', text: ': {rounds} w cenie, każda kolejna runda {extraRound}.' },
      { key: 'rights', bold: 'Prawa', text: 'do projektów przechodzą na klienta po pełnej płatności.' },
      { key: 'print', bold: 'Druk', text: 'zamawia klient w wybranej drukarni. Przygotuję pliki pod jej wymagania.' },
      { key: 'hosting', bold: 'Hosting', text: 'i domenę klient kupuje na swoim koncie, nie są wliczone w cenę strony.' },
    ],
    en: [
      { key: 'payment', bold: 'Payment', text: 'by bank transfer: 50% before we start, 50% on handover, due in 7 days.' },
      { key: 'revisions', bold: 'Revisions', text: ': {rounds} included, each extra round {extraRound}.' },
      { key: 'rights', bold: 'Rights', text: 'to the designs pass to the client after full payment.' },
      { key: 'print', bold: 'Printing', text: 'is ordered by the client from a printer of their choice. I prepare the files to its requirements.' },
      { key: 'hosting', bold: 'Hosting', text: 'and the domain are bought by the client on their own account and are not included in the website price.' },
    ],
  },
  infoCards: {
    pl: { included: 'Rundy poprawek w cenie: {rounds}.', files: 'PDF do wysyłki, PDF do druku w CMYK ze spadami 3 mm, pliki do edycji.' },
    en: { included: 'Revision rounds included: {rounds}.', files: 'PDF for sending, print PDF in CMYK with 3 mm bleed, editable files.' },
  },
  hostingerPl: [
    'Wejdź na hostinger.com i wybierz plan hostingu.',
    'Załóż konto na swoje dane i swój adres e-mail.',
    'Wybierz domenę, czyli adres swojej strony, i opłać zamówienie.',
    'Daj mi znać, gdy konto będzie gotowe. Podpowiem, jak bezpiecznie udostępnić mi dostęp.',
  ].join('\n'),
  hostingerEn: [
    'Go to hostinger.com and choose a hosting plan.',
    'Create an account with your own details and email address.',
    'Choose a domain, the address of your website, and pay for the order.',
    'Let me know when the account is ready. I will explain how to give me access safely.',
  ].join('\n'),
  offerBaseUrl: '',
  linkSecret: '',
};
