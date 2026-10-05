"use client";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useBroadcastApi } from "@/hooks/queries/use-broadcasts-api";
import { ComposeBroadcastHeader } from "./compose-broadcast-header";
import { ComposeBroadcastView } from "./compose-broadcast-view";

export function ComposeBroadcastPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const broadcastQuery = useBroadcastApi(editId ?? "");

  function goToList() {
    router.push("/dashboard/email/broadcasts");
  }

  if (editId && broadcastQuery.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 pb-6 pt-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading broadcast…
      </div>
    );
  }

  const broadcast = editId ? (broadcastQuery.data ?? null) : null;
  const notFound = Boolean(editId) && !broadcastQuery.isPending && !broadcast;
  const notEditable =
    broadcast !== null &&
    broadcast.status !== "draft" &&
    broadcast.status !== "scheduled";

  return (
    <div className="mx-auto w-full max-w-6xl pb-6 animate-fade-up">
      <Link
        href="/dashboard/email/broadcasts"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to broadcasts
      </Link>

      <ComposeBroadcastHeader editingBroadcast={broadcast} />

      {notFound && (
        <p className="mb-6 text-sm text-pending">
          We couldn&apos;t find that broadcast. Starting a new one instead.
        </p>
      )}

      {notEditable ? (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          This broadcast is {broadcast?.status} and can no longer be edited.
          Content is only editable while a broadcast is a draft or scheduled.
        </div>
      ) : (
        <ComposeBroadcastView
          editingBroadcast={notFound ? null : broadcast}
          onCancel={goToList}
          onDone={goToList}
        />
      )}
    </div>
  );
}
