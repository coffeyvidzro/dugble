import { changelogEntries } from "@/components/marketing/changelog/changelog-data";

export type CommandItem = {
  group:
    | "Features"
    | "Resources"
    | "Company"
    | "Legal"
    | "Account"
    | "Recent updates";
  title: string;
  description?: string;
  href: string;
  keywords?: string[];
};

const staticItems: CommandItem[] = [
  // Features
  {
    group: "Features",
    title: "A2P API",
    description: "One API for every messaging channel.",
    href: "/features/a2p-api",
    keywords: ["unified", "platform", "channel"],
  },
  {
    group: "Features",
    title: "SMS API",
    description: "OTP, alerts, and transactional A2P SMS.",
    href: "/features/sms-api",
    keywords: ["otp", "text", "phone"],
  },
  {
    group: "Features",
    title: "Email API",
    description: "Receipts, password resets, and lifecycle email.",
    href: "/features/email-api",
    keywords: ["transactional", "receipt", "mail"],
  },
  {
    group: "Features",
    title: "Webhooks",
    description: "Delivery events, retries, and signatures.",
    href: "/features/webhooks",
    keywords: ["events", "retry", "signature"],
  },
  {
    group: "Features",
    title: "Pricing",
    description: "Usage-based pricing by channel.",
    href: "/pricing",
    keywords: ["cost", "billing", "plan"],
  },

  // Resources
  {
    group: "Resources",
    title: "Documentation",
    description: "Full API reference and integration guides.",
    href: "/docs",
    keywords: ["docs", "reference", "api"],
  },
  {
    group: "Resources",
    title: "Quickstart",
    description: "From API key to traceable message.",
    href: "/quickstart",
    keywords: ["get started", "setup", "curl"],
  },
  {
    group: "Resources",
    title: "Changelog",
    description: "What's shipping in Dugble.",
    href: "/changelog",
    keywords: ["updates", "release", "new"],
  },
  {
    group: "Resources",
    title: "Blog",
    description: "Developer experience and A2P messaging notes.",
    href: "/blog",
  },
  {
    group: "Resources",
    title: "Status",
    description: "Live uptime and incident history.",
    href: "/status",
    keywords: ["uptime", "incidents", "outage"],
  },

  // Company
  {
    group: "Company",
    title: "About",
    description: "Learn about the team building Dugble.",
    href: "/about",
  },
  {
    group: "Company",
    title: "Brand",
    description: "Logos, color, type, and voice guidelines.",
    href: "/brand",
    keywords: ["logo", "press", "assets", "kit"],
  },
  {
    group: "Company",
    title: "Contact",
    description: "Talk to Dugble about A2P messaging.",
    href: "/contact",
    keywords: ["support", "sales", "help"],
  },
  {
    group: "Company",
    title: "Security",
    description: "Security for message-sending infrastructure.",
    href: "/security",
    keywords: ["keys", "signatures", "sessions"],
  },

  // Legal
  {
    group: "Legal",
    title: "Terms of service",
    href: "/legal/terms",
    keywords: ["terms"],
  },
  {
    group: "Legal",
    title: "Privacy policy",
    href: "/legal/privacy",
    keywords: ["privacy", "gdpr", "data"],
  },

  // Account
  {
    group: "Account",
    title: "Sign in",
    href: "/login",
    keywords: ["login", "/login", "authenticate", "signin"],
  },
  {
    group: "Account",
    title: "Start building",
    description: "Create a workspace and get an API key.",
    href: "/sign-up",
    keywords: ["sign up", "signup", "/sign-up", "/register", "create account"],
  },
];

const changelogItems: CommandItem[] = changelogEntries
  .slice(0, 6)
  .map((entry) => ({
    group: "Recent updates" as const,
    title: entry.title,
    description: entry.description,
    href: "/changelog",
    keywords: [entry.tag],
  }));

export const commandItems: CommandItem[] = [...staticItems, ...changelogItems];
