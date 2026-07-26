import {
  Building2,
  KeyRound,
  Lock,
  ScrollText,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Reveal } from "@/components/marketing/reveal";

const groups = [
  {
    title: "Keys & sessions",
    items: [
      {
        icon: KeyRound,
        title: "Server-side API keys",
        description:
          "Scoped to a workspace, meant to live on your server, never in client code.",
      },
      {
        icon: UserCheck,
        title: "Session checks",
        description:
          "Every authenticated dashboard request is checked against a live, revocable session.",
      },
    ],
    code: `Authorization: Bearer sk_live_51ac9f2e...
Cookie: dugble_session=•••;HttpOnly;Secure;SameSite=Lax`,
  },
  {
    title: "Workspace isolation",
    items: [
      {
        icon: Building2,
        title: "Workspace-scoped access",
        description:
          "Keys, senders, logs, and members are isolated per workspace by default.",
      },
      {
        icon: ScrollText,
        title: "Audit log foundation",
        description:
          "Sensitive workspace actions are recorded so you can reconstruct what changed and when.",
      },
    ],
    code: `X-Dugble-Workspace: wsp_4b71ea
> 403 if the key or session isn't a member of wsp_4b71ea`,
  },
  {
    title: "Webhooks",
    items: [
      {
        icon: ShieldCheck,
        title: "Signed events",
        description:
          "Every event is signed so your backend can verify it came from Dugble before acting on it.",
      },
    ],
    code: `X-Dugble-Event: message.delivered
X-Dugble-Signature: t=1721642042,v1=5f3d8c9e...`,
  },
  {
    title: "Dashboard protection",
    items: [
      {
        icon: Lock,
        title: "CSRF tokens",
        description:
          "State-changing dashboard actions require a valid, single-use token.",
      },
    ],
    code: `POST /dashboard/senders/verify
X-CSRF-Token: 9f2a1b7e-4c3d-...`,
  },
];

export function SecurityControls() {
  return (
    <section className="min-w-0 space-y-8">
      <Reveal className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          What's in place today
        </p>
        <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Grouped by what they actually protect.
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((group, i) => (
          <Reveal
            key={group.title}
            delay={i * 80}
            className="min-w-0 space-y-4 rounded-2xl border bg-card/60 p-5"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
              {group.title}
            </p>
            <div className="space-y-3">
              {group.items.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    <item.icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 wrap-break-word text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <pre className="w-full overflow-x-auto rounded-xl border bg-background p-3 font-mono text-[12px] leading-6 text-foreground/90">
              {group.code}
            </pre>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
