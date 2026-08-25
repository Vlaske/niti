import { adminGraphql } from "./admin";

type PublicationsQuery = {
  publications: {
    nodes: { id: string; name: string }[];
  };
};

const PUBLICATIONS = `
  query Publications {
    publications(first: 25) {
      nodes { id name }
    }
  }
`;

const PUBLISH = `
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }
`;

export async function listPublications(): Promise<{ id: string; name: string }[]> {
  const data = await adminGraphql<PublicationsQuery>(PUBLICATIONS);
  return data.publications.nodes;
}

export async function publishToAll(
  resourceId: string,
  publicationIds: string[]
): Promise<void> {
  if (!publicationIds.length) return;
  const data = await adminGraphql<{
    publishablePublish: { userErrors: { message: string }[] };
  }>(PUBLISH, {
    id: resourceId,
    input: publicationIds.map((publicationId) => ({ publicationId })),
  });
  const err = data.publishablePublish.userErrors;
  if (err.length) {
    throw new Error(err.map((e) => e.message).join("; "));
  }
}
