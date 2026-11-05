// Code written with help from Claude (Anthropic)
// Measurements taken from the Harbour Light Co reference offer, in points on A4.

export const THEME = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  margin: 57,
  contentWidth: 481,
  contentTop: 128,
  bottom: 790,
  panelX: 419,
  ink: '#1E1613',
  muted: '#6F625C',
  line: '#E8E3E0',
  pink: '#FF7AE5',
  white: '#FFFFFF',
  onDark: '#CFC6C2',
  darkLine: '#3A2E29',
  cardRadius: 12,
};

export function registerFonts(doc, fonts) {
  for (const [style, file] of [['light', 'Poppins-Light'], ['medium', 'Poppins-Medium'], ['semibold', 'Poppins-SemiBold']]) {
    doc.addFileToVFS(`${file}.ttf`, fonts[style]);
    doc.addFont(`${file}.ttf`, 'Poppins', style);
  }
}
