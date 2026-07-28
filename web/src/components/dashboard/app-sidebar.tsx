"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { dashboardNavigation } from "./dashboard-nav";

export function AppSidebar({ user }: { user: SessionUser }) {
    const pathname = usePathname();
    const displayName = user.name.trim() || user.email;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            tooltip="Dugble"
                            render={<Link href="/dashboard" />}
                        >
                            <img
                                src="/brand/mark-light-bg.svg"
                                alt=""
                                className="size-8 rounded-xl dark:hidden"
                            />
                            <img
                                src="/brand/mark-dark-bg.svg"
                                alt=""
                                className="hidden size-8 rounded-xl dark:block"
                            />
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
                {dashboardNavigation.map((section) => (
                    <SidebarGroup key={section.label}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                isActive={isActive}
                                                render={
                                                    <Link href={item.href} />
                                                }
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "transition-colors",
                                                        isActive &&
                                                            "text-signal",
                                                    )}
                                                />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" tooltip={displayName}>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-2xl bg-muted font-medium text-muted-foreground">
                                {displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {displayName}
                                </span>
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
