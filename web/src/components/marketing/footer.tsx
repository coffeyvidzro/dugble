import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";

const columns = [
    {
        title: "Features",
        links: [
            { label: "Email API", href: "/features/email-api" },
            { label: "SMS API", href: "/features/sms-api" },
            { label: "Webhooks", href: "/features/webhooks" },
            { label: "Pricing", href: "/pricing" },
        ],
    },
    {
        title: "Developers",
        links: [
            { label: "Documentation", href: "/docs" },
            { label: "Quickstart", href: "/quickstart" },
            { label: "API reference", href: "/quickstart" },
            { label: "Security", href: "/security" },
            { label: "Status", href: "/status" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Blog", href: "/blog" },
            { label: "Contact", href: "/contact" },
            { label: "Terms", href: "/legal/terms" },
            { label: "Privacy", href: "/legal/privacy" },
        ],
    },
];

export function Footer() {
    return (
        <Reveal as="footer" className="space-y-10 border-t pt-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="inline-block font-heading text-lg font-semibold tracking-tight transition-opacity hover:opacity-90"
                    >
                        Dugble
                    </Link>
                    <p className="max-w-55 text-sm leading-6 text-muted-foreground">
                        Email and SMS APIs for products that need messages
                        delivered and proven.
                    </p>
                </div>
                {columns.map((col) => (
                    <div key={col.title} className="space-y-3">
                        <p className="text-sm font-medium">{col.title}</p>
                        <ul className="space-y-2">
                            {col.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-3 border-t pb-8 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                    © {new Date().getFullYear()} Dugble. All rights reserved.
                </span>
            </div>
        </Reveal>
    );
}
