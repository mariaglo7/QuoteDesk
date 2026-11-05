// Code written with help from Claude (Anthropic)
import test from 'node:test';
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
import { THEME, registerFonts } from '../web/src/pdf/theme.js';
import { createFlow } from '../web/src/pdf/layout.js';
import { FONTS } from './fixtures/pdf.js';

function setup() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  registerFonts(doc, FONTS);
  const pages = [];
  const flow = createFlow({ doc, header: (n) => pages.push(n) });
  return { doc, flow, pages };
}

test('theme is A4 in points with the reference margins', () => {
  assert.equal(THEME.margin, 57);
  assert.equal(THEME.contentWidth, 481);
  assert.equal(THEME.pink, '#FF7AE5');
});

test('newPage draws the header and moves the cursor to the content top', () => {
  const { flow, pages } = setup();
  flow.newPage();
  assert.deepEqual(pages, [2]);
  assert.equal(flow.y, THEME.contentTop);
});

test('ensure keeps the cursor when the block fits', () => {
  const { flow, pages } = setup();
  flow.newPage();
  flow.ensure(100);
  assert.equal(flow.pageCount, 2);
  assert.equal(flow.y, THEME.contentTop);
  assert.equal(pages.length, 1);
});

test('ensure starts a new page when the block does not fit', () => {
  const { flow, pages } = setup();
  flow.newPage();
  flow.y = THEME.bottom - 50;
  flow.ensure(100);
  assert.equal(flow.pageCount, 3);
  assert.equal(flow.y, THEME.contentTop);
  assert.deepEqual(pages, [2, 3]);
});

test('wrap keeps polish text inside the width', () => {
  const { doc, flow } = setup();
  const lines = flow.wrap('Założenie i pełne uzupełnienie wizytówki Google ze zdjęciami, żeby klienci znajdowali Was w Mapach i wyszukiwarce.', 'light', 9.5, 200);
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(doc.getTextWidth(line) <= 200.5, line);
});

test('textHeight multiplies lines by leading', () => {
  const { flow } = setup();
  assert.equal(flow.textHeight(['a', 'b', 'c'], 10, 1.5), 45);
});
