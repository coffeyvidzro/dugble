import type { ReactNode } from "react";

const INLINE_PATTERN = /(\*\*(.+?)\*\*|_(.+?)_|\[(.+?)\]\((.+?)\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let index = 0;

    INLINE_PATTERN.lastIndex = 0;
    while ((match = INLINE_PATTERN.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(text.slice(lastIndex, match.index));
        }
        if (match[2] !== undefined) {
            nodes.push(
                <strong key={`${keyPrefix}-${index}`}>{match[2]}</strong>,
            );
        } else if (match[3] !== undefined) {
            nodes.push(<em key={`${keyPrefix}-${index}`}>{match[3]}</em>);
        } else if (match[4] !== undefined) {
            nodes.push(
                <a
                    key={`${keyPrefix}-${index}`}
                    href={match[5]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                >
                    {match[4]}
                </a>,
            );
        }
        lastIndex = INLINE_PATTERN.lastIndex;
        index++;
    }
    if (lastIndex < text.length) {
        nodes.push(text.slice(lastIndex));
    }
    return nodes;
}

export function ContentPreview({ content }: { content: string }) {
    const lines = content.split("\n");
    const blocks: ReactNode[] = [];
    let listBuffer: string[] = [];

    function flushList() {
        if (listBuffer.length === 0) return;
        blocks.push(
            <ul
                key={`list-${blocks.length}`}
                className="list-disc space-y-1 pl-5"
            >
                {listBuffer.map((item, i) => (
                    <li key={i}>
                        {renderInline(item, `li-${blocks.length}-${i}`)}
                    </li>
                ))}
            </ul>,
        );
        listBuffer = [];
    }

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList();
            return;
        }
        if (trimmed.startsWith("- ")) {
            listBuffer.push(trimmed.slice(2));
            return;
        }
        flushList();
        if (trimmed.startsWith("## ")) {
            blocks.push(
                <h3
                    key={`h-${i}`}
                    className="font-heading text-lg font-semibold"
                >
                    {renderInline(trimmed.slice(3), `h-${i}`)}
                </h3>,
            );
        } else if (trimmed.startsWith("# ")) {
            blocks.push(
                <h2
                    key={`h-${i}`}
                    className="font-heading text-xl font-semibold"
                >
                    {renderInline(trimmed.slice(2), `h-${i}`)}
                </h2>,
            );
        } else {
            blocks.push(
                <p key={`p-${i}`}>{renderInline(trimmed, `p-${i}`)}</p>,
            );
        }
    });
    flushList();

    if (blocks.length === 0) {
        return (
            <p className="text-sm italic text-muted-foreground">
                Nothing to preview yet. Start writing in the Write tab.
            </p>
        );
    }

    return (
        <div className="space-y-3 text-sm leading-relaxed text-foreground">
            {blocks}
        </div>
    );
}
