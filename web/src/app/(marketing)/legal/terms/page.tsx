import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "API and dashboard terms for using Dugble's A2P messaging infrastructure.",
    openGraph: {
        title: "Terms of Service",
        description:
            "API and dashboard terms for using Dugble's A2P messaging infrastructure.",
        url: "/legal/terms",
    },
};

export default function Page() {
    return (
        <main className="min-h-svh bg-background text-foreground">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-8 lg:px-8">
                <article className="space-y-6 py-16">
                    <p className="font-medium text-primary text-sm uppercase tracking-[0.2em]">
                        Terms
                    </p>
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        Terms placeholder.
                    </h1>
                    <p className="text-muted-foreground leading-8">
                        This is a product placeholder for Dugble API and
                        dashboard terms. It should be replaced by
                        counsel-reviewed legal language before launch.
                    </p>
                    <p className="text-muted-foreground leading-8">
                        The expected use is lawful A2P messaging, secure API key
                        handling, recipient consent, and responsible monitoring
                        of delivery logs and webhook outcomes.
                    </p>
                </article>
            </div>
        </main>
    );
}
