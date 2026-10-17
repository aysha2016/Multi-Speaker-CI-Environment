import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');
const assetsDir = path.join(rootDir, 'assets');

// Helper to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[build-post] Syncing production assets for GitHub Pages root and /docs...');

// 1. Ensure .nojekyll in root, dist, and docs
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

// 2. Sync dist to docs for GitHub Pages /docs folder support
copyDirRecursive(distDir, docsDir);
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

// 3. Sync dist/assets to root assets/ so GitHub Pages root branch deploy finds ./assets/index.js & css
if (fs.existsSync(path.join(distDir, 'assets'))) {
  copyDirRecursive(path.join(distDir, 'assets'), assetsDir);
}

console.log('[build-post] Assets synced successfully:');
console.log(' - root/.nojekyll');
console.log(' - root/assets/');
console.log(' - root/docs/ (with .nojekyll and compiled bundle)');
