// Code written with help from Claude (Anthropic)
// A fictional freelancer used by the tests. Prices are set so pricing can be checked.
import { DEFAULT_SETTINGS } from '../../web/src/defaults.js';

export const TEST_LOGO_DARK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAQCAIAAADrtar6AAAAHklEQVR4nGOQGyDAMGrxqMWjFo9aPGrxqMWjFsMAAAFt4QEdB+5QAAAAAElFTkSuQmCC';
export const TEST_LOGO_LIGHT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAQCAIAAADrtar6AAAAHklEQVR4nGP4MECAYdTiUYtHLR61eNTiUYtHLYYBANZpCGpOa8bqAAAAAElFTkSuQmCC';

export const TEST_SETTINGS = {
  ...DEFAULT_SETTINGS,
  profile: {
    ...DEFAULT_SETTINGS.profile,
    businessName: 'Northlight Studio', ownerName: 'Jo Example', email: 'jo@example.com', website: 'northlight.example',
    logoLight: TEST_LOGO_DARK, logoDark: TEST_LOGO_LIGHT, dark: '#22303C', accent: '#E0457B', currency: 'GBP',
  },
  offerBaseUrl: 'https://northlight.example/offer/',
  priceList: [
    { id: 'post', namePl: 'Post w social media', nameEn: 'Social media post', descPl: 'Grafika i opis.', descEn: 'Graphic and caption.', bulletsPl: [], bulletsEn: [], price: 35, priceFrom: false, unit: 'item', category: 'social', applyMultiplier: false },
    { id: 'care', namePl: 'Opieka nad stroną', nameEn: 'Website care', descPl: 'Aktualizacje.', descEn: 'Updates.', bulletsPl: [], bulletsEn: [], price: 50, priceFrom: false, unit: 'month', category: 'care', applyMultiplier: false },
  ],
};
