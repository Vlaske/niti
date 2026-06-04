# Hero videos

Place your `.mp4` files here, for example:

- `bedsheet-hero.mp4`

Then in `src/lib/data/collections.ts`, set on a hero slide:

```ts
mediaType: "video",
mediaSrc: "/videos/bedsheet-hero.mp4",
poster: "https://...", // optional fallback image
```

For a **single looping video** (no carousel), set in `src/config/hero.ts`:

```ts
singleVideoLoop: true,
```
