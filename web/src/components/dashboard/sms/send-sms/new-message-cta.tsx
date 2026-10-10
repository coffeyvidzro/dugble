import { ArrowRight, Send } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NewMessageCta() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground">
            <Send className="size-5" />
          </span>
          <div className="space-y-1">
            <CardTitle>New message</CardTitle>
            <CardDescription>
              Compose and send an SMS in seconds.
            </CardDescription>
          </div>
        </div>
        <Link
          href="/dashboard/sms/send/new"
          className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          Get started
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
    </Card>
  );
}
