import { getDugbleSchemaGraph } from "@/utils/SchemaGraph";

export default function SchemaGraph() {
    const schema = getDugbleSchemaGraph();

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
