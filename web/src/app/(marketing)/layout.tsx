import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { getDugbleSchemaGraph } from "@/utils/metagraph";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd id="dugble-schema-graph" schema={getDugbleSchemaGraph()} />
      <MarketingNav />
      <div className="flex-1">{children}</div>
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <Footer />
      </div>
    </>
  );
}
