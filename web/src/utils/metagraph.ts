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
          url: `${baseUrl}/icon.png`,
          caption: "Dugble logo",
        },
        image: {
          "@id": logoId,
        },
        description:
          "Developer-first email and SMS API platform built for African startups and teams to send and track transactional messages like OTPs, receipts, and customer alerts.",
        founders: [
          { "@id": `${baseUrl}/#coffey-vidzro` },
          { "@id": `${baseUrl}/#prosper-kessie` },
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
          "Webhook Delivery",
        ],
        sameAs: [
          "https://twitter.com/dugble",
          "https://linkedin.com/company/dugble",
          "https://github.com/dugble",
        ],
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#coffey-vidzro`,
        name: "Coffey Vidzro",
        jobTitle: "Founder",
        worksFor: {
          "@id": organizationId,
        },
        url: `${baseUrl}/about#coffey-vidzro`,
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
        "@id": `${baseUrl}/#prosper-kessie`,
        name: "Prosper Kessie",
        jobTitle: "Co-Founder",
        worksFor: {
          "@id": organizationId,
        },
        url: `${baseUrl}/about#prosper-kessie`,
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
        "@id": websiteId,
        url: baseUrl,
        name: siteName,
        description: defaultDescription,
        publisher: {
          "@id": organizationId,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/sitemap?query={search_term_string}`,
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
      width: "1200",
      height: "630",
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

export function getPricingPageSchemaGraph(): WithContext<Thing> {
  const path = "/pricing";
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${url}#pricing`,
    name: "Dugble Pricing",
    description:
      "Usage-based pricing for Dugble transactional email and A2P SMS messaging.",
    url,
    itemListElement: [
      {
        "@type": "Offer",
        name: "Transactional Email API",
        category: "Email API",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Dugble Email API",
          provider: {
            "@id": organizationId,
          },
        },
      },
      {
        "@type": "Offer",
        name: "A2P SMS API",
        category: "SMS API",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Dugble SMS API",
          provider: {
            "@id": organizationId,
          },
        },
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
}: BlogPostingSchemaOptions): WithContext<Thing> {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#blogposting`,
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
    image: absoluteUrl(image ?? `/og?title=${encodeURIComponent(title)}`),
    articleSection: category,
    keywords,
    author: {
      "@id": organizationId,
    },
    publisher: {
      "@id": organizationId,
    },
    mainEntityOfPage: {
      "@id": `${url}#webpage`,
    },
    inLanguage: "en-US",
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
