import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireSession } from "@/lib/session";

const quickStart = [
  "Create workspace",
  "Generate API key",
  "Send test email",
  "Send test SMS",
  "Configure webhook",
];

const stats = [
  { label: "Messages sent today", value: "0" },
  { label: "Delivery rate", value: "—" },
  { label: "Failed messages", value: "0" },
  { label: "API keys active", value: "0" },
];

export default async function Page() {
  const session = await requireSession();
  const displayName = session.user.name.trim() || session.user.email;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm">Overview</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Launch your messaging workspace, create API keys, and prepare your
          first customer notification flow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick start</CardTitle>
            <CardDescription>
              Complete these steps to send your first Dugble message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {quickStart.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border p-3 text-sm"
                >
                  <span className="flex size-5 items-center justify-center rounded-md border text-muted-foreground text-xs">
                    □
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Message and workspace events will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed text-muted-foreground text-sm">
              No messages yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
