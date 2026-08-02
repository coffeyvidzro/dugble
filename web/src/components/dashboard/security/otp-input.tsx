"use client";

import { useRef } from "react";

export function OtpInput({
    value,
    onChange,
    length = 6,
}: {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}) {
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    function handleChange(index: number, raw: string) {
        const digit = raw.replace(/\D/g, "").slice(-1);
        const chars = value.split("");
        chars[index] = digit;
        const next = chars.join("").slice(0, length);
        onChange(next);
        if (digit && index < length - 1) {
            refs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Backspace" && !value[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    }

    function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
        event.preventDefault();
        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);
        if (!pasted) return;
        onChange(pasted);
        refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }

    return (
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        refs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={value[index] ?? ""}
                    onChange={(event) =>
                        handleChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    className="size-11 rounded-lg border border-border/60 bg-background text-center font-mono text-lg font-medium text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
            ))}
        </div>
    );
}
