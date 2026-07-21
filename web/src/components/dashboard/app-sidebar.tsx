import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/session";

const navigation = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard" }],
  },
  {
    label: "Messaging",
    items: [
      { title: "Messages", href: "/dashboard/messages" },
      { title: "Email", href: "/dashboard/messages/email" },
      { title: "SMS", href: "/dashboard/messages/sms" },
      { title: "Senders", href: "/dashboard/senders" },
    ],
  },
  {
    label: "Developers",
    items: [
      { title: "API Keys", href: "/dashboard/api-keys" },
      { title: "Webhooks", href: "/dashboard/webhooks" },
      { title: "Logs", href: "/dashboard/logs" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Team", href: "/dashboard/team" },
      { title: "Members", href: "/dashboard/team/members" },
      { title: "Usage", href: "/dashboard/usage" },
      { title: "Settings", href: "/dashboard/settings" },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Security", href: "/dashboard/security" },
      { title: "Sessions", href: "/dashboard/security/sessions" },
    ],
  },
];

export function AppSidebar({ user }: { user: SessionUser }) {
  const displayName = user.name.trim() || user.email;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col gap-1 px-2 py-1.5">
          <span className="font-heading font-semibold text-base">Dugble</span>
          <span className="text-muted-foreground text-xs">
            Developer console
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      render={<a href={item.href} />}
                    >
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="min-w-0 px-2 py-1.5 text-sm">
          <p className="truncate font-medium">{displayName}</p>
          <p className="truncate text-muted-foreground text-xs">{user.email}</p>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
