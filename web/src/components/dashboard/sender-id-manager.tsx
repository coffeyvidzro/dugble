"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { csrfFetch } from "@/lib/csrf-fetch";

type Team = {
  id: string;
  name: string;
  status: string;
};

type SenderID = {
  id: string;
  name: string;
  country_code: string;
  purpose: string;
  status: string;
  provider?: string;
  created_at: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
};

const selectClassName =
  "h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none transition-[color,box-shadow,background-color] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50";

export function SenderIDManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamID, setSelectedTeamID] = useState("");
  const [senderIDs, setSenderIDs] = useState<SenderID[]>([]);
  const [senderIDInput, setSenderIDInput] = useState("");
  const [countryCode, setCountryCode] = useState("GH");
  const [purpose, setPurpose] = useState("");
  const [provider, setProvider] = useState("Arkesel");
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingSenderIDs, setLoadingSenderIDs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const parsedSenderIDs = useMemo(
    () =>
      senderIDInput
        .split(/[\n,]+/)
        .map((value) => value.trim())
        .filter(Boolean),
    [senderIDInput],
  );

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      const response = await csrfFetch("/api/v1/teams", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const payload = (await response
        .json()
        .catch(() => null)) as ApiEnvelope<Team[]> | null;
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? "Unable to load teams.");
      }

      const nextTeams = payload.data ?? [];
      setTeams(nextTeams);
      setSelectedTeamID((current) => current || nextTeams[0]?.id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load teams.");
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  const loadSenderIDs = useCallback(async (teamID: string) => {
    if (!teamID) {
      setSenderIDs([]);
      return;
    }

    setLoadingSenderIDs(true);
    try {
      const response = await csrfFetch("/api/v1/sender-ids", {
        headers: {
          Accept: "application/json",
          "X-Team-ID": teamID,
        },
        cache: "no-store",
      });
      const payload = (await response
        .json()
        .catch(() => null)) as ApiEnvelope<SenderID[]> | null;
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message ?? "Unable to load sender IDs.");
      }
      setSenderIDs(payload.data ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load sender IDs.",
      );
    } finally {
      setLoadingSenderIDs(false);
    }
  }, []);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    void loadSenderIDs(selectedTeamID);
  }, [loadSenderIDs, selectedTeamID]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTeamID) {
      toast.error("Select a team before requesting sender IDs.");
      return;
    }
    if (parsedSenderIDs.length === 0) {
      toast.error("Enter at least one sender ID.");
      return;
    }
    if (parsedSenderIDs.length > 50) {
      toast.error("You can request a maximum of 50 sender IDs at once.");
      return;
    }
    const invalidSenderID = parsedSenderIDs.find((value) => value.length > 11);
    if (invalidSenderID) {
      toast.error(`${invalidSenderID} is longer than 11 characters.`);
      return;
    }
    if (!/^[A-Za-z]{2}$/.test(countryCode.trim())) {
      toast.error("Enter a two-letter country code.");
      return;
    }
    if (!purpose.trim()) {
      toast.error("Describe how the sender IDs will be used.");
      return;
    }
    if (!authorizationConfirmed) {
      toast.error("Confirm that the authorization documents are prepared.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await csrfFetch("/api/v1/sender-ids/bulk", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Team-ID": selectedTeamID,
        },
        body: JSON.stringify({
          sender_ids: parsedSenderIDs,
          country_code: countryCode.trim().toUpperCase(),
          purpose: purpose.trim(),
          provider: provider.trim() || undefined,
        }),
      });
      const payload = (await response
        .json()
        .catch(() => null)) as ApiEnvelope<SenderID[]> | null;
      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.error?.message ?? "Unable to submit sender ID requests.",
        );
      }

      const createdCount = payload.data?.length ?? parsedSenderIDs.length;
      toast.success(
        `${createdCount} sender ID request${createdCount === 1 ? "" : "s"} submitted.`,
      );
      setSenderIDInput("");
      setAuthorizationConfirmed(false);
      await loadSenderIDs(selectedTeamID);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to submit sender ID requests.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">SMS sender IDs</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Request sender IDs in bulk
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Submit up to 50 sender IDs that share the same country, provider, and
          messaging purpose. Requests remain pending until they are reviewed.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>New bulk request</CardTitle>
            <CardDescription>
              Enter one sender ID per line, or separate them with commas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Team" htmlFor="sender-team">
                  <select
                    id="sender-team"
                    className={selectClassName}
                    value={selectedTeamID}
                    onChange={(event) => setSelectedTeamID(event.target.value)}
                    disabled={loadingTeams || teams.length === 0}
                  >
                    {teams.length === 0 ? (
                      <option value="">
                        {loadingTeams ? "Loading teams..." : "No teams available"}
                      </option>
                    ) : null}
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Country code" htmlFor="sender-country">
                  <Input
                    id="sender-country"
                    value={countryCode}
                    onChange={(event) => setCountryCode(event.target.value)}
                    maxLength={2}
                    placeholder="GH"
                    autoCapitalize="characters"
                  />
                </Field>
              </div>

              <Field
                label="Sender IDs"
                htmlFor="sender-names"
                hint={`${parsedSenderIDs.length}/50 sender IDs`}
              >
                <Textarea
                  id="sender-names"
                  value={senderIDInput}
                  onChange={(event) => setSenderIDInput(event.target.value)}
                  className="min-h-40 font-mono"
                  placeholder={"DUGBLE\nDUGPAY\nDUGALERT"}
                />
              </Field>

              <Field label="Purpose" htmlFor="sender-purpose">
                <Textarea
                  id="sender-purpose"
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  maxLength={500}
                  placeholder="For example: OTPs, transaction alerts, and account notifications."
                />
              </Field>

              <Field label="Provider" htmlFor="sender-provider">
                <Input
                  id="sender-provider"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                  maxLength={120}
                  placeholder="Arkesel"
                />
              </Field>

              <label className="flex items-start gap-3 rounded-3xl bg-muted/60 p-4">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-primary"
                  checked={authorizationConfirmed}
                  onChange={(event) =>
                    setAuthorizationConfirmed(event.target.checked)
                  }
                />
                <span className="text-sm leading-6">
                  I have prepared a signed authorization letter listing every
                  sender ID and a valid government-issued ID for verification.
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || loadingTeams || teams.length === 0}
              >
                {submitting
                  ? "Submitting requests..."
                  : `Submit ${parsedSenderIDs.length || "bulk"} request${
                      parsedSenderIDs.length === 1 ? "" : "s"
                    }`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Authorization checklist</CardTitle>
              <CardDescription>
                Keep these documents ready for the provider review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                <li>List every sender ID exactly as entered in this request.</li>
                <li>Explain the shared purpose, such as OTPs or alerts.</li>
                <li>Include the requester&apos;s name, role, email, and phone.</li>
                <li>Sign the letter and attach a valid government-issued ID.</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing sender IDs</CardTitle>
              <CardDescription>
                {selectedTeamID
                  ? "Requests for the selected team."
                  : "Select a team to view requests."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSenderIDs ? (
                <p className="text-sm text-muted-foreground">Loading requests...</p>
              ) : senderIDs.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No sender ID requests yet.
                </div>
              ) : (
                <div className="divide-y">
                  {senderIDs.map((senderID) => (
                    <div key={senderID.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono font-semibold">
                          {senderID.name}
                        </span>
                        <StatusBadge status={senderID.status} />
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {senderID.purpose}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {senderID.country_code}
                        {senderID.provider ? ` · ${senderID.provider}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  children,
  label,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  label: string;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
      {status}
    </span>
  );
}
