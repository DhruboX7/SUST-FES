import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir)) {
  console.log('No dist directory found to process.');
  process.exit(0);
}

// 1. Ensure .nojekyll exists in dist
const nojekyllPath = path.join(distDir, '.nojekyll');
const publicNojekyll = path.resolve('public', '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  if (fs.existsSync(publicNojekyll)) {
    fs.copyFileSync(publicNojekyll, nojekyllPath);
  } else {
    fs.writeFileSync(nojekyllPath, '', 'utf8');
  }
  console.log('✓ Ensured dist/.nojekyll for GitHub Pages');
}

// 2. Ensure 404.html exists in dist
const notFoundPath = path.join(distDir, '404.html');
const publicNotFound = path.resolve('public', '404.html');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(notFoundPath)) {
  if (fs.existsSync(publicNotFound)) {
    fs.copyFileSync(publicNotFound, notFoundPath);
    console.log('✓ Copied public/404.html to dist/404.html');
  } else if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, notFoundPath);
    console.log('✓ Copied dist/index.html to dist/404.html');
  }
}

console.log('✓ Postbuild asset and routing verification complete.');
