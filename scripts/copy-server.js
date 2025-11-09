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
```

---

## **🎉 DONE! Now Deploy to Vercel:**

1. **Go to:** https://vercel.com/new
2. **Import your GitHub repo:** `outreach-iq`
3. **Add Environment Variables:**
```
   DATABASE_URL=postgresql://neondb_owner:npg_qg3urkAyVpa1@ep-sparkling-credit-afip2nb0-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
   
   OPENAI_API_KEY=your_openai_key_here
   
   NODE_ENV=production
