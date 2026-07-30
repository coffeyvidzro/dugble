"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    Controller,
    FormProvider,
    useForm,
    useFormContext,
    useWatch,
} from "react-hook-form";
import { Building2, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { csrfFetch } from "@/lib/csrf-fetch";
import { cn } from "@/lib/utils";
import { FormSection } from "./form-section";
import { WorkspacePreview } from "./workspace-preview";
import {
    businessTypes,
    formSchema,
    industries,
    monthlyVolumes,
    requiredFieldKeys,
    useCases,
    type FormValues,
} from "./create-workspace-schema";

const FieldStatus = memo(function FieldStatus({
    visible,
}: {
    visible: boolean;
}) {
    return (
        <Check
            aria-hidden
            className={cn(
                "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-signal transition-all duration-200",
                visible ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
        />
    );
});

// Reusable Form Components

type InputFieldProps = {
    name: keyof FormValues;
    label: string;
    id: string;
    placeholder: string;
    loading: boolean;
    type?: string;
    className?: string;
    description?: string;
    showStatus?: boolean;
};

const CustomInputField = memo(function CustomInputField({
    name,
    label,
    id,
    placeholder,
    loading,
    type = "text",
    className = "pr-9",
    description,
    showStatus = true,
}: InputFieldProps) {
    const { control } = useFormContext<FormValues>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const isFieldValueValid =
                    !fieldState.invalid &&
                    typeof field.value === "string" &&
                    field.value.trim().length > 0;

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={id}>{label}</FieldLabel>
                        {showStatus ? (
                            <div className="relative">
                                <Input
                                    {...field}
                                    id={id}
                                    type={type}
                                    aria-invalid={fieldState.invalid}
                                    placeholder={placeholder}
                                    disabled={loading}
                                    className={className}
                                />
                                <FieldStatus visible={isFieldValueValid} />
                            </div>
                        ) : (
                            <Input
                                {...field}
                                id={id}
                                type={type}
                                aria-invalid={fieldState.invalid}
                                placeholder={placeholder}
                                disabled={loading}
                                className={className}
                            />
                        )}
                        {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                        ) : (
                            description && (
                                <FieldDescription>
                                    {description}
                                </FieldDescription>
                            )
                        )}
                    </Field>
                );
            }}
        />
    );
});

type SelectFieldProps = {
    name: keyof FormValues;
    label: string;
    id: string;
    placeholder: string;
    loading: boolean;
    options: readonly string[] | string[];
    description?: string;
};

const CustomSelectField = memo(function CustomSelectField({
    name,
    label,
    id,
    placeholder,
    loading,
    options,
    description,
}: SelectFieldProps) {
    const { control } = useFormContext<FormValues>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={id}>{label}</FieldLabel>
                    <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                    >
                        <SelectTrigger
                            id={id}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-y-auto">
                            {options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                    ) : (
                        description && (
                            <FieldDescription>{description}</FieldDescription>
                        )
                    )}
                </Field>
            )}
        />
    );
});

// Progress bar indicator component to isolate field watching
const FormProgressIndicator = memo(function FormProgressIndicator({
    variant = "desktop",
}: {
    variant?: "mobile" | "desktop";
}) {
    const { control } = useFormContext<FormValues>();
    const watchedValues = useWatch({
        control,
        name: requiredFieldKeys,
    });

    const totalCount = requiredFieldKeys.length;
    const completedCount = Array.isArray(watchedValues)
        ? watchedValues.filter((val) =>
              Boolean(typeof val === "string" ? val.trim() : val),
          ).length
        : 0;
    const progress = Math.round((completedCount / totalCount) * 100);

    if (variant === "mobile") {
        return (
            <div className="space-y-2.5 sm:hidden">
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Cancel
                    </Link>
                    <span className="font-mono text-[11px] text-muted-foreground">
                        {completedCount}/{totalCount} fields
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="hidden min-w-40 flex-1 items-center gap-3 sm:flex">
            <div className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-signal transition-[width] duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                {completedCount}/{totalCount} fields
            </span>
        </div>
    );
});

// Main Form Component

export function CreateWorkspaceForm() {
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
                        <WorkspacePreview />
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
