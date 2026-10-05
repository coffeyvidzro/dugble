// src/components/dashboard/sms/sender-ids/sender-id-request-form.tsx

"use client";

import { AlertCircle, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSenderId } from "@/hooks/queries/use-sender-ids";
import { SENDER_ID_COUNTRIES } from "@/types/sender-id";

const DEFAULT_COUNTRY_CODE = SENDER_ID_COUNTRIES[0]?.code ?? "GH";

export function SenderIdRequestForm() {
  const createSenderId = useCreateSenderId();

  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [purpose, setPurpose] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    purpose.trim().length > 0 &&
    !createSenderId.isPending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    createSenderId.mutate(
      {
        name: name.trim(),
        country_code: countryCode,
        purpose: purpose.trim(),
      },
      {
        onSuccess: () => setSubmitted(true),
      },
    );
  }

  function handleReset() {
    setSubmitted(false);
    setName("");
    setPurpose("");
    createSenderId.reset();
  }

  if (submitted) {
    return (
      <Card className="border-border/40 shadow-sm">
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-signal/10 text-signal">
            <Send className="size-5" />
          </span>
          <h2 className="font-heading text-lg font-medium text-foreground">
            Request submitted
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            We&apos;re reviewing your request for{" "}
            <span className="font-mono text-foreground">{name}</span>. Most
            requests are reviewed within 1–3 business days — we&apos;ll notify
            you by email once it&apos;s decided.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard/sms/sender-ids"
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
            >
              Back to Sender IDs
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            >
              Submit another
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
        <CardTitle className="text-xl">Request details</CardTitle>
        <CardDescription>
          Carriers review every request for compliance before approval.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
        {createSenderId.isError && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>
              {createSenderId.error instanceof Error
                ? createSenderId.error.message
                : "Something went wrong submitting your request."}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="sender-country">Country</Label>
          <Select
            value={countryCode}
            onValueChange={(value) =>
              setCountryCode(value ?? DEFAULT_COUNTRY_CODE)
            }
          >
            <SelectTrigger id="sender-country" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENDER_ID_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender-name">Sender ID</Label>
          <Input
            id="sender-name"
            placeholder="DUGBLE"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            This is exactly what recipients will see as the sender.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Textarea
            id="purpose"
            placeholder="Describe what you'll use this sender ID for. e.g. OTPs, order updates, appointment reminders. Include a sample message if it helps the review."
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            {purpose.trim().length}/500 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="group/button relative inline-flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2.5 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 disabled:pointer-events-none disabled:opacity-50 dark:hover:shadow-black/20"
        >
          {createSenderId.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {createSenderId.isPending ? "Submitting…" : "Submit for review"}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </button>
      </form>
    </Card>
  );
}
