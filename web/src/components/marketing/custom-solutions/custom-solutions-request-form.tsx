"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { engagementModelOptions } from "@/components/marketing/custom-solutions/custom-solutions-data";
import { Button } from "@/components/ui/button";
import {
    Field,
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
import { Textarea } from "@/components/ui/textarea";
import { csrfFetch } from "@/lib/csrf-fetch";

const volumeRanges = [
    "Under 10k messages / month",
    "10k - 100k messages / month",
    "100k - 1M messages / month",
    "1M+ messages / month",
    "Not sure yet",
];

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required."),
    email: z.email("Please enter a valid email address."),
    company: z.string().trim().min(1, "Company name is required."),
    monthlyVolume: z.string().min(1, "Please select a volume range."),
    engagementModel: z.string().optional(),
    need: z
        .string()
        .trim()
        .min(10, "Give us a bit more detail — at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomSolutionsRequestForm() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const requestedTier = searchParams.get("tier");
    const preselectedModel = engagementModelOptions.includes(
        requestedTier ?? "",
    )
        ? (requestedTier as string)
        : "";

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            company: "",
            monthlyVolume: "",
            engagementModel: preselectedModel,
            need: "",
        },
    });

    async function onSubmit(data: FormValues) {
        setLoading(true);
        try {
            // Reuses the existing contact endpoint
            const response = await csrfFetch("/api/v1/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    reason: "Custom Solutions",
                    message: [
                        `Company: ${data.company}`,
                        `Engagement model: ${data.engagementModel || "Not specified"}`,
                        `Estimated monthly volume: ${data.monthlyVolume}`,
                        "",
                        data.need,
                    ].join("\n"),
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                toast.error(
                    error?.error?.message ?? "Unable to send your request.",
                );
                return;
            }

            toast.success(
                "Request sent — we'll follow up within a business day or two.",
            );
            form.reset();
        } catch {
            toast.error("Unable to send your request. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            id="custom-solutions-form"
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="cs-name">Name</FieldLabel>
                                <Input
                                    {...field}
                                    id="cs-name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    disabled={loading}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="cs-email">
                                    Work email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="cs-email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="you@company.com"
                                    autoComplete="email"
                                    type="email"
                                    disabled={loading}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                        name="company"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="cs-company">
                                    Company
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="cs-company"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Company name"
                                    autoComplete="organization"
                                    disabled={loading}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="monthlyVolume"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="cs-volume">
                                    Estimated volume
                                </FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={loading}
                                >
                                    <SelectTrigger
                                        id="cs-volume"
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select a range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {volumeRanges.map((range) => (
                                            <SelectItem
                                                key={range}
                                                value={range}
                                            >
                                                {range}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    name="engagementModel"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="cs-model">
                                Which model fits best?{" "}
                                <span className="font-normal text-muted-foreground">
                                    (optional)
                                </span>
                            </FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={loading}
                            >
                                <SelectTrigger id="cs-model" className="w-full">
                                    <SelectValue placeholder="Not sure yet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {engagementModelOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Controller
                    name="need"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="cs-need">
                                What are you looking to build?
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id="cs-need"
                                aria-invalid={fieldState.invalid}
                                placeholder="Tell us about your stack, compliance needs, or what the standard API doesn't cover."
                                rows={5}
                                disabled={loading}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />

                <Button
                    type="submit"
                    form="custom-solutions-form"
                    disabled={loading}
                    size="lg"
                    className="w-full hover:cursor-pointer sm:w-auto"
                >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Request a consultation
                </Button>

                <p className="font-mono text-xs text-muted-foreground">
                    Prefer email? Reach us directly at{" "}
                    <a
                        href="mailto:hello@dugble.com"
                        className="text-signal hover:underline"
                    >
                        hello@dugble.com
                    </a>
                    .
                </p>
            </FieldGroup>
        </form>
    );
}
