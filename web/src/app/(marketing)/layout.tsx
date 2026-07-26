import { Footer } from "@/components/footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MarketingNav />
      <div className="flex-1">{children}</div>
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <Footer />
      </div>
    </>
  );
}
