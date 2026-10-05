// src/components/dashboard/webhooks/edit-webhook-dialog.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWebhookForm } from "@/hooks/forms/use-webhook-form";
import { useUpdateWebhookEndpoint } from "@/hooks/queries/use-webhooks";
import type { WebhookEndpoint } from "@/types/webhook";
import { WebhookFormFields } from "./webhook-form-fields";

export function EditWebhookDialog({
  webhook,
  onOpenChange,
}: {
  webhook: WebhookEndpoint | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={webhook !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/40 shadow-xl max-h-[85vh] overflow-y-auto">
        {webhook && (
          <EditWebhookForm
            key={webhook.id}
            webhook={webhook}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditWebhookForm({
  webhook,
  onCancel,
  onSaved,
}: {
  webhook: WebhookEndpoint;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const form = useWebhookForm({
    url: webhook.url,
    events: webhook.subscribed_events,
  });

  const { mutate: updateWebhook, isPending } = useUpdateWebhookEndpoint();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = form.validate();
    if (!parsed) return;

    updateWebhook(
      { id: webhook.id, input: parsed },
      {
        onSuccess: onSaved,
        onError: (mutationError) => {
          form.setFormError(
            mutationError instanceof Error
              ? mutationError.message
              : "Something went wrong. Try again.",
          );
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit webhook endpoint</DialogTitle>
        <DialogDescription>
          Changes apply immediately. Your signing secret stays the same.
        </DialogDescription>
      </DialogHeader>

      <div className="py-6">
        <WebhookFormFields
          idPrefix="edit-webhook"
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
          onClick={onCancel}
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
          {isPending ? "Saving…" : "Save changes"}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
          />
        </Button>
      </DialogFooter>
    </form>
  );
}
