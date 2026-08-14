import Link from "next/link";

export function LegalContactFooter() {
    return (
        <div className="rounded-2xl border bg-card/40 p-6 text-sm leading-6 text-muted-foreground">
            Questions about this document? Reach us at{" "}
            <a
                href="mailto:hello@dugble.com"
                className="text-signal hover:underline"
            >
                hello@dugble.com
            </a>{" "}
            or through our{" "}
            <Link href="/contact" className="text-signal hover:underline">
                contact page
            </Link>
            .
        </div>
    );
}
