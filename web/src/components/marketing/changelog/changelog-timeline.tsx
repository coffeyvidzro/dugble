import { Reveal } from "@/components/marketing/reveal";
import { ChangelogEntry, type ChangelogEntryData } from "./changelog-entry";

function monthLabel(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

function groupByMonth(entries: ChangelogEntryData[]) {
    const groups: { label: string; entries: ChangelogEntryData[] }[] = [];

    for (const entry of entries) {
        const label = monthLabel(entry.date);
        const current = groups[groups.length - 1];
        if (current?.label === label) {
            current.entries.push(entry);
        } else {
            groups.push({ label, entries: [entry] });
        }
    }

    return groups;
}

export function ChangelogTimeline({
    entries,
}: {
    entries: ChangelogEntryData[];
}) {
    const groups = groupByMonth(entries);
    let entryIndex = 0;

    return (
        <div className="space-y-16">
            {groups.map((group) => (
                <div
                    key={group.label}
                    className="grid gap-6 md:grid-cols-[140px_1fr] md:gap-12"
                >
                    <div className="md:sticky md:top-28 md:h-fit">
                        <p className="font-mono text-sm text-muted-foreground">
                            {group.label}
                        </p>
                    </div>
                    <div className="space-y-12">
                        {group.entries.map((entry) => {
                            const delay = (entryIndex++ % 4) * 60;
                            return (
                                <Reveal key={entry.title} delay={delay}>
                                    <ChangelogEntry {...entry} />
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
