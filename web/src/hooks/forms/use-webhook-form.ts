// src/hooks/forms/use-webhook-form.ts

"use client";

import { useState } from "react";
import { createWebhookEndpointInputSchema } from "@/types/webhook";

export type WebhookFormValues = {
  url: string;
  events: string[];
};

const EMPTY_VALUES: WebhookFormValues = { url: "", events: [] };

export function useWebhookForm(
  initialValues: WebhookFormValues = EMPTY_VALUES,
) {
  const [url, setUrl] = useState(initialValues.url);
  const [events, setEvents] = useState<string[]>(initialValues.events);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function handleUrlChange(value: string) {
    setUrl(value);
    setUrlError(null);
  }

  function handleEventsChange(next: string[]) {
    setEvents(next);
    setEventsError(null);
  }

  function reset(next: WebhookFormValues = EMPTY_VALUES) {
    setUrl(next.url);
    setEvents(next.events);
    setUrlError(null);
    setEventsError(null);
    setFormError(null);
  }

  /**
   * Validates the current url/events against the shared create-input
   * schema (also used for edits — the wire shape is identical, only the
   * HTTP verb differs at the call site). On failure, populates the
   * per-field error state and returns `null`. On success, clears errors
   * and returns the parsed, trimmed data ready to send.
   */
  function validate() {
    setFormError(null);

    const parsed = createWebhookEndpointInputSchema.safeParse({
      url,
      subscribed_events: events,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setUrlError(fieldErrors.url?.[0] ?? null);
      setEventsError(fieldErrors.subscribed_events?.[0] ?? null);
      return null;
    }

    setUrlError(null);
    setEventsError(null);
    return parsed.data;
  }

  return {
    url,
    events,
    urlError,
    eventsError,
    formError,
    onUrlChange: handleUrlChange,
    onEventsChange: handleEventsChange,
    setFormError,
    validate,
    reset,
  };
}
