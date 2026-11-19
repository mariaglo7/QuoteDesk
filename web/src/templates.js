// Code written with help from Claude (Anthropic)
// Fixed messages used when Claude is not available.
import { stripDashes } from './text.js';
import { offerLines } from './quote.js';
import { signatureFrom } from './profile.js';

const firstName = (quote) => quote.client.name.trim().split(/\s+/)[0] ?? '';

function greeting(quote) {
  const name = firstName(quote);
  if (quote.lang === 'en') return name ? `Hi ${name},` : 'Hi,';
  if (quote.address === 'wy') return 'Dzień dobry,';
  return name ? `Cześć ${name},` : 'Cześć,';
}

function pl(quote, ty, wy) {
  return quote.address === 'wy' ? wy : ty;
}

function paragraphs(parts) {
  return stripDashes(parts.filter(Boolean).join('\n\n'));
}

export function fallbackMessage({ quote, totals, settings, offerUrl }) {
  const lines = offerLines(quote, totals).join('\n');
  const value = quote.sections.find((s) => s.type === 'value');
  const gains = value?.points.length ? `${value.title}:\n${value.points.join('\n')}` : '';
  const questions = quote.missing.join('\n');
  if (quote.lang === 'en') {
    return paragraphs([
      greeting(quote),
      'Thank you for your message. Here is my offer:',
      lines,
      gains,
      `The price includes ${settings.profile.includedRounds} rounds of revisions. I start after a 50% deposit by bank transfer.`,
      totals.hasWebsite && 'Hosting and the domain are bought on your own account and are not included in the website price.',
      questions,
      `The PDF offer is attached.${offerUrl ? ` You can also see it online: ${offerUrl}` : ''}`,
      signatureFrom(settings.profile),
    ]);
  }
  return paragraphs([
    greeting(quote),
    `Dziękuję za wiadomość. ${pl(quote, 'Przygotowałam dla Ciebie ofertę:', 'Przygotowałam dla Was ofertę:')}`,
    lines,
    gains,
    `Rundy poprawek w cenie: ${settings.profile.includedRounds}. Zaczynam po wpłacie 50% zaliczki przelewem.`,
    totals.hasWebsite && pl(quote, 'Hosting i domenę kupujesz na swoim koncie, nie są wliczone w cenę strony.', 'Hosting i domenę kupujecie na swoim koncie, nie są wliczone w cenę strony.'),
    questions,
    `Ofertę w PDF przesyłam w załączniku.${offerUrl ? ` Wersja online: ${offerUrl}` : ''}`,
    signatureFrom(settings.profile),
  ]);
}

export function fallbackFollowUp({ quote, settings, offerUrl }) {
  const link = offerUrl ? `\n${offerUrl}` : '';
  if (quote.lang === 'en') {
    return paragraphs([
      greeting(quote),
      `I just wanted to check if you had a chance to look at my offer and if you have any questions. It is valid for ${settings.validityDays} days.${link}`,
      signatureFrom(settings.profile),
    ]);
  }
  return paragraphs([
    greeting(quote),
    `${pl(quote, 'Chciałam zapytać, czy udało Ci się zajrzeć do oferty i czy masz jakieś pytania.', 'Chciałam zapytać, czy udało się Wam zajrzeć do oferty i czy macie jakieś pytania.')} Oferta jest ważna ${settings.validityDays} dni.${link}`,
    signatureFrom(settings.profile),
  ]);
}
