import type { Metadata } from "next";
import { baseUrl } from "@/lib/site";

export function constructMetadata({
  title,
  description = "Developer-first A2P email and SMS APIs for African startups and teams.",
  image = "/og",
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
    ? `${title} | Dugble`
    : "Dugble | Developer-first A2P email and SMS APIs for Africa";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      absolute: pageTitle,
    },
    description,
    applicationName: "Dugble",
    authors: [{ name: "Dugble", url: baseUrl }],
    creator: "Dugble",
    publisher: "Dugble",
    category: "technology",
    referrer: "origin-when-cross-origin",
    keywords: [
      "A2P messaging",
      "SMS API",
      "Email API",
      "OTP delivery",
      "developer infrastructure",
      "African startups",
    ],
    alternates: {
      canonical: url,
      languages: {
        "en-US": url ?? "/",
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: "Dugble",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
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
      creator: "@dugble",
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
    },
  };
}
