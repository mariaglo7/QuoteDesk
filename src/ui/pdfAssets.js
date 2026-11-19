// Code written with help from Claude (Anthropic)
// Fonts are published next to the page and fetched once.

let cache = null;
const readText = async (path) => (await (await fetch(path)).text()).trim();

export function loadPdfAssets() {
  cache ??= Promise.all(['fonts/poppins-light.txt', 'fonts/poppins-medium.txt', 'fonts/poppins-semibold.txt'].map(readText))
    .then(([light, medium, semibold]) => ({ fonts: { light, medium, semibold } }));
  return cache;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}

let viewer = null;
/** pdf.js with its worker loaded as a plain script, because the artifact frame refuses other worker origins. */
export function loadPdfViewer() {
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';
  viewer ??= loadScript(`${base}/pdf.worker.min.js`).then(() => loadScript(`${base}/pdf.min.js`)).then(() => window.pdfjsLib);
  return viewer;
}
