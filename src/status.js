// Code written with help from Claude (Anthropic)

const DAY = 86400000;

const daysSince = (iso, now) => (now.getTime() - new Date(iso).getTime()) / DAY;

export function effectiveStatus(quote, now, settings) {
  if (quote.status === 'sent' && quote.sentAt && daysSince(quote.sentAt, now) > settings.validityDays) return 'expired';
  return quote.status;
}

export function isFollowUpDue(quote, now, settings) {
  return effectiveStatus(quote, now, settings) === 'sent' && daysSince(quote.sentAt, now) >= settings.followUpDays;
}
