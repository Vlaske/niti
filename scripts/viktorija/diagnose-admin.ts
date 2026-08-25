import { loadLocalEnv } from "./load-env";

loadLocalEnv();

async function main() {
  const domain = (
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    ""
  )
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const admin = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";

  console.log("domain:", domain || "(missing)");
  console.log("SHOPIFY_ADMIN_ACCESS_TOKEN set:", Boolean(admin));
  console.log("ADMIN length:", admin.length);
  console.log("ADMIN prefix:", admin.slice(0, 6) || "(empty)");
  console.log("ADMIN has whitespace:", /\s/.test(admin));
  console.log(
    "ADMIN starts with quote:",
    admin.startsWith('"') || admin.startsWith("'")
  );

  if (!domain || !admin) {
    console.log("FAIL: missing domain or SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local");
    process.exit(1);
  }

  const res = await fetch(
    `https://${domain}/admin/api/2025-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": admin,
      },
      body: JSON.stringify({ query: "{ shop { name } }" }),
    }
  );
  console.log("HTTP", res.status);
  const text = await res.text();
  console.log("body:", text.slice(0, 400));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
