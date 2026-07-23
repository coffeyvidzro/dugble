const stats = [
    { label: "Built for A2P traffic", detail: "OTP · alerts · receipts" },
    { label: "Every state tracked", detail: "queued → delivered / failed" },
    { label: "Webhooks included", detail: "signed · retried · logged" },
];

export function HeroStats() {
    return (
        <dl className="grid animate-fade-up gap-4 border-t pt-6 [animation-delay:240ms] sm:grid-cols-3">
            {stats.map((stat, i) => (
                <div key={stat.label} className="space-y-1">
                    <dt className="text-sm font-medium text-foreground">
                        {stat.label}
                    </dt>
                    <dd className="font-mono text-xs text-muted-foreground">
                        {stat.detail}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
