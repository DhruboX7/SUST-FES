import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const DIST_DIR = path.resolve(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

// Vite emits content-hashed files such as assets/index-BlIlEQMZ.js; only those are safe to cache forever.
const HASHED_ASSET = /^\/assets\/.+-[A-Za-z0-9_-]{8}\.[A-Za-z0-9]+$/;
// Files that must always be revalidated so deployments and data edits reach returning visitors.
const ALWAYS_REVALIDATE = /(?:^\/data\/.+\.json$|^\/sw\.js$|^\/registerSW\.js$|^\/manifest\.webmanifest$)/;

function cacheControlFor(urlPath, ext) {
  if (ext === '.html' || ALWAYS_REVALIDATE.test(urlPath)) return 'no-cache';
  if (HASHED_ASSET.test(urlPath)) return 'public, max-age=31536000, immutable';
  return 'public, max-age=3600';
}

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function statFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile() ? stat : null;
  } catch {
    return null;
  }
}

function isInsideDist(filePath) {
  return filePath === DIST_DIR || filePath.startsWith(DIST_DIR + path.sep);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    send(res, 405, 'Method Not Allowed');
    return;
  }

  let pathname;
  try {
    const parsedUrl = new URL(req.url || '/', 'http://localhost');
    // decodeURIComponent throws on malformed escapes such as "%E0%A4%A"; never let that crash the process.
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch {
    send(res, 400, 'Bad Request');
    return;
  }

  if (pathname.includes('\0')) {
    send(res, 400, 'Bad Request');
    return;
  }

  // path.join normalizes any "../" sequences, including ones that were percent-encoded ("..%2f") in the URL.
  let filePath = path.join(DIST_DIR, pathname);
  if (!isInsideDist(filePath)) {
    send(res, 403, 'Forbidden');
    return;
  }

  // Directory (or site root) -> its index.html
  try {
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    // Not found on disk; handled below.
  }

  let stat = statFile(filePath);

  if (!stat) {
    // Missing file with an extension (a script, image, font...) is a real 404.
    // Serving index.html for it would hide broken or stale asset references behind a 200 response.
    if (path.extname(pathname)) {
      send(res, 404, 'Not Found');
      return;
    }
    // Extension-less path: single-page-app fallback.
    filePath = path.join(DIST_DIR, 'index.html');
    stat = statFile(filePath);
    if (!stat) {
      send(res, 404, 'Application build not found. Please run "npm run build" first.');
      return;
    }
    pathname = '/index.html';
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': cacheControlFor(pathname, ext),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    // Headers are already sent; the best we can do is close the connection.
    res.destroy();
  });
  stream.pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`✓ FES SUST Library Production Server running at http://${HOST}:${PORT}`);
});
