"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    AVATAR_PRESETS,
    TeamAvatarPicker,
    type AvatarPresetId,
} from "./team-avatar-picker";

const MAX_NAME_LENGTH = 60;

function useTeamProfile(initialName: string, initialAvatarUrl?: string) {
    const [savedName, setSavedName] = useState(initialName);
    const [name, setName] = useState(initialName);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(
        initialAvatarUrl ?? null,
    );
    const [savedAvatarUrl, setSavedAvatarUrl] = useState<string | null>(
        initialAvatarUrl ?? null,
    );
    const [avatarColor, setAvatarColor] = useState<AvatarPresetId>(
        AVATAR_PRESETS[0].id,
    );
    const [savedAvatarColor, setSavedAvatarColor] = useState<AvatarPresetId>(
        AVATAR_PRESETS[0].id,
    );
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

    const isDirty =
        (name.trim() !== savedName && name.trim().length > 0) ||
        avatarUrl !== savedAvatarUrl ||
        avatarColor !== savedAvatarColor;

    function handleSave() {
        if (!isDirty) return;
        setStatus("saving");
        window.setTimeout(() => {
            setSavedName(name.trim());
            setSavedAvatarUrl(avatarUrl);
            setSavedAvatarColor(avatarColor);
            setStatus("saved");
            window.setTimeout(() => setStatus("idle"), 2000);
        }, 600);
    }

    return {
        name,
        setName,
        savedName,
        avatarUrl,
        setAvatarUrl,
        avatarColor,
        setAvatarColor,
        avatarError,
        setAvatarError,
        status,
        isDirty,
        handleSave,
    };
}

export function TeamOverviewForm({
    initialName,
    initialAvatarUrl,
}: {
    initialName: string;
    initialAvatarUrl?: string;
}) {
    const {
        name,
        setName,
        savedName,
        avatarUrl,
        setAvatarUrl,
        avatarColor,
        setAvatarColor,
        avatarError,
        setAvatarError,
        status,
        isDirty,
        handleSave,
    } = useTeamProfile(initialName, initialAvatarUrl);

    return (
        <>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                    <div className="flex flex-col items-center gap-2">
                        <TeamAvatarPicker
                            name={savedName}
                            imageUrl={avatarUrl}
                            color={avatarColor}
                            onImageChange={setAvatarUrl}
                            onColorChange={setAvatarColor}
                            error={avatarError}
                            onError={setAvatarError}
                            size="lg"
                        />
                        {!avatarError && (
                            <p className="font-mono text-[10px] text-muted-foreground">
                                Max 1MB
                            </p>
                        )}
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex items-baseline justify-between">
                            <Label
                                htmlFor="team-name"
                                className="text-sm font-medium"
                            >
                                Team name
                            </Label>
                            <span className="font-mono text-[11px] text-muted-foreground/70">
                                {name.length}/{MAX_NAME_LENGTH}
                            </span>
                        </div>
                        <Input
                            id="team-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Acme Corp"
                            maxLength={MAX_NAME_LENGTH}
                            className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                        />
                        <p className="text-xs text-muted-foreground">
                            This name and avatar appear across your dashboard
                            and in emails sent on this team&apos;s behalf.
                        </p>
                    </div>
                </div>
            </CardContent>
            <div className="flex items-center justify-end gap-4 border-t border-border/40 bg-muted/10 px-6 py-4">
                {status === "saved" && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-signal animate-fade-up">
                        <Check className="size-4" />
                        Saved successfully
                    </span>
                )}
                <Button
                    onClick={handleSave}
                    disabled={!isDirty || status === "saving"}
                    className={cn(
                        "group/button relative inline-flex min-w-30 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20",
                        status === "saving" && "opacity-80",
                    )}
                >
                    {status === "saving" ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {status === "saving" ? "Saving..." : "Save changes"}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Button>
            </div>
        </>
    );
}
