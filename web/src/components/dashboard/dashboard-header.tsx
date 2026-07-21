import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { SessionUser } from "@/lib/session";

export function DashboardHeader({ user }: { user: SessionUser }) {
  const displayName = user.name.trim() || user.email;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 lg:px-8">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="min-w-0">
        <p className="truncate font-medium text-sm">
          Welcome back, {displayName}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          Manage messaging, API keys, and workspace settings.
        </p>
      </div>
    </header>
  );
}
