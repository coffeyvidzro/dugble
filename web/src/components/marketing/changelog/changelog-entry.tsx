import { ChangelogTag, type ChangelogTagType } from "./changelog-tag";

export type ChangelogEntryData = {
  date: string;
  tag: ChangelogTagType;
  title: string;
  description: string;
  details?: string[];
  code?: string;
};

export function ChangelogEntry({
  date,
  tag,
  title,
  description,
  details,
  code,
}: ChangelogEntryData) {
  return (
    <article className="space-y-4 border-b pb-12 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <ChangelogTag tag={tag} />
        <time
          dateTime={date}
          className="font-mono text-xs text-muted-foreground"
        >
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>

      <h3 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="max-w-2xl leading-7 text-muted-foreground">{description}</p>

      {details && details.length > 0 && (
        <ul className="space-y-2">
          {details.map((detail) => (
            <li
              key={detail}
              className="flex items-start gap-2.5 text-sm leading-6 text-muted-foreground"
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-signal" />
              {detail}
            </li>
          ))}
        </ul>
      )}

      {code && (
        <pre className="overflow-x-auto rounded-xl border bg-card p-4 font-mono text-[13px] leading-6 text-foreground/90">
          {code}
        </pre>
      )}
    </article>
  );
}
