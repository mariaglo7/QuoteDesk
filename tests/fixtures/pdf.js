// Code written with help from Claude (Anthropic)
import { readFileSync } from 'node:fs';
import { jsPDF } from 'jspdf';

const read = (p) => readFileSync(new URL(`../../web/${p}`, import.meta.url), 'utf8').trim();

export const FONTS = { light: read('fonts/poppins-light.txt'), medium: read('fonts/poppins-medium.txt'), semibold: read('fonts/poppins-semibold.txt') };
export const LOGOS = { dark: read('assets/logo-dark.txt'), white: read('assets/logo-white.txt') };

/** jsPDF that records every text call, because embedded fonts are not searchable in the output. */
export function recordingPdf() {
  const texts = [];
  function RecordingPdf(options) {
    const doc = new jsPDF(options);
    const original = doc.text;
    doc.text = function text(value, ...rest) {
      texts.push(...[value].flat());
      return original.call(doc, value, ...rest);
    };
    return doc;
  }
  return { RecordingPdf, texts };
}
