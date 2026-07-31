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

export function getWebPageSchemaGraph({
  title,
  description,
  path = "/",
  id,
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
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        ...(path === "/"
          ? []
          : [
              {
                "@type": "ListItem" as const,
                position: 2,
                name: title,
                item: url,
              },
            ]),
      ],
    },
    inLanguage: "en-US",
  };
}

export function getBlogPostingSchemaGraph({
  title,
  description,
  path,
  publishedAt,
}: PageSchemaOptions & { publishedAt: string }): WithContext<Thing> {
  const url = absoluteUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#blogposting`,
    headline: title,
    description,
    url,
    datePublished: publishedAt,
    dateModified: publishedAt,
    image: absoluteUrl(`/og?title=${encodeURIComponent(title)}`),
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
