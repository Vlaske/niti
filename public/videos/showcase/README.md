# Video za sekciju „Gde dizajn oživljava“

Stavi `.mp4` fajlove ovde. Preporuka: H.264, max ~10 MB, vertikalni ili 4:5 format.

## Fajlovi (primeri iz config-a)

| Fajl | Sekcija |
|------|---------|
| `posteljina-lifestyle.mp4` | Posteljina u upotrebi |
| `carsaf-lifestyle.mp4` | Čaršaf / posteljina |
| `peskiri-lifestyle.mp4` | Peškiri |

## Podešavanje

Uredi `src/config/design-showcase.ts`:

```ts
{
  id: "1",
  productHandle: "tvoj-shopify-handle",
  description: "Tekst preko videa…",
  mediaType: "video",
  mediaSrc: "/videos/showcase/posteljina-lifestyle.mp4",
  poster: "https://…", // slika dok se video učitava
}
```

`productHandle` mora odgovarati proizvodu u Shopify-u — kartica ispod automatski pokazuje pravi naziv, cenu i sliku.
