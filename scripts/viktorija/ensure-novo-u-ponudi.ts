/**
 * One-off: create automated Shopify collection "Novo u ponudi"
 * (products tagged `novo-u-ponudi`).
 *
 *   npx tsx scripts/viktorija/ensure-novo-u-ponudi.ts
 */
import { ensureCollection } from "./ensure-collections";

async function main() {
  const id = await ensureCollection({
    handle: "novo-u-ponudi",
    title: "Novo u ponudi",
    description:
      "Proizvodi na početnoj stranici (Novo u ponudi). Tagujte proizvod sa: novo-u-ponudi",
    tag: "novo-u-ponudi",
  });
  console.log(`OK: novo-u-ponudi → ${id}`);
  console.log("Add the tag `novo-u-ponudi` to products you want on the homepage.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
