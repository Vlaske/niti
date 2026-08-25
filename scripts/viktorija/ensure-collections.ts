import {
  COLLECTION_DESCRIPTIONS,
  COLLECTION_TITLES,
  GROUP_DESCRIPTIONS,
  GROUP_TITLES,
} from "./category-map";
import { adminGraphql, sleep } from "./admin";

type CollectionCreateResult = {
  collectionCreate: {
    collection: { id: string; handle: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

type CollectionQuery = {
  collections: { nodes: { id: string; handle: string }[] };
};

const CREATE = `
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

const GET = `
  query CollectionByHandle($query: String!) {
    collections(first: 1, query: $query) {
      nodes { id handle }
    }
  }
`;

const UPDATE = `
  mutation CollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;

export type CollectionSpec = {
  handle: string;
  title: string;
  description: string;
  tag: string;
};

export function nitiCollectionSpecs(): CollectionSpec[] {
  const specs: CollectionSpec[] = [];
  for (const handle of Object.keys(COLLECTION_TITLES)) {
    specs.push({
      handle,
      title: COLLECTION_TITLES[handle]!,
      description: COLLECTION_DESCRIPTIONS[handle] ?? "",
      tag: `niti:${handle}`,
    });
  }
  for (const groupId of Object.keys(GROUP_TITLES)) {
    if (COLLECTION_TITLES[groupId]) continue;
    specs.push({
      handle: groupId,
      title: GROUP_TITLES[groupId]!,
      description: GROUP_DESCRIPTIONS[groupId] ?? "",
      tag: `room:${groupId}`,
    });
  }
  return specs;
}

function ruleInput(spec: CollectionSpec) {
  return {
    title: spec.title,
    handle: spec.handle,
    descriptionHtml: `<p>${spec.description}</p>`,
    ruleSet: {
      appliedDisjunctively: false,
      rules: [
        {
          column: "TAG",
          relation: "EQUALS",
          condition: spec.tag,
        },
      ],
    },
  };
}

export async function ensureCollection(spec: CollectionSpec): Promise<string> {
  const existing = await adminGraphql<CollectionQuery>(GET, {
    query: `handle:${spec.handle}`,
  });
  const found = existing.collections.nodes[0];
  if (found?.id) {
    const updated = await adminGraphql<{
      collectionUpdate: CollectionCreateResult["collectionCreate"];
    }>(UPDATE, {
      input: { id: found.id, ...ruleInput(spec) },
    });
    const err = updated.collectionUpdate.userErrors;
    if (err.length) {
      throw new Error(`${spec.handle}: ${err.map((e) => e.message).join("; ")}`);
    }
    return found.id;
  }

  const created = await adminGraphql<CollectionCreateResult>(CREATE, {
    input: ruleInput(spec),
  });
  const err = created.collectionCreate.userErrors;
  if (err.length) {
    throw new Error(`${spec.handle}: ${err.map((e) => e.message).join("; ")}`);
  }
  const id = created.collectionCreate.collection?.id;
  if (!id) throw new Error(`No id for ${spec.handle}`);
  return id;
}

async function main() {
  const specs = [
    ...nitiCollectionSpecs(),
    {
      handle: "novo-u-ponudi",
      title: "Novo u ponudi",
      description:
        "Proizvodi prikazani na početnoj stranici u sekciji Novo u ponudi. Tagujte proizvod sa novo-u-ponudi.",
      tag: "novo-u-ponudi",
    },
  ];
  console.log(`Ensuring ${specs.length} automated collections…`);
  for (const spec of specs) {
    const id = await ensureCollection(spec);
    console.log(`  ${spec.handle} → ${spec.tag} (${id.split("/").pop()})`);
    await sleep(250);
  }
  console.log("Done. Products tagged niti:* / room:* / novo-u-ponudi will appear after import.");
}

const isDirectRun = process.argv[1]?.includes("ensure-collections");

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
