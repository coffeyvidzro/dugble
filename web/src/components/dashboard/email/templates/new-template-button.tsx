import { Plus } from "lucide-react";
import Link from "next/link";

export function NewTemplateButton() {
  return (
    <Link
      href="/dashboard/email/templates/new"
      className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
    >
      <Plus className="size-4" />
      New template
    </Link>
  );
}
