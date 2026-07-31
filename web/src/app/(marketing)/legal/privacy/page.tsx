import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Dugble handles account, workspace, recipient, message, and webhook data.",
  path: "/legal/privacy",
  preset: "legal",
});

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-8 lg:px-8">
        <article className="space-y-6 py-16">
          <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Privacy
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Privacy placeholder.
          </h1>
          <p className="text-muted-foreground leading-8">
            This is a product placeholder for how Dugble expects to handle
            account, workspace, recipient, message, and webhook data. It should
            be replaced by counsel-reviewed legal language before launch.
          </p>
          <p className="text-muted-foreground leading-8">
            The product principle is to collect what message delivery needs,
            protect operational logs, and make retention rules clear.
          </p>
        </article>
      </div>
    </main>
  );
}
