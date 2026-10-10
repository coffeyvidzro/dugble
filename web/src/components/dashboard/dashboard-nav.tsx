import type { LucideIcon } from "lucide-react";
import {
  Ban,
  BarChart3,
  BookOpen,
  Code2,
  Fingerprint,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  List,
  Mail,
  Megaphone,
  MessageCircle,
  Radio,
  Receipt,
  Send,
  ShieldCheck,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export type DashboardPortal = {
  id: string;
  label: string;
  /** Short name used in breadcrumbs and command palette groups. */
  shortLabel: string;
  icon: LucideIcon;
  groups: DashboardNavGroup[];
};

export const dashboardPortals: DashboardPortal[] = [
  {
    id: "sms",
    label: "SMS portal",
    shortLabel: "SMS",
    icon: MessageCircle,
    groups: [
      {
        label: "Overview",
        items: [
          {
            title: "Overview",
            href: "/dashboard/sms",
            icon: LayoutDashboard,
            description: "SMS delivery at a glance.",
          },
          {
            title: "Analytics",
            href: "/dashboard/sms/reports",
            icon: BarChart3,
            description: "SMS delivery and engagement reports.",
          },
        ],
      },
      {
        label: "Messaging",
        items: [
          {
            title: "Send SMS",
            href: "/dashboard/sms/send",
            icon: Send,
            description: "Compose and send an SMS message.",
          },
          {
            title: "Logs",
            href: "/dashboard/sms/history",
            icon: List,
            description: "Every SMS sent from this workspace.",
          },
          {
            title: "Campaigns",
            href: "/dashboard/sms/campaigns",
            icon: Megaphone,
            description: "Scheduled and recurring SMS sends.",
          },
        ],
      },
      {
        label: "Setup",
        items: [
          {
            title: "Sender IDs",
            href: "/dashboard/sms/sender-ids",
            icon: Fingerprint,
            description: "Verified sender identities and numbers.",
          },
        ],
      },
    ],
  },
  {
    id: "email",
    label: "Email portal",
    shortLabel: "Email",
    icon: Mail,
    groups: [
      {
        label: "Overview",
        items: [
          {
            title: "Overview",
            href: "/dashboard/email",
            icon: LayoutDashboard,
            description: "Email delivery at a glance.",
          },
          {
            title: "Logs",
            href: "/dashboard/email/emails",
            icon: List,
            description: "Every email sent from this workspace.",
          },
          {
            title: "Analytics",
            href: "/dashboard/email/metrics",
            icon: LineChart,
            description: "Deliverability charts.",
          },
        ],
      },
      {
        label: "Sending",
        items: [
          {
            title: "Domains",
            href: "/dashboard/email/domains",
            icon: Globe,
            description: "SPF, DKIM, and DMARC configuration.",
          },
          {
            title: "Templates",
            href: "/dashboard/email/templates",
            icon: LayoutTemplate,
            description: "Reusable HTML templates.",
          },
          {
            title: "Broadcasts",
            href: "/dashboard/email/broadcasts",
            icon: Megaphone,
            description: "One-time and scheduled sends.",
          },
        ],
      },
    ],
  },
  {
    id: "audience",
    label: "Audience",
    shortLabel: "Audience",
    icon: Users,
    groups: [
      {
        label: "Audience",
        items: [
          {
            title: "Contacts",
            href: "/dashboard/audience/contacts",
            icon: Users,
            description: "Everyone you can reach by email or SMS.",
          },
          {
            title: "Segments",
            href: "/dashboard/audience/segments",
            icon: Layers,
            description:
              "Reusable audience segments for campaigns and broadcasts.",
          },
          {
            title: "Suppressions",
            href: "/dashboard/audience/suppressions",
            icon: Ban,
            description:
              "Emails and phone numbers that must never receive messages.",
          },
        ],
      },
    ],
  },
  {
    id: "developers",
    label: "Developers",
    shortLabel: "Developers",
    icon: Code2,
    groups: [
      {
        label: "Access",
        items: [
          {
            title: "API tokens",
            href: "/dashboard/developers/api-tokens",
            icon: KeyRound,
            description: "Create, scope, and revoke API tokens.",
          },
          {
            title: "Webhooks",
            href: "/dashboard/developers/webhooks",
            icon: Radio,
            description: "Configure delivery event endpoints.",
          },
        ],
      },
      {
        label: "Reference",
        items: [
          {
            title: "Documentation",
            href: "/docs",
            icon: BookOpen,
            description: "Full API reference and guides.",
          },
        ],
      },
    ],
  },
  {
    id: "wallet",
    label: "Billing",
    shortLabel: "Billing",
    icon: Wallet,
    groups: [
      {
        label: "Billing",
        items: [
          {
            title: "Wallet",
            href: "/dashboard/billing/wallet",
            icon: Wallet,
            description: "Balance and top-ups.",
          },
          {
            title: "Plans",
            href: "/dashboard/billing/plan",
            icon: Receipt,
            description: "Manage your subscription plan and billing.",
          },
        ],
      },
    ],
  },
  {
    id: "account",
    label: "Account settings",
    shortLabel: "Settings",
    icon: UserCircle,
    groups: [
      {
        label: "Settings",
        items: [
          {
            title: "Profile",
            href: "/dashboard/settings/profile",
            icon: UserCircle,
            description: "Your name, email, and teams.",
          },
          {
            title: "Team",
            href: "/dashboard/settings/team",
            icon: Users,
            description: "Members, invitations, and team settings.",
          },
        ],
      },
      {
        label: "Security",
        items: [
          {
            title: "Security",
            href: "/dashboard/settings/security",
            icon: ShieldCheck,
            description: "Password, 2FA, and active sessions.",
          },
        ],
      },
    ],
  },
];

type DashboardNavMatch = {
  portal: DashboardPortal;
  item: DashboardNavItem;
  /** True when the path sits below the item (a detail or "new" page). */
  isNested: boolean;
};

function isWithin(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Finds the nav item that owns a path by longest-prefix match, so detail
 * routes such as `/dashboard/email/domains/[id]` resolve to "Domains".
 */
export function findNavMatch(pathname: string): DashboardNavMatch | null {
  let best: DashboardNavMatch | null = null;
  for (const portal of dashboardPortals) {
    for (const group of portal.groups) {
      for (const item of group.items) {
        if (!item.href.startsWith("/dashboard/")) continue;
        if (!isWithin(pathname, item.href)) continue;
        if (!best || item.href.length > best.item.href.length) {
          best = { portal, item, isNested: pathname !== item.href };
        }
      }
    }
  }
  return best;
}

export function findPortalForPath(pathname: string): DashboardPortal | null {
  return findNavMatch(pathname)?.portal ?? null;
}

/** Label for the segment below a nav item, e.g. `.../campaigns/new`. */
export function nestedSegmentLabel(pathname: string, href: string): string {
  const segment = pathname.slice(href.length + 1).split("/")[0] ?? "";
  return segment === "new" ? "New" : "Details";
}
