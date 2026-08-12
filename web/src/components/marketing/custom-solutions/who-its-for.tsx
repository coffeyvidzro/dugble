import { Building2, Landmark, Layers3, Radar } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

const signals = [
    { icon: Radar, label: "Sending high volume, growing fast" },
    { icon: Landmark, label: "Operating under compliance requirements" },
    { icon: Layers3, label: "Integrating with legacy or internal systems" },
    { icon: Building2, label: "Sending on behalf of your own customers" },
] as const;

export function WhoItsFor() {
    return (
        <Reveal className="flex flex-wrap gap-3">
            {signals.map((signal) => (
                <span
                    key={signal.label}
                    className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-2 text-sm text-muted-foreground"
                >
                    <signal.icon className="size-3.5 text-signal" />
                    {signal.label}
                </span>
            ))}
        </Reveal>
    );
}
