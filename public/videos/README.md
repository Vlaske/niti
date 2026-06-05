# Hero video fajlovi

Stavi `.mp4` fajlove ovde. Preporuka: H.264, max ~15 MB, 1920×1080 ili 1080×1920.

## Brzi start (jedan video u petlji)

1. Kopiraj video, npr. `posteljina-hero.mp4` u ovaj folder
2. U `src/config/hero-slides.ts` na prvom slajdu odkomentariši:

```ts
mediaType: "video",
mediaSrc: "/videos/posteljina-hero.mp4",
poster: "https://...", // cover slika dok se učitava
```

3. U `src/config/hero.ts` postavi:

```ts
singleVideoLoop: true,
```

## Više videa (3–4) ili mešavina video + slika

- Svaki slajd u `hero-slides.ts` može biti `image` (podrazumevano) ili `video`
- Ostavi `singleVideoLoop: false` — karusel rotira slajdove
- Primer: slajd 1 video, slajd 2 slika, slajd 3 video

## CDN / Shopify (kasnije)

Za produkciju možeš hostovati video na Shopify Files ili CDN i staviti pun URL u `mediaSrc`.
