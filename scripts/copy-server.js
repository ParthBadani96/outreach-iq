import fs from 'fs-extra';
import path from 'path';

const serverFiles = ['package.json', 'node_modules'];

for (const file of serverFiles) {
  const src = path.join(process.cwd(), file);
  const dest = path.join(process.cwd(), 'dist', 'server', file);
  
  if (fs.existsSync(src)) {
    fs.copySync(src, dest);
    console.log(`Copied ${file} to dist/server`);
  }
}
