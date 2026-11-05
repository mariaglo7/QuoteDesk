// Code written with help from Claude (Anthropic)
// A vertical cursor with page breaks. Blocks measure themselves, then ask ensure() for room.
import { THEME } from './theme.js';

export function createFlow({ doc, header }) {
  const flow = {
    y: THEME.contentTop,
    get pageCount() {
      return doc.getNumberOfPages();
    },
    newPage() {
      doc.addPage();
      header(doc.getNumberOfPages());
      flow.y = THEME.contentTop;
    },
    ensure(height) {
      if (flow.y + height > THEME.bottom) flow.newPage();
    },
    wrap(text, font, size, width) {
      doc.setFont('Poppins', font);
      doc.setFontSize(size);
      return doc.splitTextToSize(String(text), width);
    },
    textHeight(lines, size, leading) {
      return lines.length * size * leading;
    },
  };
  return flow;
}
