import type { LucideIcon } from "lucide-react";
import {
  Ban,
  BarChart3,
  BookOpen,
  Fingerprint,
  Globe,
  History as HistoryIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
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
  icon: LucideIcon;
  groups: DashboardNavGroup[];
};

export const dashboardPortals: DashboardPortal[] = [
  {
    id: "sms",
    label: "SMS portal",
    icon: MessageCircle,
    groups: [
      {
        label: "Overview",
        items: [
          {
            title: "Dashboard",
            href: "/dashboard/sms",
            icon: LayoutDashboard,
            description: "SMS delivery and message logs.",
          },
        ],
      },
      {
        label: "Communications",
        items: [
          {
            title: "Send SMS",
            href: "/dashboard/sms/send",
            icon: Send,
            description: "Compose and send an SMS message.",
          },
          {
            title: "Campaigns",
            href: "/dashboard/sms/campaigns",
            icon: Megaphone,
            description: "Scheduled and recurring SMS sends.",
          },
          {
            title: "Sender IDs",
            href: "/dashboard/sms/sender-ids",
            icon: Fingerprint,
            description: "Verified sender identities and numbers.",
          },
          {
            title: "Reports",
            href: "/dashboard/sms/reports",
            icon: BarChart3,
            description: "SMS delivery and engagement reports.",
          },
          {
            title: "History",
            href: "/dashboard/sms/history",
            icon: HistoryIcon,
            description: "Full SMS send history.",
          },
        ],
      },
    ],
  },
  {
    id: "email",
    label: "Email portal",
    icon: Mail,
    groups: [
      {
        label: "Overview",
        items: [
          {
            title: "Dashboard",
            href: "/dashboard/email",
            icon: LayoutDashboard,
            description: "Email delivery and message logs.",
          },
          {
            title: "Emails",
            href: "/dashboard/email/emails",
            icon: Inbox,
            description: "Outbox and compose.",
          },
          {
            title: "Metrics",
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
    id: "wallet",
    label: "Wallet & Payment",
    icon: Wallet,
    groups: [
      {
        label: "Finance",
        items: [
          {
            title: "My wallet",
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
            description: "Members, invitations, and API tokens.",
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
      {
        label: "Developers",
        items: [
          {
            title: "Webhooks",
            href: "/dashboard/developers/webhooks",
            icon: Radio,
            description: "Configure delivery event endpoints.",
          },
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
];

export function findPortalForPath(pathname: string): DashboardPortal | null {
  for (const portal of dashboardPortals) {
    for (const group of portal.groups) {
      if (group.items.some((item) => item.href === pathname)) {
        return portal;
      }
    }
  }
  return null;
}

export function findNavTitle(pathname: string): string {
  for (const portal of dashboardPortals) {
    for (const group of portal.groups) {
      const match = group.items.find((item) => item.href === pathname);
      if (match) return match.title;
    }
  }
  return "Dashboard";
}
