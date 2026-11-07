import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.log('No dist directory found to process.');
  process.exit(0);
}

// 1. Ensure .nojekyll exists in dist
const nojekyllPath = path.join(distDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '', 'utf8');
  console.log('✓ Created dist/.nojekyll for GitHub Pages');
}

// 2. Ensure 404.html exists in dist
const notFoundPath = path.join(distDir, '404.html');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(notFoundPath) && fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Copied dist/index.html to dist/404.html');
}

console.log('✓ Postbuild asset and routing verification complete.');
