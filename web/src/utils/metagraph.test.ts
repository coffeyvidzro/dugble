import { describe, expect, test } from "bun:test";
import {
  getBlogPostingSchemaGraph,
  getDugbleSchemaGraph,
  getPricingPageSchemaGraph,
  serializeSchema,
} from "./metagraph";

type GraphNode = Record<string, unknown>;

function nodes(schema: { "@graph"?: readonly unknown[] }): GraphNode[] {
  return (schema["@graph"] ?? []) as GraphNode[];
}

describe("SEO schema graphs", () => {
  test("does not advertise a non-functional site search action", () => {
    const website = nodes(getDugbleSchemaGraph()).find(
      (node) => node["@type"] === "WebSite",
    );

    expect(website).toBeDefined();
    expect(website).not.toHaveProperty("potentialAction");
  });

  test("uses the current founder property and an SEO-ready logo", () => {
    const organization = nodes(getDugbleSchemaGraph()).find(
      (node) => node["@type"] === "Organization",
    );

    expect(organization).toHaveProperty("founder");
    expect(organization).not.toHaveProperty("founders");

    const logo = organization?.logo as GraphNode;
    expect(logo.url).toBe("https://dugble.com/dugble-logo.svg");
    expect(logo.width).toBeGreaterThanOrEqual(112);
    expect(logo.height).toBeGreaterThanOrEqual(112);
  });

  test("connects blog posts to an emitted WebPage node", () => {
    const graph = getBlogPostingSchemaGraph({
      title: "Reliable OTP delivery",
      description: "How to build a reliable OTP flow.",
      path: "/blog/reliable-otp-delivery",
      publishedAt: "2026-07-31",
      category: "Guides",
    });
    const graphNodes = nodes(graph);
    const article = graphNodes.find((node) => node["@type"] === "BlogPosting");
    const webpage = graphNodes.find((node) => node["@type"] === "WebPage");

    expect(webpage).toBeDefined();
    expect(article?.mainEntityOfPage).toEqual({ "@id": webpage?.["@id"] });
  });

  test("publishes visible pricing plans as offers", () => {
    const catalog = nodes(getPricingPageSchemaGraph()).find(
      (node) => node["@type"] === "OfferCatalog",
    );
    const offers = catalog?.itemListElement as GraphNode[];

    expect(offers).toHaveLength(4);
    expect(offers.map((offer) => offer.price)).toEqual([
      "0",
      "29",
      "59",
      "349",
    ]);
  });

  test("escapes markup that could terminate the JSON-LD script", () => {
    expect(
      serializeSchema({
        "@context": "https://schema.org",
        "@type": "Thing",
        name: "</script>",
      }),
    ).not.toContain("</script>");
  });
});
