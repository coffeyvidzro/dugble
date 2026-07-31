import type { Graph, Thing, WithContext } from "schema-dts";

import { baseUrl } from "@/lib/site";

const siteName = "Dugble";
const defaultDescription =
  "Developer-first A2P email and SMS APIs for African startups and teams.";
const organizationId = `${baseUrl}/#organization`;
const websiteId = `${baseUrl}/#website`;
const webApplicationId = `${baseUrl}/#web-application`;
const logoId = `${baseUrl}/#logo`;

type PageSchemaOptions = {
  title: string;
  description: string;
  path?: string;
  id?: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
};

type BlogPostingSchemaOptions = PageSchemaOptions & {
  publishedAt: string;
  modifiedAt?: string;
  category?: string;
  keywords?: string[];
  image?: string;
  authorName?: string;
  authorUrl?: string;
};

function absoluteUrl(path = "/"): string {
  return new URL(path, baseUrl).toString();
}

export function getDugbleSchemaGraph(): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        legalName: "Dugble",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          "@id": logoId,
          url: `${baseUrl}/dugble-logo.svg`,
          width: 512,
          height: 512,
          caption: "Dugble logo",
        },
        image: {
          "@id": logoId,
        },
        description:
          "Developer-first email and SMS API platform built for African startups and teams to send and track transactional messages like OTPs, receipts, and customer alerts.",
        founder: [
          {
            "@type": "Person",
            name: "Coffey Vidzro",
            url: `${baseUrl}/about#coffey-vidzro`,
          },
          {
            "@type": "Person",
            name: "Prosper Kessie",
            url: `${baseUrl}/about#prosper-kessie`,
          },
        ],
        areaServed: {
          "@type": "Continent",
          name: "Africa",
        },
        knowsAbout: [
          "Transactional SMS",
          "Transactional Email",
          "One-Time Password (OTP) Delivery",
          "Developer APIs",
          "Communications Platform as a Service (CPaaS)",
          "Carrier Dynamic Routing",
          "Webhook Delivery",
        ],
        sameAs: [
          "https://twitter.com/dugble",
          "https://linkedin.com/company/dugble",
          "https://github.com/dugble",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: baseUrl,
        name: siteName,
        description: defaultDescription,
        publisher: {
          "@id": organizationId,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": webApplicationId,
        name: siteName,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Communications Platform as a Service",
        operatingSystem: "Any",
        url: baseUrl,
        browserRequirements: "Requires JavaScript and a modern web browser.",
        description: defaultDescription,
        publisher: {
          "@id": organizationId,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${baseUrl}/pricing`,
        },
      },
    ],
  };
}

export function getHomePageSchemaGraph(): WithContext<Thing> {
  return getWebPageSchemaGraph({
    id: `${baseUrl}/#homepage`,
    path: "/",
    title: "Reliable A2P Messaging & Developer Infrastructure",
    description:
      "Send OTPs, receipts, alerts, and customer notifications with complete delivery transparency, signed webhooks, and developer-first logs.",
  });
}

function getBreadcrumbItems(
  title: string,
  path: string,
  breadcrumbs?: PageSchemaOptions["breadcrumbs"],
) {
  const items = breadcrumbs ?? (path === "/" ? [] : [{ name: title, path }]);

  return [
    {
      "@type": "ListItem" as const,
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    ...items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 2,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  ];
}

export function getWebPageSchemaGraph({
  title,
  description,
  path = "/",
  id,
  breadcrumbs,
}: PageSchemaOptions): WithContext<Thing> {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": id ?? `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: {
      "@id": websiteId,
    },
    about: {
      "@id": webApplicationId,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl("/og"),
      width: 1200,
      height: 630,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: getBreadcrumbItems(title, path, breadcrumbs),
    },
    inLanguage: "en-US",
  };
}

export function getBlogIndexSchemaGraph({
  title,
  description,
  path = "/blog",
}: PageSchemaOptions): WithContext<Thing> {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: title,
    description,
    publisher: {
      "@id": organizationId,
    },
    isPartOf: {
      "@id": websiteId,
    },
    inLanguage: "en-US",
  };
}

export function getPricingPageSchemaGraph(): Graph {
  const path = "/pricing";
  const url = absoluteUrl(path);
  const plans = [
    { name: "Free", price: "0", included: "1,000 emails per month" },
    { name: "Developer", price: "29", included: "50,000 emails per month" },
    { name: "Pro", price: "59", included: "100,000 emails per month" },
    { name: "Scale", price: "349", included: "500,000 emails per month" },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      getWebPageSchemaGraph({
        title: "Pricing & Plans",
        description:
          "Transparent, usage-based pricing for transactional email and A2P SMS messaging.",
        path,
      }),
      {
        "@type": "OfferCatalog",
        "@id": `${url}#pricing`,
        name: "Dugble Pricing",
        description:
          "Usage-based pricing for Dugble transactional email and A2P SMS messaging.",
        url,
        itemListElement: plans.map((plan) => ({
          "@type": "Offer",
          name: `${plan.name} Email API plan`,
          description: plan.included,
          price: plan.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url,
          itemOffered: {
            "@type": "Service",
            name: "Dugble Transactional Email API",
            provider: {
              "@id": organizationId,
            },
          },
        })),
      },
    ],
  };
}

export function getBlogPostingSchemaGraph({
  title,
  description,
  path,
  publishedAt,
  modifiedAt,
  category,
  keywords,
  image,
  authorName = "Dugble",
  authorUrl = baseUrl,
}: BlogPostingSchemaOptions): Graph {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image ?? `/og?title=${encodeURIComponent(title)}`);
  const webpageId = `${url}#webpage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": webpageId,
        url,
        name: title,
        description,
        isPartOf: {
          "@id": websiteId,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: getBreadcrumbItems(title, path ?? "/blog", [
            { name: "Blog", path: "/blog" },
            { name: title, path: path ?? "/blog" },
          ]),
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: imageUrl,
          width: 1200,
          height: 630,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "BlogPosting",
        "@id": `${url}#blogposting`,
        headline: title,
        description,
        url,
        datePublished: publishedAt,
        dateModified: modifiedAt ?? publishedAt,
        image: imageUrl,
        articleSection: category,
        keywords,
        author: {
          "@type": authorName === "Dugble" ? "Organization" : "Person",
          name: authorName,
          url: authorUrl,
        },
        publisher: {
          "@id": organizationId,
        },
        mainEntityOfPage: {
          "@id": webpageId,
        },
        inLanguage: "en-US",
      },
    ],
  };
}

/**
 * Serializes schema for use in an application/ld+json script.
 *
 * Escaping `<` prevents serialized data from accidentally terminating
 * the surrounding script element.
 */
export function serializeSchema(schema: Graph | WithContext<Thing>): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export function serializeDugbleSchemaGraph(): string {
  return serializeSchema(getDugbleSchemaGraph());
}
