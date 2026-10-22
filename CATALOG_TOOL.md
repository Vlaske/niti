# Catalog tooling (NITI)

Daily catalog work (CSV/XML import, grouping variants, edit, Shopify export) lives in:

**`C:\Users\Luka-PC\niti-catalog-v2`** (current — clean rebuild)

- **You (dev):** `Start Catalog.bat` → http://127.0.0.1:3858  
- **Ship to others:** `Build Portable.bat` → zip `release\NITI-Catalog-V2-Portable`  
- **Fallback:** previous app at `C:\Users\Luka-PC\niti-catalog` (port 3857)

**Not** part of this Next.js storefront and **not** deployed to the live site.

See that folder’s `README.md` for the operator guide.

The files under `scripts/catalog/` here are optional legacy CLI helpers only.
