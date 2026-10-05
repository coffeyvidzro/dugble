import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { RootDocument } from "@/components/layout/root-document";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { constructMetadata } from "@/utils/metadata";
import { getDugbleSchemaGraph } from "@/utils/metagraph";

export const metadata = constructMetadata();

export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <RootDocument>
      <JsonLd id="dugble-schema-graph" schema={getDugbleSchemaGraph()} />
      <MarketingNav />
      <div className="flex-1">{children}</div>
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <Footer />
      </div>
    </RootDocument>
  );
}
