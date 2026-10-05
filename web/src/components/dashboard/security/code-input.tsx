// src/components/dashboard/security/code-input.tsx

"use client";

import { Input } from "@/components/ui/input";

type CodeInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  mode: "totp" | "recovery";
  disabled?: boolean;
  invalid?: boolean;
};

/** Single input for TOTP or recovery codes with the right keyboard and autofill hints. */
export function CodeInput({
  id,
  value,
  onChange,
  mode,
  disabled,
  invalid,
}: CodeInputProps) {
  const isTotp = mode === "totp";
  return (
    <Input
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="one-time-code"
      inputMode={isTotp ? "numeric" : "text"}
      maxLength={isTotp ? 7 : 64}
      placeholder={isTotp ? "123 456" : "xxxx-xxxx"}
      aria-invalid={invalid}
      disabled={disabled}
      className="font-mono tracking-widest"
    />
  );
}
