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
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Dugble"
              render={<a href="/dashboard" />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                D
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-heading font-semibold">
                  Dugble
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  Developer console
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={displayName}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
