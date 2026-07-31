import type { Graph, WithContext } from "schema-dts";

export function getDugbleSchemaGraph(): WithContext<Graph> {
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://dugble.com/#organization",
                name: "Dugble",
                url: "https://dugble.com",
                logo: {
                    "@type": "ImageObject",
                    "@id": "https://dugble.com/#logo",
                    url: "https://dugble.com/icon.png",
                    caption: "Dugble Logo",
                },
                description:
                    "Developer-first email and SMS API platform built for African startups and teams to send and track transactional messages like OTPs and alerts.",
                founders: [
                    { "@id": "https://dugble.com/#coffey-vidzro" },
                    { "@id": "https://dugble.com/#prosper-kessie" },
                ],
                areaServed: [
                    {
                        "@type": "Continent",
                        name: "Africa",
                    },
                ],
                knowsAbout: [
                    "Transactional SMS",
                    "Transactional Email",
                    "One-Time Password (OTP) Delivery",
                    "Developer APIs",
                    "Communications Platform as a Service (CPaaS)",
                    "Carrier Dynamic Routing",
                ],
                sameAs: [
                    "https://twitter.com/dugble",
                    "https://linkedin.com/company/dugble",
                    "https://github.com/dugble",
                ],
            },
            {
                "@type": "Person",
                "@id": "https://dugble.com/#coffey-vidzro",
                name: "Coffey Vidzro",
                jobTitle: "Founder",
                worksFor: {
                    "@id": "https://dugble.com/#organization",
                },
                url: "https://dugble.com/about#coffey-vidzro",
                sameAs: [
                    "https://linkedin.com/in/coffeyvidzro",
                    "https://twitter.com/coffeyvidzro",
                    "https://github.com/coffeyvidzro",
                ],
                knowsAbout: [
                    "Backend Architecture",
                    "Telecommunications Infrastructure",
                    "Messaging Gateways",
                    "Go (Programming Language)",
                ],
            },
            {
                "@type": "Person",
                "@id": "https://dugble.com/#prosper-kessie",
                name: "Prosper Kessie",
                jobTitle: "Co-Founder",
                worksFor: {
                    "@id": "https://dugble.com/#organization",
                },
                url: "https://dugble.com/about#prosper-kessie",
                sameAs: [
                    "https://linkedin.com/in/prosperkessie",
                    "https://twitter.com/prosperkessie",
                    "https://github.com/prosperkessie",
                ],
                knowsAbout: [
                    "Developer Experience (DX)",
                    "REST API & Webhooks Architecture",
                    "Software SDK Engineering",
                    "Product Design",
                ],
            },
            {
                "@type": "WebSite",
                "@id": "https://dugble.com/#website",
                url: "https://dugble.com",
                name: "Dugble",
                description:
                    "Developer-first transactional messaging API for Africa.",
                publisher: {
                    "@id": "https://dugble.com/#organization",
                },
                inLanguage: "en-US",
            },
            {
                "@type": "SoftwareApplication",
                "@id": "https://dugble.com/#application",
                name: "Dugble Messaging Platform",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "All",
                description:
                    "High-reliability transactional API platform for SMS and email delivery across Africa with dynamic carrier failover and webhook tracking.",
                provider: {
                    "@id": "https://dugble.com/#organization",
                },
                offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    description: "Pay-as-you-go developer API plans",
                },
            },
        ],
    };
}
