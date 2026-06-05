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
# Headless kanal — VAŽNO: ne stavljaj pogrešan token u pogrešno polje
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=abc123...hex...   # Javni → X-Shopify-Storefront-Access-Token
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpss_...       # Privatni → Shopify-Storefront-Private-Token

# shpat_ u PRIVATE polju često daje HTTP 401 — to nije Headless privatni token
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
2. **Collections** — napravi kolekcije sa handle-ima (mora da se poklapa sa `src/config/store-categories.ts`):
   - `posteljine`, `carsavi`, `jastuci`, `peskiri`
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

## Srpski jezik na checkout-u

**Važno:** Shopify **nema** zvaničan automatski prevod za srpski (`sr`) na checkout-u. Ima ~33 jezika sa gotovim prevodom (hrvatski, engleski, nemački…), ali **ne i srpski**.

Zato ručne izmene u Admin-u često „ne rade“ — checkout uzima jezik iz Markets + locale, ne iz custom tekstova teme.

### Šta uraditi (redosled)

1. **Settings → Markets** → primarno tržište **Srbija** (RS), valuta RSD
2. **Settings → Languages** → **Add language** → dodaj **Serbian** (ili koristi **Croatian** kao privremeni srodn jezik ako sr ne postoji u listi)
3. Instaliraj besplatnu **[Translate & Adapt](https://apps.shopify.com/translate-and-adapt)** aplikaciju
4. U Translate & Adapt → **Checkout** → prevedi sve stringove na srpski (ručno ili CSV import)
5. **Objavi** prevode (Publish) — draft prevodi se ne vide na checkout-u
6. Ukloni Online Store lozinku (vidi sekciju ispod)

### Šta front radi automatski

- Korpa se kreira sa `countryCode: RS` (Srbija)
- Checkout URL dobija `locale=sr` i `channel=headless-storefronts`
- Jezik sajta (sr/en) iz fronta se prosleđuje API-ju korpe

Ako checkout i dalje bude na engleskom:
- Proveri da li je srpski **published** u Languages
- Probaj privremeno **Croatian (hr)** u Markets dok ne završiš srpske prevode
- Očisti korpu (isprazni + dodaj ponovo) da se generiše novi checkout URL

---

## Hosting (preview za tim)

Next.js **ne ide na Shopify** — hostuje se na **Vercel** (preporučeno). Shopify ostaje backend.

Detaljan vodič: **[HOSTING.md](./HOSTING.md)** — GitHub + Vercel deploy, env varijable, deljenje preview linka sa drugaricom pre lansiranja.

---

## Test plaćanje

### Važno: gde se plaća?

| URL | Šta je |
|-----|--------|
| `localhost:3000/cart` → **Nastavi na plaćanje** | ✅ Pravi headless checkout (Shopify checkout) |
| `nitihome.myshopify.com/password` | ❌ Lozinka Online Store teme — **nije** checkout |

### Checkout ide na /password? (rešenje)

Ako `checkoutUrl` (npr. `.../checkouts/cn/...`) preusmeri na **password** stranicu:

1. **Ukloni lozinku Online Store-a** (obavezno za headless):
   - Admin → **Online Store → Preferences**
   - Sekcija **Restrict store access** → isključi lozinku → **Save**
2. Front automatski dodaje `?channel=headless-storefronts` na checkout URL (vidi `src/lib/shopify/checkout.ts`)
3. Opciono: instaliraj [hydrogen-redirect-theme](https://github.com/Shopify/hydrogen-redirect-theme) na Shopify temu da posetioci `myshopify.com` idu na tvoj Next.js sajt (ne na praznu Shopify temu)

Stranica „Opening soon“ sa lozinkom je samo za klasičnu Shopify temu. Headless prodavnica koristi **checkoutUrl** iz korpe.

### Koraci

1. **Settings → Payments** — aktiviraj provajder (Shopify Payments ili Bogus Gateway na dev prodavnici)
2. Uključi **test mode** (Settings → Payments → Manage → Test mode)
3. Na **Next.js sajtu** (`npm run dev`): dodaj proizvod → `/cart` → **Nastavi na plaćanje**
4. Na checkout strani koristi Shopify test karticu, npr.:
   - Broj: `4242` `4242` `4242` `4242`
   - Datum: bilo koji budući mesec/godina
   - CVC: bilo koji 3 cifreni kod
5. Potvrdi porudžbinu — u Admin → **Orders** vidiš test narudžbinu

Ako dugme „Nastavi na plaćanje“ nije aktivno, proveri:
- `NEXT_PUBLIC_SHOPIFY_ENABLED=true` u `.env.local`
- Da li u korpi ima stavki (dodaj sa `/shop`, ne mock)
- `GET /api/shopify/health?testCart=1` — treba `cartOk: true`

Više: [Shopify test payments](https://help.shopify.com/en/manual/checkout-settings/test-orders)

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
