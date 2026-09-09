// Builds the clickable demo from the design screens.
// Usage: node demo/build.mjs [path-to-seeded-canvas.html]
// - design/*.dc.html  ->  demo/screens/<Name>.html  (runtime stripped, accent baked in)
// - optional seeded canvas  ->  demo/canvas.html
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const designDir = path.join(here, '..', 'design');
const outDir = path.join(here, 'screens');
const ACCENT = '#F2B441';
const skip = new Set(['Tokens', 'DirectionLightEditorial', 'DirectionNeonGlass']);

fs.mkdirSync(outDir, { recursive: true });

for (const file of fs.readdirSync(designDir).filter((f) => f.endsWith('.dc.html'))) {
  const name = file.replace('.dc.html', '');
  if (skip.has(name)) continue;
  let html = fs.readFileSync(path.join(designDir, file), 'utf8');
  html = html
    .replace(/<script src="\.\/support\.js"><\/script>\s*/, '')
    .replace(/<script data-dc-script[\s\S]*?<\/script>\s*/, '')
    .replace(/<\/?x-dc>/g, '')
    .replace(/<\/?helmet>/g, '')
    .replace(/\{\{\s*accent\s*\}\}/g, ACCENT)
    .replace(
      '<meta charset="utf-8">',
      `<meta charset="utf-8">\n  <meta name="viewport" content="width=390">\n  <title>ShowBox ${name}</title>`
    );
  fs.writeFileSync(path.join(outDir, `${name}.html`), html);
  console.log('screen', name);
}

const canvasSrc = process.argv[2];
if (canvasSrc && fs.existsSync(canvasSrc)) {
  fs.copyFileSync(canvasSrc, path.join(here, 'canvas.html'));
  console.log('copied design canvas -> demo/canvas.html');
}
