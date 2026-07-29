import {
    Gauge,
    KeyRound,
    LayoutDashboard,
    Mail,
    MessagesSquare,
    Monitor,
    Radio,
    ScrollText,
    Send,
    Settings,
    ShieldCheck,
    Smartphone,
    UserCircle,
    Users,
    type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    description?: string;
};

export type DashboardNavSection = {
    label: string;
    items: DashboardNavItem[];
};

export const dashboardNavigation: DashboardNavSection[] = [
    {
        label: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
                description: "Your account at a glance.",
            },
        ],
    },
    {
        label: "Messaging",
        items: [
            {
                title: "Messages",
                href: "/dashboard/messages",
                icon: MessagesSquare,
                description: "All sent and received messages.",
            },
            {
                title: "Email",
                href: "/dashboard/messages/email",
                icon: Mail,
                description: "Email delivery and message logs.",
            },
            {
                title: "SMS",
                href: "/dashboard/messages/sms",
                icon: Smartphone,
                description: "SMS delivery and message logs.",
            },
            {
                title: "Senders",
                href: "/dashboard/senders",
                icon: Send,
                description: "Verified sender identities and numbers.",
            },
        ],
    },
    {
        label: "Developers",
        items: [
            {
                title: "API Keys",
                href: "/dashboard/api-keys",
                icon: KeyRound,
                description: "Create and manage API credentials.",
            },
            {
                title: "Webhooks",
                href: "/dashboard/webhooks",
                icon: Radio,
                description: "Configure delivery event endpoints.",
            },
            {
                title: "Logs",
                href: "/dashboard/logs",
                icon: ScrollText,
                description: "Request and event history.",
            },
        ],
    },
    {
        label: "Workspace",
        items: [
            {
                title: "Team",
                href: "/dashboard/team",
                icon: Users,
                description: "Manage your workspace team.",
            },
            {
                title: "Members",
                href: "/dashboard/team/members",
                icon: UserCircle,
                description: "Invite and manage member access.",
            },
            {
                title: "Usage",
                href: "/dashboard/usage",
                icon: Gauge,
                description: "Volume and billing usage.",
            },
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: Settings,
                description: "Workspace preferences and configuration.",
            },
        ],
    },
    {
        label: "Account",
        items: [
            {
                title: "Security",
                href: "/dashboard/security",
                icon: ShieldCheck,
                description: "Password, 2FA, and account security.",
            },
            {
                title: "Sessions",
                href: "/dashboard/security/sessions",
                icon: Monitor,
                description: "Active sessions and devices.",
            },
        ],
    },
];

export function findNavTitle(pathname: string): string {
    for (const section of dashboardNavigation) {
        const match = section.items.find((item) => item.href === pathname);
        if (match) return match.title;
    }
    return "Dashboard";
}
