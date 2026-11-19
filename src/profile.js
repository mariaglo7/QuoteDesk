// Code written with help from Claude (Anthropic)
// The user's business profile replaces every hard coded brand detail.

export function signatureFrom(profile) {
  return [profile.ownerName, profile.businessName, profile.email, profile.website].filter((v) => v && v.trim()).join('\n');
}

export function hasProfile(profile) {
  return Boolean((profile.businessName || profile.ownerName) && profile.email);
}

export function displayName(profile) {
  return profile.businessName || profile.ownerName || 'QuoteDesk';
}
