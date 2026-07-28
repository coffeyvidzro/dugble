import type { ReactNode } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/session";

export function DashboardShell({
    children,
    user,
}: {
    children: ReactNode;
    user: SessionUser;
}) {
    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col gap-6 p-4 animate-fade-up lg:p-8">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
