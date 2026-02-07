#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
const outPath = path.resolve(process.cwd(), 'public', 'pdf.worker.min.js');
const urls = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.296/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js',
];

(async () => {
  for (const url of urls) {
    try {
      console.log('Trying', url);
      const res = await fetch(url);
      if (!res.ok) { console.log('Not OK', res.status); continue; }
      const txt = await res.text();
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, txt, 'utf8');
      console.log('Wrote worker to', outPath);
      process.exit(0);
    } catch (err) {
      console.error('Failed to fetch', url, err);
    }
  }
  console.error('Could not download any worker version.');
  process.exit(1);
})();