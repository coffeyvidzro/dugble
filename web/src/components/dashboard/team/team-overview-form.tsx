"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 1 * 1024 * 1024;
const MAX_NAME_LENGTH = 60;

function initialsFromName(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function useTeamProfile(initialName: string, initialAvatarUrl?: string) {
    const [savedName, setSavedName] = useState(initialName);
    const [name, setName] = useState(initialName);
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

    const isDirty = name.trim() !== savedName && name.trim().length > 0;

    function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (file.size > MAX_AVATAR_BYTES) {
            setAvatarError("Image is over 1MB. Please choose a smaller file.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setAvatarError("Please select a valid image file.");
            return;
        }

        setAvatarError(null);
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    function handleSave() {
        if (!isDirty) return;
        setStatus("saving");
        window.setTimeout(() => {
            setSavedName(name.trim());
            setStatus("saved");
            window.setTimeout(() => setStatus("idle"), 2000);
        }, 600);
    }

    return {
        name,
        setName,
        savedName,
        avatarUrl,
        avatarError,
        status,
        isDirty,
        handleAvatarChange,
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
        avatarError,
        status,
        isDirty,
        handleAvatarChange,
        handleSave,
    } = useTeamProfile(initialName, initialAvatarUrl);

    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative size-24 shrink-0 overflow-hidden rounded-2xl outline-none ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                            aria-label="Update team avatar"
                        >
                            <Avatar className="size-full rounded-2xl border border-border/50 shadow-sm">
                                <AvatarImage
                                    src={avatarUrl}
                                    alt={savedName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="rounded-2xl bg-primary/5 text-2xl font-heading text-primary">
                                    {initialsFromName(savedName) || "T"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                <Camera className="size-6 text-foreground/80" />
                            </div>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex items-baseline justify-between">
                            <Label
                                htmlFor="team-name"
                                className="text-sm font-medium"
                            >
                                Workspace Name
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
                            className="max-w-md bg-background transition-shadow focus-visible:ring-primary/50"
                        />
                        <div className="min-h-4">
                            {avatarError ? (
                                <p className="text-xs font-medium text-danger animate-fade-up">
                                    {avatarError}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Maximum avatar file size is 1MB.
                                </p>
                            )}
                        </div>
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
                        "min-w-30 transition-all",
                        status === "saving" && "opacity-80",
                    )}
                >
                    {status === "saving" ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    {status === "saving" ? "Saving..." : "Save changes"}
                </Button>
            </div>
        </>
    );
}
