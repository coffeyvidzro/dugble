import { Reveal } from "@/components/marketing/reveal";

const commitments = [
  { value: "<200ms", label: "Target API response time" },
  { value: "3x", label: "Automatic webhook retry attempts" },
  { value: "4", label: "Delivery states tracked per message" },
  { value: "24/7", label: "Status page and incident updates" },
];

export function Metrics() {
  return (
    <section className="grid gap-6 border-y py-10 sm:grid-cols-2 lg:grid-cols-4">
      {commitments.map((item, index) => (
        <Reveal key={item.label} delay={index * 100} className="space-y-1.5">
          <p className="font-mono text-3xl font-semibold tracking-tight text-signal md:text-4xl">
            {item.value}
          </p>
          <p className="text-sm text-muted-foreground">{item.label}</p>
        </Reveal>
      ))}
    </section>
  );
}
