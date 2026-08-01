"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Building2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { csrfFetch } from "@/lib/csrf-fetch";
import { CustomInputField } from "./custom-input-field";
import { CustomSelectField } from "./custom-select-field";
import { FormProgressIndicator } from "./form-progress-indicator";
import { FormSection } from "./form-section";
import { WorkspacePreview } from "./workspace-preview";
import {
    businessTypes,
    formSchema,
    industries,
    monthlyVolumes,
    useCases,
    type FormValues,
} from "./create-workspace-schema";

type CreateWorkspaceFormProps = {
    nextSteps: ReactNode;
};

export function CreateWorkspaceForm({ nextSteps }: CreateWorkspaceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onBlur",
        defaultValues: {
            workspaceName: "",
            businessPhone: "",
            businessEmail: "",
            businessAddress: "",
            businessType: "",
            industry: "",
            registrationNumber: "",
            useCase: "",
            monthlyVolume: "",
            website: "",
        },
    });

    async function onSubmit(data: FormValues) {
        setLoading(true);
        try {
            const response = await csrfFetch("/api/v1/workspaces", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                toast.error(
                    error?.error?.message ?? "Unable to create workspace.",
                );
                setLoading(false);
                return;
            }

            toast.success("Workspace created.");
            router.push("/dashboard");
            router.refresh();
        } catch {
            toast.error("Unable to create workspace. Please try again.");
            setLoading(false);
        }
    }

    // Reference handler to avoid stale closures
    const handleSubmitRef = useRef(form.handleSubmit(onSubmit));
    useEffect(() => {
        handleSubmitRef.current = form.handleSubmit(onSubmit);
    }, [form, onSubmit]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void handleSubmitRef.current();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <FormProvider {...form}>
            <form
                id="create-business-form"
                className="pb-36 sm:pb-24"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-8">
                    <div className="space-y-6">
                        <FormSection
                            icon={Building2}
                            title="Workspace details"
                            description="The basics: What this workspace is called, and how we reach the business behind it."
                        >
                            <FieldGroup className="gap-5">
                                <CustomInputField
                                    name="workspaceName"
                                    id="workspace-name"
                                    label="Workspace name"
                                    placeholder="Vidzro Logistics"
                                    loading={loading}
                                />

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <CustomInputField
                                        name="businessPhone"
                                        id="business-phone"
                                        label="Business phone"
                                        type="tel"
                                        placeholder="+233531184325"
                                        className="pr-9 font-mono text-sm"
                                        loading={loading}
                                    />
                                    <CustomInputField
                                        name="businessEmail"
                                        id="business-email"
                                        label="Business email"
                                        type="email"
                                        placeholder="business@vidzro.io"
                                        loading={loading}
                                    />
                                </div>

                                <CustomInputField
                                    name="businessAddress"
                                    id="business-address"
                                    label="Business address"
                                    placeholder="14 Independence Ave, Accra, Ghana"
                                    loading={loading}
                                />
                            </FieldGroup>
                        </FormSection>

                        <FormSection
                            icon={ShieldCheck}
                            title="Verification & compliance"
                            description="Carriers and regulators require this before messages can send under this workspace's name."
                            delay={0.08}
                        >
                            <FieldGroup className="gap-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <CustomSelectField
                                        name="businessType"
                                        id="business-type"
                                        label="Business type"
                                        placeholder="Select a type"
                                        options={businessTypes}
                                        loading={loading}
                                    />
                                    <CustomSelectField
                                        name="industry"
                                        id="industry"
                                        label="Industry"
                                        placeholder="Select an industry"
                                        options={industries}
                                        loading={loading}
                                    />
                                </div>

                                <CustomInputField
                                    name="registrationNumber"
                                    id="registration-number"
                                    label="Business registration number"
                                    placeholder="Company registration, EIN, or equivalent"
                                    className="pr-9 font-mono text-sm"
                                    description="Used to verify this is a real, registered business."
                                    loading={loading}
                                />

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <CustomSelectField
                                        name="useCase"
                                        id="use-case"
                                        label="Primary use case"
                                        placeholder="What will you send?"
                                        options={useCases}
                                        description="Carriers filter traffic by declared use case."
                                        loading={loading}
                                    />
                                    <CustomSelectField
                                        name="monthlyVolume"
                                        id="monthly-volume"
                                        label="Expected monthly volume"
                                        placeholder="Rough estimate"
                                        options={monthlyVolumes}
                                        loading={loading}
                                    />
                                </div>

                                <CustomInputField
                                    name="website"
                                    id="website"
                                    label="Website (optional)"
                                    placeholder="vidzro.io"
                                    className="font-mono text-sm"
                                    showStatus={false}
                                    loading={loading}
                                />
                            </FieldGroup>
                        </FormSection>
                    </div>

                    <div className="lg:sticky lg:top-6">
                        <WorkspacePreview nextSteps={nextSteps} />
                    </div>
                </div>

                <div className="sticky bottom-0 inset-x-0 z-30 -mx-4 mt-8 border-t border-border/60 bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-lg shadow-black/4 backdrop-blur-md sm:mx-0 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:border sm:bottom-4 sm:px-5 sm:py-4">
                    {/* Mobile layout */}
                    <div className="space-y-2.5 sm:hidden">
                        <FormProgressIndicator variant="mobile" />
                        <Button
                            type="submit"
                            form="create-business-form"
                            disabled={loading}
                            className="group relative w-full overflow-hidden hover:cursor-pointer"
                        >
                            <span
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
                                aria-hidden
                            />
                            {loading && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            <span className="relative">Create workspace</span>
                        </Button>
                    </div>

                    {/* Desktop / tablet layout */}
                    <FormProgressIndicator variant="desktop" />

                    <div className="hidden items-center justify-end gap-3 sm:flex">
                        <Link
                            href="/dashboard"
                            className="group/button relative inline-flex py-1.5 items-center justify-center gap-2 overflow-hidden rounded-full border bg-background px-4 font-mono text-sm text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                        >
                            Cancel
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                            />
                        </Link>
                        <Button
                            type="submit"
                            form="create-business-form"
                            disabled={loading}
                            className="group relative overflow-hidden hover:cursor-pointer"
                        >
                            <span
                                className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
                                aria-hidden
                            />
                            {loading && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            <span className="relative">Create workspace</span>
                            <kbd className="relative ml-1 hidden rounded border border-white/20 bg-black/10 px-1.5 py-0.5 font-mono text-[10px] font-normal opacity-70 sm:inline-block">
                                ⌘⏎
                            </kbd>
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
