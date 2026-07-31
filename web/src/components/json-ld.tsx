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
      dangerouslySetInnerHTML={{ __html: serializeSchema(schema) }}
    />
  );
}
