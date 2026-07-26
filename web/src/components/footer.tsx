import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { SocialLinks } from "./social-links";

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
      {
        label: "API reference",
        href: "/docs/api-reference/introduction",
      },
      { label: "Changelog", href: "/changelog" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Brand", href: "/brand" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Footer() {
    return (
        <Reveal as="footer" className="space-y-10 border-t pt-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-4">
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
                    <SocialLinks />
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
            <div className="flex flex-col items-center justify-between gap-4 border-t pb-8 pt-6 text-xs text-muted-foreground sm:flex-row">
                <div className="flex items-center gap-4">
                    <span>
                        © {new Date().getFullYear()} Dugble. All rights
                        reserved.
                    </span>
                    <Link
                        href="/legal/terms"
                        className="hover:text-foreground transition-colors"
                    >
                        Terms
                    </Link>
                    <Link
                        href="/legal/privacy"
                        className="hover:text-foreground transition-colors"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/sitemap"
                        className="hover:text-foreground transition-colors"
                    >
                        Sitemap
                    </Link>
                </div>
                <ThemeToggle />
            </div>
        </Reveal>
    );
}
