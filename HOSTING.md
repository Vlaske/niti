# Hosting — NITI. headless prodavnica

## Mentalna slika (pročitaj ovo prvo)

Headless znači da imaš **dva odvojena „sajta“** — i to je normalno:

```
┌─────────────────────────────────────────────────────────────────┐
│  KUPAC IDE OVDE (tvoj pravi sajt)                               │
│  https://niti-store.vercel.app  ili  https://nitihome.rs        │
│  Next.js — dizajn, animacije, mobilni UX                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ Storefront API (proizvodi, korpa)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SHOPIFY BACKEND                                                │
│  nitihome.myshopify.com — Admin, proizvodi, plaćanje            │
└─────────────────────────────────────────────────────────────────┘
```

| URL | Šta je | Da li kupac treba da ide ovde? |
|-----|--------|--------------------------------|
| `nitihome.myshopify.com` | Shopify **default tema** (Opening soon…) | ❌ Ne |
| `nitihome.myshopify.com/admin` | Admin panel | ✅ Samo vi |
| `nitihome.myshopify.com/checkouts/...` | Checkout | ✅ Iz korpe |
| `niti-store.vercel.app` | Vaš **pravi** frontend | ✅ Da |
| `nitihome.rs` (kasnije) | Produkcijski domen | ✅ Da |

**Šta se dešava sa `myshopify.com` kad deployujete?**  
Ništa automatski — i dalje postoji sa default temom. Kupcima šaljete **Vercel** link. Kasnije možemo dodati redirect temu na Shopify-u.

---

## Da li je OK deploy sada (pre kraja)?

**Da.** Preview ne dira Shopify proizvode ni Admin. Idealno za testiranje sa drugaricom dok gradite dalje.

---

# GitHub + Vercel — kompletno uputstvo

## Deo A: Prvi commit i push (jednom)

Ako repo **već postoji** na GitHub-u, preskoči na **Deo B**.

```bash
cd niti-store
git status
```

Ako nema git-a:

```bash
git init
git add .
git commit -m "NITI store — initial"
```

Na GitHub-u: **New repository** → `niti-store` → **bez** README.

```bash
git remote add origin https://github.com/TVOJ_USERNAME/niti-store.git
git branch -M main
git push -u origin main
```

**Važno:** `.env.local` **nikad** ne commituj (mora biti u `.gitignore`).

---

## Deo B: Svaki sledeći commit i deploy (svaki put kad nešto promenite)

Kad završite izmene u kodu (lokalno ili u Cursor-u):

```bash
cd niti-store

# 1. Proveri šta je promenjeno
git status

# 2. Dodaj izmenjene fajlove
git add .

# Ili samo određene fajlove:
# git add src/components/layout/Header.tsx HOSTING.md

# 3. Commit sa jasnom porukom
git commit -m "Popravljen header na mobilnom i FAQ slika"

# 4. Push na GitHub
git push
```

**Šta se dešava posle `git push`:**

1. GitHub prima novi commit na `main`
2. Vercel automatski pokreće novi build (~1–3 min)
3. Kad build uspe, **isti URL** (`niti-store.vercel.app`) pokazuje novu verziju

Prati deploy: Vercel dashboard → tvoj projekat → **Deployments**.

### Kratke commit poruke (primeri)

```bash
git commit -m "Mobilni UX — kategorije i product cards"
git commit -m "Shopify checkout locale i srpski prevodi"
git commit -m "Hero video i sage dugme"
```

### Ako `git push` traži login

GitHub više ne prihvata lozinku u terminalu — koristi **Personal Access Token** ili **GitHub Desktop**.

---

## Deo C: Vercel — prvi deploy

### 1. Poveži repo

1. [vercel.com](https://vercel.com) → Sign up (preko GitHub-a)
2. **Add New… → Project**
3. Izaberi repozitorijum `niti-store` → **Import**

### 2. Build podešavanja

Vercel automatski prepoznaje Next.js. Proveri:

| Polje | Vrednost |
|-------|----------|
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | *(default — ne menjaj)* |
| **Install Command** | `npm install` |

### 3. Environment variables (obavezno)

Pre **Deploy**, dodaj u **Environment Variables**:

| Variable | Primer |
|----------|--------|
| `SHOPIFY_STORE_DOMAIN` | `nitihome.myshopify.com` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | `shpat_...` ili `shpss_...` |
| `NEXT_PUBLIC_SHOPIFY_ENABLED` | `true` |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `nitihome.myshopify.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | *(ako imaš)* |

Scope: **Production**, **Preview**, **Development** (sve tri).

Klikni **Deploy**.

### 4. URL i preimenovanje

Posle deploya dobijaš npr. `https://niti-store-abc123.vercel.app`.

**Project Settings → Domains →** možeš dodati lepši subdomain ili custom domen kasnije.

### 5. Test

1. Početna, shop, proizvod
2. `https://TVOJ-URL.vercel.app/api/shopify/health?testCart=1` → `ok: true`
3. Korpa → checkout
4. Mobilni telefon

### 6. Podeli sa drugaricom

Pošalji joj Vercel URL. Svaki tvoj `git push` = automatski novi sajt za ~2 min.

---

## Deo D: Env varijable — dodavanje / izmena kasnije

Ako dodaš novi token ili promeniš `.env.local`:

1. Vercel → Project → **Settings → Environment Variables**
2. Dodaj ili izmeni vrednost
3. **Deployments** → najnoviji deploy → **⋯ → Redeploy** (da učita nove env)

Lokalno: izmeni `.env.local` → restartuj `npm run dev`.

---

## Deo E: Produkcija (custom domen)

1. Kupite domen (`nitihome.rs`, `.com`…)
2. Vercel → **Settings → Domains → Add**
3. DNS kod registrara (Vercel daje tačne zapise)
4. HTTPS automatski
5. Kasnije: Shopify redirect tema → URL na vaš domen

---

## Shopify — obavezno pre testa

- [ ] **Online Store → Preferences** → isključi lozinku (checkout radi)
- [ ] Kolekcije: `posteljine`, `carsavi`, `jastuci`, `peskiri`
- [ ] Ne šalji kupcima `myshopify.com` — samo Vercel URL

---

## Checklist

- [ ] GitHub repo pushovan
- [ ] Vercel env varijable postavljene
- [ ] Build zelen (Deployments)
- [ ] Health check OK
- [ ] Korpa + checkout test
- [ ] Mobilni test

---

## Česta pitanja

**Da li Vercel zamenjuje Shopify?**  
Ne. Vercel = frontend. Shopify = proizvodi, korpa, plaćanje.

**Zašto postoji myshopify.com sa default temom?**  
Svaka Shopify prodavnica to automatski ima. Kod headless-a ignorišete ili redirectujete.

**Build pao na Vercelu?**  
Deployments → View Build Logs. Najčešće: nedostaje env varijabla.

**Kako vratiti staru verziju?**  
Vercel → Deployments → stari deploy → **Promote to Production**.

---

## Alternativa: Netlify

Netlify takođe radi za Next.js. Koraci su slični: GitHub → import → env varijable → `git push` za svaki update. Za NITI. je Vercel malo jednostavniji za Next.js, ali oba su OK.

---

## Šta Shopify i dalje radi

- Admin, proizvodi, kolekcije
- Checkout i porudžbine
- Test plaćanja, RSD valuta

Vercel sajt samo prikazuje podatke i šalje kupca na Shopify checkout.
