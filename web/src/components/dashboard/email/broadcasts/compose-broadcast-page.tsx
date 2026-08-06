"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { useBroadcasts } from "./broadcasts-provider";
import { ComposeBroadcastHeader } from "./compose-broadcast-header";
import { ComposeBroadcastView } from "./compose-broadcast-view";

export function ComposeBroadcastPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");

    const { getBroadcast, currentUserEmail, saveDraft, submitBroadcast } =
        useBroadcasts();
    const editingBroadcast = editId ? (getBroadcast(editId) ?? null) : null;
    const notFound = Boolean(editId) && !editingBroadcast;

    function goToList() {
        router.push("/dashboard/email/broadcasts");
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-6 animate-fade-up">
            <Link
                href="/dashboard/email/broadcasts"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" />
                Back to broadcasts
            </Link>

            <ComposeBroadcastHeader editingBroadcast={editingBroadcast} />

            {notFound && (
                <p className="mb-6 text-sm text-pending">
                    We couldn&apos;t find that broadcast. Starting a new one
                    instead.
                </p>
            )}

            <ComposeBroadcastView
                editingBroadcast={editingBroadcast}
                currentUserEmail={currentUserEmail}
                onCancel={goToList}
                onSaveDraft={(broadcast) => {
                    saveDraft(broadcast);
                    goToList();
                }}
                onSubmit={(broadcast) => {
                    submitBroadcast(broadcast);
                    goToList();
                }}
            />
        </div>
    );
}
