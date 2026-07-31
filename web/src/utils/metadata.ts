import type { Metadata } from "next";
import { baseUrl } from "@/lib/site";

const siteName = "Dugble";
const defaultTitle = "Developer-first A2P email and SMS APIs for Africa";
const defaultDescription =
  "Developer-first A2P email and SMS APIs for African startups and teams.";

function getAbsoluteUrl(path = "/"): string {
  return new URL(path, baseUrl).toString();
}

export function constructMetadata({
  title,
  description = defaultDescription,
  image = "/og",
  url,
  noIndex = false,
  openGraph,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  openGraph?: Metadata["openGraph"];
} = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} | ${defaultTitle}`;
  const canonicalUrl = getAbsoluteUrl(url);
  const imageUrl = getAbsoluteUrl(image);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      absolute: pageTitle,
    },
    description,
    applicationName: siteName,
    authors: [{ name: siteName, url: baseUrl }],
    creator: siteName,
    publisher: siteName,
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
      canonical: canonicalUrl,
      languages: {
        "en-US": canonicalUrl,
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonicalUrl,
      siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: "en_US",
      type: "website",
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [imageUrl],
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
