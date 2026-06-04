# Shopify Headless — NITI. (ažurirano 2026)

**Nikada ne šalji API token u chat.** Samo u `.env.local` na svom računaru.

Shopify je promenio preporučeni način povezivanja: umesto samo „Custom App“, sada se za headless prodavnice preporučuje **Headless sales channel** sa **javnim** i **privatnim** tokenom. Privatni token ide **samo na server** (Next.js API rute), ne u browser.

---

## Koji način da izabereš?

| Način | Kada | Token |
|--------|------|--------|
| **Headless kanal** (preporučeno) | Nova headless prodavnica | Privatni + opciono javni |
| **Custom App** (i dalje radi) | Već imaš app u Settings → Develop apps | Storefront token u `X-Shopify-Storefront-Access-Token` |

NITI. kod podržava **oba**: privatni token (novo) i legacy javni token.

---

## A) Headless sales channel (preporučeno)

### 1. Instaliraj kanal

1. [Shopify App Store → Headless](https://apps.shopify.com/headless)
2. **Add** → **Create storefront**
3. Ime: npr. `NITI Web`

### 2. Dozvole (permissions)

U Headless kanalu → tvoj storefront → **Storefront API permissions** → **Edit**.

Minimum za NITI.:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_collection_listings`
- `unauthenticated_write_checkouts`
- `unauthenticated_read_checkouts`

Kasnije (nalozi kupaca):

- `unauthenticated_write_customers`
- `unauthenticated_read_customers`

### 3. Kopiraj tokene

- **Private access token** → samo server (`.env.local`, **bez** `NEXT_PUBLIC_`)
- **Public access token** → opciono, ako želiš čitanje sa klijenta

Privatni zahtevi header: `Shopify-Storefront-Private-Token`  
Javni/legacy: `X-Shopify-Storefront-Access-Token`

### 4. `.env.local` (Headless + privatni token)

```env
SHOPIFY_STORE_DOMAIN=nitihome.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=tvoj_privatni_token

NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=nitihome.myshopify.com
NEXT_PUBLIC_SHOPIFY_ENABLED=true
```

`NEXT_PUBLIC_SHOPIFY_ENABLED=true` je **obavezno** kada koristiš samo privatni token — inače browser ne zna da koristi Shopify korpu preko `/api/shopify/cart`.

Restart:

```bash
npm run dev
```

### 5. Provera konekcije

```
http://localhost:3000/api/shopify/health
http://localhost:3000/api/shopify/status
http://localhost:3000/api/shopify/health?testCart=1
```

- `health` → proizvodi / shop query  
- `status` → da li su env varijable učitane (bez tajni)  
- `health?testCart=1` → da li može da se kreira Shopify korpa (checkout scope)

### Javni token u `.env`

Headless kanal često daje:

```env
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_...   # ili shpss_...
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=e9c05f...     # hex, bez prefiksa — NE mora NEXT_PUBLIC_
```

**Korpa ne koristi javni token** — sve ide preko servera (vidi ispod).

---

## B) Custom App (legacy — ako već imaš token)

1. **Settings → Apps and sales channels → Develop apps**
2. Create app → **Configure Storefront API**
3. Scope-ovi kao gore
4. **Install app** → **Reveal** Storefront API access token (često `shpat_` ili `shpss_`)

`.env.local`:

```env
SHOPIFY_STORE_DOMAIN=nitihome.myshopify.com
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=nitihome.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=tvoj_storefront_token
```

Za legacy token **ne mora** `NEXT_PUBLIC_SHOPIFY_ENABLED` ako postoji javni token.

---

## Proizvodi u Shopify Admin-u

1. **Products → Add product** — naslov, opis, slike, cena u **RSD**
2. **Collections** — napravi kolekcije sa handle-ima:
   - `bedsheets`, `towels`, `throws`, `accessories`, `linen`  
   (ili promeni mapu u `src/lib/shopify/config.ts`)
3. Dodeli proizvod kolekciji
4. Proizvod mora biti **Active** i objavljen na kanalu prodavnice (Online Store / Headless)

Varijante boje: opcija **Color** ili **Boja** — front mapira na swatche i `variantId`.

Tagovi `new` / `novo` → bedž „Novo“.

---

## Valuta (RSD)

1. **Settings → Markets** → primarno tržište Srbija, valuta **RSD**
2. Cene u proizvodima u dinarima
3. Front formatira preko `formatPrice()` — `Intl` RSD

---

## Test plaćanje

1. **Settings → Payments** — aktiviraj provajder (Shopify Payments ili test gateway na dev prodavnici)
2. Uključi **test mode**
3. Dodaj proizvod u korpu na sajtu → **Plaćanje preko Shopify** → završi checkout na Shopify strani

Guest checkout: podrazumevano na Shopify checkout-u (bez naloga).

---

## Korpa: server ili klijent?

| Deo | Gde | Zašto |
|-----|-----|--------|
| **UI** (dugmad, toast) | Browser (React) | Brz UX |
| **Shopify Cart API** | **Server** (`/api/shopify/cart`) | Privatni token ne sme u browser; sigurnost |
| **cartId** | `localStorage` | Zapamti korpu između poseta |

Tok: klik „Dodaj u korpu“ → `fetch('/api/shopify/cart')` → Next.js server zove Shopify sa **privatnim** tokenom → vraća stavke + `checkoutUrl`.

**Javni token nije obavezan za korpu.** Dovoljni su `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` + `NEXT_PUBLIC_SHOPIFY_ENABLED=true`.

Test u konzoli browsera (F12):

```javascript
fetch('/api/shopify/cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'create' }),
}).then((r) => r.json()).then(console.log);
```

Ako vidiš `checkoutUrl` → API radi; problem je verovatno **varijanta proizvoda** (dodaj sa `/shop`, ne sa mock početne strane).

---

## Šta je implementirano u kodu

| Deo | Fajl |
|-----|------|
| Konfiguracija | `src/lib/shopify/config.ts` |
| GraphQL klijent | `src/lib/shopify/client.ts` |
| Upiti | `src/lib/shopify/queries.ts` |
| Mapiranje proizvoda | `src/lib/shopify/mappers.ts` |
| Katalog (+ mock fallback) | `src/lib/catalog.ts` |
| Shopify korpa | `src/lib/shopify/cart.ts`, `src/app/api/shopify/cart/route.ts` |
| Health check | `src/app/api/shopify/health/route.ts` |
| Korpa u UI | `src/context/CartContext.tsx`, `src/components/cart/CartContent.tsx` |

---

## Rotacija tokena

Headless kanal: **Rotate private token** u Admin-u, pa ažuriraj `.env.local` i restartuj `npm run dev`.

---

## Šta još nije urađeno (sledeći koraci)

- Nalog kupca + istorija porudžbina (Customer Account API ili `customerAccessTokenCreate`)
- Pretraga (`/search`) preko Storefront API
- Filteri/paginacija na cursor iz Shopify-a
- SEO po jeziku, OG slike sa Shopify CDN

---

## Bezbednost

- ❌ Ne commituj `.env.local`
- ❌ Ne stavljaj pravi token u `.env.example`
- ✅ Rotiraj token ako je ikad procurio
