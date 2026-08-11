"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { csrfFetch } from "@/lib/csrf-fetch";
import {
    AVATAR_PRESETS,
    TeamAvatarPicker,
    type AvatarPresetId,
} from "../team/team-avatar-picker";
import {
    formSchema,
    parseInviteEmails,
    slugify,
    type FormValues,
} from "./create-team-schema";

export function CreateTeamForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            teamName: "",
            avatarColor: AVATAR_PRESETS[0].id,
            avatarImage: null,
            inviteEmails: "",
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = form;

    const teamName = watch("teamName");
    const avatarColor = watch("avatarColor") as AvatarPresetId;
    const avatarImage = watch("avatarImage");
    const slug = slugify(teamName || "");

    async function onSubmit(data: FormValues) {
        setLoading(true);
        try {
            const response = await csrfFetch("/api/v1/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.teamName,
                    avatarColor: data.avatarImage ? null : data.avatarColor,
                    avatarImage: data.avatarImage,
                    inviteEmails: parseInviteEmails(data.inviteEmails),
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                toast.error(error?.error?.message ?? "Unable to create team.");
                setLoading(false);
                return;
            }

            toast.success("Team created.");
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("Unable to create team. Please try again.");
            setLoading(false);
        }
    }

    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void handleSubmit(onSubmitRef.current)();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSubmit]);

    return (
        <form
            id="create-team-form"
            onSubmit={handleSubmit(onSubmit)}
            className="animate-fade-up space-y-6"
            style={{ animationDelay: "0.08s" } as CSSProperties}
        >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
                <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
                    <TeamAvatarPicker
                        name={teamName}
                        imageUrl={avatarImage}
                        color={avatarColor}
                        onImageChange={(value) =>
                            setValue("avatarImage", value, {
                                shouldDirty: true,
                            })
                        }
                        onColorChange={(value) =>
                            setValue("avatarColor", value, {
                                shouldDirty: true,
                            })
                        }
                        error={avatarError}
                        onError={setAvatarError}
                        size="lg"
                    />

                    <Field data-invalid={!!errors.teamName}>
                        <FieldLabel htmlFor="team-name">Team name</FieldLabel>
                        <Input
                            id="team-name"
                            placeholder="Your Team Name"
                            disabled={loading}
                            aria-invalid={!!errors.teamName}
                            className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                            {...register("teamName")}
                        />
                        {errors.teamName ? (
                            <FieldError errors={[errors.teamName]} />
                        ) : (
                            <FieldDescription className="font-mono text-xs">
                                dugble.com/{slug}
                            </FieldDescription>
                        )}
                    </Field>
                </div>

                <div className="border-t border-border/60 px-5 py-6 sm:px-8 sm:py-8">
                    <Field>
                        <FieldLabel htmlFor="invite-emails">
                            Invite teammates
                            <span className="ml-1.5 font-mono text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
                                Optional
                            </span>
                        </FieldLabel>
                        <Input
                            id="invite-emails"
                            placeholder="you@email.io, kessie@gmail.com"
                            disabled={loading}
                            className="max-w-sm rounded-lg border border-border/60 bg-muted/20 py-2 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                            {...register("inviteEmails")}
                        />
                        <FieldDescription>
                            Separate emails with a comma. You can invite more
                            people later from team settings.
                        </FieldDescription>
                    </Field>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Link
                    href="/dashboard"
                    className="group/button relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 py-1.5 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    Cancel
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>

                <Button
                    type="submit"
                    disabled={loading}
                    className="group relative overflow-hidden hover:cursor-pointer"
                >
                    <span
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
                        aria-hidden
                    />
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    <span className="relative">Create team</span>
                    <kbd className="relative ml-1 hidden rounded border border-white/20 bg-black/10 px-1.5 py-0.5 font-mono text-[10px] font-normal opacity-70 sm:inline-block">
                        ⌘⏎
                    </kbd>
                </Button>
            </div>
        </form>
    );
}
