import { adminGraphql, sleep } from "./admin";
import { listPublications, publishToAll } from "./publish-lib";

async function main() {
  const pubs = await listPublications();
  console.log(
    "Publications:",
    pubs.map((p) => p.name).join(", ") || "(none)"
  );
  if (!pubs.length) {
    console.warn("No publications found — cannot publish to Headless channel.");
    return;
  }

  let after: string | null = null;
  let hasNext = true;
  let n = 0;
  const ids = pubs.map((p) => p.id);

  while (hasNext) {
    const page = await adminGraphql<{
      products: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: { id: string; handle: string }[];
      };
    }>(
      `query Products($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id handle }
        }
      }`,
      { cursor: after }
    );
    for (const p of page.products.nodes) {
      try {
        await publishToAll(p.id, ids);
        n += 1;
        if (n % 25 === 0) console.log(`  published ${n} products…`);
        await sleep(200);
      } catch (err) {
        console.warn(`  skip ${p.handle}: ${String(err)}`);
      }
    }
    hasNext = page.products.pageInfo.hasNextPage;
    after = page.products.pageInfo.endCursor;
  }
  console.log(`Published ${n} products to ${ids.length} channel(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
