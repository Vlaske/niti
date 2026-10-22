# Local catalog toolkit

Committed TypeScript tools for Viktorija CSV/XML → Shopify.  
Runtime dumps stay in `data/viktorija/` (gitignored).

See root [`CATALOG_GUIDE.md`](../../CATALOG_GUIDE.md) for the full operator guide (XML, live Shopify compare, Studio).

```bash
npm run catalog:ingest -- csv path\to\export.csv
npm run catalog:merge
npm run catalog:diff
npm run catalog:export
npm run catalog:studio   # http://127.0.0.1:3847 only
```

Studio binds to loopback and is not part of the Next.js production build.
