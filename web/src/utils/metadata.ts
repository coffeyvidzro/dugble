import type { Metadata } from "next";
import { baseUrl } from "@/lib/site";

const siteName = "Dugble";
const defaultTitle = "Email & SMS APIs for Africa";
const defaultDescription =
  "Developer-first A2P email and SMS APIs for African startups and teams.";
const defaultKeywords = [
  "A2P messaging",
  "SMS API",
  "Email API",
  "OTP delivery",
  "developer infrastructure",
  "African startups",
];

type MetadataPreset = "marketing" | "auth" | "dashboard" | "legal";

type MetadataImage =
  | string
  | {
      title?: string;
      label?: string;
    };

type ConstructMetadataOptions = {
  title?: string;
  description?: string;
  image?: MetadataImage;
  path?: string;
  /** @deprecated Use path instead. */
  url?: string;
  preset?: MetadataPreset;
  noIndex?: boolean;
  openGraph?: Metadata["openGraph"];
  keywords?: string[];
};

function getAbsoluteUrl(path = "/"): string {
  return new URL(path, baseUrl).toString();
}

function getImagePath(image: MetadataImage, title: string): string {
  if (typeof image === "string") {
    return image;
  }

  const params = new URLSearchParams();
  params.set("title", image.title ?? title);

  if (image.label) {
    params.set("label", image.label);
  }

  return `/og?${params.toString()}`;
}

export function constructMetadata({
  title,
  description = defaultDescription,
  image = "/og",
  path,
  url,
  preset = "marketing",
  noIndex,
  openGraph,
  keywords,
}: ConstructMetadataOptions = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} | ${defaultTitle}`;
  const canonicalUrl = getAbsoluteUrl(path ?? url);
  const imageUrl = getAbsoluteUrl(getImagePath(image, pageTitle));
  const shouldNoIndex = noIndex ?? ["auth", "dashboard"].includes(preset);

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
    keywords: [...new Set([...defaultKeywords, ...(keywords ?? [])])],
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
      index: !shouldNoIndex,
      follow: !shouldNoIndex,
      googleBot: {
        index: !shouldNoIndex,
        follow: !shouldNoIndex,
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
