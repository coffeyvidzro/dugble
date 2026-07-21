export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  readingTime: string;
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "developer-first-a2p-messaging",
    title: "What developer-first A2P messaging means for Dugble",
    summary:
      "How Dugble is thinking about API design, delivery visibility, and customer messaging workflows for African teams.",
    publishedAt: "2026-07-21",
    category: "Product",
    readingTime: "4 min read",
    content: [
      "Application-to-person messaging should feel predictable for developers. A team should be able to create an API key, send a test message, inspect delivery state, and wire webhooks without reading through vague provider behavior.",
      "Dugble is being shaped around that developer experience: clean APIs, clear error states, useful logs, and workflows that make email and SMS easier to operate in production.",
      "For African teams, A2P messaging also needs local context. Sender identity, SMS routing, retries, receipts, OTPs, and delivery debugging all matter when customer trust depends on each notification arriving on time.",
    ],
  },
  {
    slug: "a2p-sms-for-otp-flows",
    title: "Designing A2P SMS APIs for OTP flows",
    summary:
      "A practical look at OTP messaging requirements, delivery feedback, and the developer workflows behind verification flows.",
    publishedAt: "2026-07-21",
    category: "Guides",
    readingTime: "3 min read",
    content: [
      "OTP traffic is one of the most trust-sensitive A2P use cases. When a verification code is delayed or silently fails, customers cannot finish sign-up, checkout, or account recovery.",
      "A strong OTP API should make it easy to send the message, track the request, inspect provider responses, and react to delivery events through webhooks.",
      "Dugble's product surface is being scaffolded around those jobs: API keys, message logs, sender setup, delivery status, and team access from one dashboard.",
    ],
  },
];

export function getBlogPosts(): BlogPost[] {
  return blogPosts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
