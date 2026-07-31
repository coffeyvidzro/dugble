import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Building2,
  Fingerprint,
  // FolderPlus,
  Globe,
  History as HistoryIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Mail,
  Megaphone,
  MessageCircle,
  Radio,
  Receipt,
  ScrollText,
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
          {
            title: "Logs",
            href: "/dashboard/email/logs",
            icon: ScrollText,
            description: "Full email delivery log.",
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
            title: "Invoices",
            href: "/dashboard/billing/invoices",
            icon: Receipt,
            description: "Billing history and receipts.",
          },
          {
            title: "Transactions",
            href: "/dashboard/billing/transactions",
            icon: ArrowLeftRight,
            description: "Every charge and top-up, itemized.",
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
            description: "Your name, email, and avatar.",
          },
          // {
          //     title: "Workspace",
          //     href: "/dashboard/create-workspace",
          //     icon: FolderPlus,
          //     description: "Create a new workspace.",
          // },
          {
            title: "Business",
            href: "/dashboard/settings/business",
            icon: Building2,
            description: "Company details and billing address.",
          },
          {
            title: "Team",
            href: "/dashboard/settings/team",
            icon: Users,
            description: "Manage your workspace team.",
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
            description: "Password, 2FA, and account security.",
          },
        ],
      },
      {
        label: "Developers",
        items: [
          {
            title: "API Keys",
            href: "/dashboard/developers/api-keys",
            icon: KeyRound,
            description: "Create and manage API credentials.",
          },
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
