import { Card } from "@/components/ui/card";
import type { EmailApiResource } from "@/types/email-api";

export function EmailMetaGrid({ email }: { email: EmailApiResource }) {
  const items: { label: string; value: string }[] = [
    { label: "From", value: email.from },
    {
      label: "Cc",
      value: email.cc?.length ? email.cc.join(", ") : "—",
    },
    {
      label: "Bcc",
      value: email.bcc?.length ? email.bcc.join(", ") : "—",
    },
    {
      label: "Reply-to",
      value: email.reply_to?.length ? email.reply_to.join(", ") : "—",
    },
  ];

  return (
    <Card className="grid grid-cols-2 gap-4 border-border/40 p-4 shadow-sm sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1 truncate font-mono text-sm font-medium text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </Card>
  );
}
