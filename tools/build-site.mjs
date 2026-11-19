// Code written with help from Claude (Anthropic)
// Builds the GitHub Pages site: copies web/ and wraps index.html in a full HTML document.
// The artifact version needs index.html without the document skeleton, so the source stays as it is.
import { cp, readFile, writeFile, rm } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const out = new URL('_site/', root);
await rm(out, { recursive: true, force: true });
await cp(new URL('web/', root), out, { recursive: true });
const page = await readFile(new URL('web/index.html', root), 'utf8');
await writeFile(new URL('index.html', out), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
</head>
<body>
${page}
</body>
</html>
`);
await writeFile(new URL('.nojekyll', out), '');
console.log('Built _site/');
