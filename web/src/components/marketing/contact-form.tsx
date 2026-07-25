"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { csrfFetch } from "@/lib/csrf-fetch";

const reasons = [
    "Early access",
    "Product feedback",
    "Volume SMS",
    "Partnerships",
    "Support",
    "Other",
];

const formSchema = z.object({
    name: z.string().trim().min(1, "Name is required."),
    email: z.email("Please enter a valid email address."),
    reason: z.string().min(1, "Please select a reason."),
    message: z
        .string()
        .trim()
        .min(10, "Tell us a bit more — at least 10 characters."),
});

export function ContactForm() {
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", reason: "", message: "" },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await csrfFetch("/api/v1/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => null);
                toast.error(
                    error?.error?.message ?? "Unable to send your message.",
                );
                return;
            }

            toast.success("Message sent — we'll get back to you soon.");
            form.reset();
        } catch {
            toast.error("Unable to send your message. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            id="contact-form"
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
                                <FieldLabel htmlFor="contact-name">
                                    Name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="contact-name"
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
                                <FieldLabel htmlFor="contact-email">
                                    Email
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="contact-email"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="youremail@example.com"
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

                <Controller
                    name="reason"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="contact-reason">
                                What&apos;s this about?
                            </FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={loading}
                            >
                                <SelectTrigger
                                    id="contact-reason"
                                    aria-invalid={fieldState.invalid}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasons.map((reason) => (
                                        <SelectItem key={reason} value={reason}>
                                            {reason}
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
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="contact-message">
                                Message
                            </FieldLabel>
                            <Textarea
                                {...field}
                                id="contact-message"
                                aria-invalid={fieldState.invalid}
                                placeholder="What are you building, and where's it going wrong (or right)?"
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
                    form="contact-form"
                    disabled={loading}
                    size="lg"
                    className="w-full hover:cursor-pointer sm:w-auto"
                >
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Send message
                </Button>

                <p className="font-mono text-xs text-muted-foreground">
                    We read every message ourselves and usually reply within a
                    business day or two.
                </p>
            </FieldGroup>
        </form>
    );
}
