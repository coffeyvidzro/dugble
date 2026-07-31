import type { Metadata } from "next";

export function constructMetadata({
    title,
    description = "Arcnaid is a developer-first billing API for Africa, offering subscriptions, usage metering, and seamless mobile money integration.",
    image = "/assets/og.png",
    url,
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    noIndex?: boolean;
} = {}): Metadata {
    const pageTitle = title
        ? `${title} | Arcnaid`
        : "Arcnaid | Modern billing API built for Africa";

    return {
        title: pageTitle,
        description,
        metadataBase: new URL("https://arcnaid.com"),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: pageTitle,
            description,
            url,
            siteName: "Arcnaid",
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: "Arcnaid",
                },
            ],
            locale: "en_US",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description,
            images: [image],
            creator: "@arcnaid",
        },
        robots: {
            index: !noIndex,
            follow: !noIndex,
            googleBot: {
                index: !noIndex,
                follow: !noIndex,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.ico",
            apple: "/apple-touch-icon.png",
        },
    };
}
