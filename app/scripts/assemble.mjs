// Runs after `vite build`: drops the design extras into dist/ so the site can link to them.
//   dist/canvas.html   the design canvas (read-only export of the Claude Design canvas)
//   dist/proto/        the earlier click-through prototype
// Both are optional; a missing source only prints a note.
import { cpSync, existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const app = join(import.meta.dirname, '..');
const dist = join(app, 'dist');
const demo = join(app, '..', 'demo');

if (!existsSync(dist)) {
  console.error('assemble: app/dist is missing, run vite build first');
  process.exit(1);
}

// GitHub Pages must serve the build as-is, without running Jekyll over it.
writeFileSync(join(dist, '.nojekyll'), '');

const canvas = join(demo, 'canvas.html');
if (existsSync(canvas)) {
  copyFileSync(canvas, join(dist, 'canvas.html'));
  console.log('assemble: canvas.html');
} else {
  console.log('assemble: no demo/canvas.html, skipping the design canvas');
}

const protoIndex = join(demo, 'index.html');
const screens = join(demo, 'screens');
if (existsSync(protoIndex) && existsSync(screens)) {
  mkdirSync(join(dist, 'proto', 'screens'), { recursive: true });
  copyFileSync(protoIndex, join(dist, 'proto', 'index.html'));
  cpSync(screens, join(dist, 'proto', 'screens'), { recursive: true });
  console.log(`assemble: proto/ (${readdirSync(screens).length} screens)`);
} else {
  console.log('assemble: no demo prototype, skipping proto/');
}
