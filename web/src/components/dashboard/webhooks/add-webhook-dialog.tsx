"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWebhookForm } from "@/hooks/forms/use-webhook-form";
import { useCreateWebhookEndpoint } from "@/hooks/queries/use-webhooks";
import { SecretReveal } from "./secret-reveal";
import { WebhookFormFields } from "./webhook-form-fields";

type Step = "form" | "reveal";

export function AddWebhookDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [secret, setSecret] = useState<string | null>(null);

  const form = useWebhookForm();
  const { mutate: createWebhook, isPending } = useCreateWebhookEndpoint();

  function reset() {
    setStep("form");
    setSecret(null);
    form.reset();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = form.validate();
    if (!parsed) return;

    createWebhook(parsed, {
      onSuccess: (created) => {
        setSecret(created.signing_secret);
        setStep("reveal");
      },
      onError: (mutationError) => {
        form.setFormError(
          mutationError instanceof Error
            ? mutationError.message
            : "Something went wrong. Try again.",
        );
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20" />
        }
      >
        <Plus className="size-4" />
        Add webhook
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg no-scrollbar border-border/40 shadow-xl max-h-[85vh] overflow-y-auto">
        {step === "form" ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add webhook endpoint</DialogTitle>
              <DialogDescription>
                Dugble will POST a JSON payload to this URL for every event you
                select below.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <WebhookFormFields
                idPrefix="add-webhook"
                url={form.url}
                onUrlChange={form.onUrlChange}
                urlError={form.urlError}
                events={form.events}
                onEventsChange={form.onEventsChange}
                eventsError={form.eventsError}
              />
              {form.formError && (
                <p className="mt-4 text-xs font-medium text-danger animate-fade-up">
                  {form.formError}
                </p>
              )}
            </div>

            <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-border/40 pt-4 sm:space-x-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="group/button relative inline-flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 disabled:pointer-events-none disabled:opacity-60 sm:flex-initial"
              >
                {isPending ? "Adding…" : "Add webhook"}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="animate-fade-up">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="size-5 text-signal" />
                Webhook added
              </DialogTitle>
              <DialogDescription>
                This is the only time your signing secret will be shown in full.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <SecretReveal secret={secret ?? ""} />
            </div>

            <DialogFooter className="border-t border-border/40 pt-4">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="group/button relative inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
              >
                I&apos;ve saved it securely
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
