// src/components/json-ld.tsx

import type { Graph, Thing, WithContext } from "schema-dts";
import { serializeSchema } from "@/utils/metagraph";

type JsonLdProps = {
  id: string;
  schema: Graph | WithContext<Thing>;
};

export function JsonLd({ id, schema }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD data block; serializeSchema escapes "<" so it cannot close the script element.
      dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
    />
  );
}
