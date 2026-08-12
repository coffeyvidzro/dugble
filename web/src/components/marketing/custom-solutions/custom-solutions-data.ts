import type { LucideIcon } from "lucide-react";
import {
    Blocks,
    Building2,
    CalendarClock,
    Globe,
    Landmark,
    Layers,
    Network,
    ShoppingBag,
    Store,
    Truck,
    Workflow,
} from "lucide-react";

export type Capability = {
    icon: LucideIcon;
    title: string;
    description: string;
};

export const capabilities: Capability[] = [
    {
        icon: Blocks,
        title: "Custom integrations",
        description:
            "Bespoke connectors into the systems you already run - CRMs, core banking platforms, legacy SMPP gateways, or an internal notification service you don't want to rebuild.",
    },
    {
        icon: Layers,
        title: "Dedicated infrastructure",
        description:
            "Isolated sending infrastructure, dedicated IPs or short codes, and rate limits tuned to your traffic instead of a shared pool.",
    },
    {
        icon: Landmark,
        title: "Compliance & registration",
        description:
            "Help navigating A2P 10DLC registration, sender ID approvals, and the regulatory requirements that differ by carrier and by country.",
    },
    {
        icon: Network,
        title: "Throughput engineering",
        description:
            "Architecture review for high-volume sending: priority queues, custom retry and backoff strategies, and failover across providers.",
    },
    {
        icon: Workflow,
        title: "Webhook & workflow design",
        description:
            "Event schemas and delivery workflows built around how your product actually needs to react to a message, not just a generic status field.",
    },
    {
        icon: Globe,
        title: "Migration & onboarding",
        description:
            "A staged, zero-downtime migration off a legacy provider, with an engineer on the call for the cutover, not just the kickoff.",
    },
];

export type ProcessStep = {
    title: string;
    duration: string;
    description: string;
};

export const processSteps: ProcessStep[] = [
    {
        title: "Discovery call",
        duration: "~30–45 minutes",
        description:
            "A working conversation about your volume, compliance constraints, and where the standard API stops covering what you need.",
    },
    {
        title: "Scoping & proposal",
        duration: "Usually within a week",
        description:
            "A fixed-scope proposal covering architecture, timeline, and pricing - no open-ended retainers.",
    },
    {
        title: "Build & integrate",
        duration: "Set in your proposal",
        description:
            "An engineer who's worked on the core platform pairs with your team through implementation, not a project manager relaying messages.",
    },
    {
        title: "Launch & ongoing support",
        duration: "Starts at go-live",
        description:
            "You go live with monitoring in place and a direct line to the team that built it - not a shared support queue.",
    },
];

export type ComparisonColumn = {
    eyebrow: string;
    label: string;
    points: string[];
};

export const comparisonColumns: [ComparisonColumn, ComparisonColumn] = [
    {
        eyebrow: "Self-serve",
        label: "Standard API",
        points: [
            "Sign up and get an API key in minutes",
            "Usage-based pricing, pay as you send",
            "Shared sending infrastructure",
            "Docs, changelog, and community support",
        ],
    },
    {
        eyebrow: "Custom",
        label: "Custom solutions",
        points: [
            "Scoped engagement with a dedicated engineer",
            "Fixed-scope pricing tied to the proposal",
            "Dedicated infrastructure where it matters",
            "Direct line to the team that built it",
        ],
    },
];

export type EngagementModel = {
    name: string;
    tagline: string;
    bestFor: string;
    features: string[];
    highlight?: boolean;
};

export const engagementModels: EngagementModel[] = [
    {
        name: "Integration Sprint",
        tagline: "A focused build for one specific gap.",
        bestFor:
            "Best for: a single integration or migration with a clear scope.",
        features: [
            "One dedicated engineer",
            "Fixed timeline, fixed scope",
            "Standard sending infrastructure",
            "2-week post-launch support window",
        ],
    },
    {
        name: "Managed Scale",
        tagline: "Infrastructure and support sized for growth.",
        bestFor: "Best for: teams outgrowing shared infrastructure.",
        features: [
            "Dedicated sending infrastructure",
            "Custom throughput & failover rules",
            "Priority support channel",
            "Quarterly architecture review",
        ],
        highlight: true,
    },
    {
        name: "Enterprise Partnership",
        tagline: "An ongoing relationship, not a one-off project.",
        bestFor: "Best for: regulated or multi-region senders.",
        features: [
            "Dedicated engineering time on retainer",
            "Compliance & carrier registration support",
            "Custom SLAs and reporting",
            "Direct Slack Connect with the team",
        ],
    },
];

export const engagementModelOptions: string[] = engagementModels.map(
    (model) => model.name,
);

export type UseCase = {
    icon: LucideIcon;
    title: string;
    description: string;
};

export const useCases: UseCase[] = [
    {
        icon: Landmark,
        title: "Fintech OTP at scale",
        description:
            "Sub-second delivery expectations, strict compliance requirements, and no tolerance for a dropped verification code.",
    },
    {
        icon: Truck,
        title: "Logistics & delivery tracking",
        description:
            "High-frequency status updates that need to survive carrier throttling without falling behind the truck.",
    },
    {
        icon: Store,
        title: "Marketplaces & platforms",
        description:
            "Messaging on behalf of thousands of sellers or providers, each needing their own sender identity and delivery visibility.",
    },
    {
        icon: Building2,
        title: "Internal enterprise tooling",
        description:
            "Notifications wired into systems that were never built to talk to the outside world - ticketing, ERPs, internal dashboards.",
    },
    {
        icon: ShoppingBag,
        title: "Retail & e-commerce updates",
        description:
            "Order confirmations, shipping updates, and cart recovery sent at volumes that make shared infrastructure start to strain.",
    },
    {
        icon: CalendarClock,
        title: "Appointment & scheduling reminders",
        description:
            "Time-sensitive reminders where a delay or a duplicate send is more than a minor inconvenience.",
    },
];

export type Faq = {
    question: string;
    answer: string;
};

export const faqs: Faq[] = [
    {
        question: "How is this different from the standard plan?",
        answer: "The standard API is self-serve: sign up, get a key, start sending. Custom solutions involve our team directly - scoping your architecture, building integrations, and in some cases standing up dedicated infrastructure.",
    },
    {
        question: "How is pricing determined?",
        answer: "Every engagement gets a fixed-scope quote after the discovery call, based on integration complexity, infrastructure footprint, and support level - not a generic per-seat or per-message markup.",
    },
    {
        question: "Is there a minimum volume to qualify?",
        answer: "No hard minimum. What matters more is fit: teams with compliance requirements, legacy systems to integrate with, or reliability needs the standard plan doesn't cover.",
    },
    {
        question: "What does a typical engagement look like?",
        answer: "Most start with a discovery call, followed by a fixed-scope proposal. Build timelines vary with complexity, but every engagement is scoped up front so you know what you're getting before it starts.",
    },
    {
        question: "Can we run a proof of concept first?",
        answer: "Yes - the Integration Sprint model exists for exactly this: a scoped, time-boxed build before committing to anything larger.",
    },
    {
        question:
            "Can we start on the standard API and move to a custom setup later?",
        answer: "Yes. Most custom engagements start on the standard API. Moving to a custom setup doesn't require a rewrite - we build on top of the same primitives.",
    },
    {
        question: "What happens if our needs change mid-engagement?",
        answer: "Scope changes get a written amendment before any additional work starts, so pricing and timeline never move without your sign-off.",
    },
    {
        question: "Do you support private networking or on-prem components?",
        answer: "It depends on the requirement. VPC peering, IP allowlisting, and self-hosted components are all things we can discuss on the scoping call.",
    },
];

export type HeroStat = {
    label: string;
    value: string;
};

export const heroStats: HeroStat[] = [
    { label: "First response", value: "Same business day" },
    { label: "Discovery call", value: "30 minutes" },
    { label: "Engineer access", value: "Direct, no ticket queue" },
    { label: "Engagement basis", value: "Fixed scope, no retainer" },
];

export const includedItems: string[] = [
    "Direct access to the engineer who builds it, not an account manager relay",
    "A written scope and timeline before any work starts",
    "Signed webhooks and exportable delivery logs by default",
    "A dedicated Slack Connect channel for the length of the engagement",
    "Support for A2P 10DLC and carrier registration paperwork",
    "A 30-day check-in after launch to tune anything that needs it",
];

export type TechnicalCodeExample = {
    label: string;
    filename: string;
    code: string;
};

export const technicalExamples: TechnicalCodeExample[] = [
    {
        label: "Routing",
        filename: "Dedicated sending config",
        code: `{
  "workspace": "wsp_4b71ea",
  "sending_pool": "dedicated",
  "routes": [
    { "channel": "sms", "provider": "primary", "failover": "secondary" }
  ],
  "rate_limit": { "per_second": 250, "burst": 500 }
}`,
    },
    {
        label: "Webhooks",
        filename: "Signed delivery event",
        code: `POST /hooks/dugble HTTP/1.1
X-Dugble-Signature: t=1755000000,v1=5a8f3c9e2b1d...
Content-Type: application/json

{
  "event": "message.delivered",
  "message_id": "msg_9c41af",
  "workspace": "wsp_4b71ea",
  "channel": "sms",
  "delivered_at": "2026-08-12T09:14:02Z"
}`,
    },
    {
        label: "Compliance",
        filename: "Sender registration payload",
        code: `{
  "campaign": {
    "use_case": "otp",
    "vertical": "fintech",
    "sample_message": "Your Dugble code is 482913.",
    "opt_in_flow": "app-signup"
  },
  "status": "pending_carrier_review"
}`,
    },
];

export type SectionNavItem = {
    id: string;
    label: string;
};

export const sectionNavItems: SectionNavItem[] = [
    { id: "capabilities", label: "Capabilities" },
    { id: "models", label: "Engagement models" },
    { id: "process", label: "How it works" },
    { id: "use-cases", label: "Use cases" },
    { id: "technical", label: "Technical" },
    { id: "security", label: "Security" },
    { id: "faq", label: "FAQ" },
    { id: "request", label: "Get started" },
];
