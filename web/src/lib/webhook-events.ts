// src/lib/webhook-events.ts

export type WebhookEventGroupId =
  | "sms"
  | "email"
  | "contact"
  | "suppression"
  | "broadcast";

export type WebhookEventGroup = {
  id: WebhookEventGroupId;
  label: string;
  events: string[];
};

export const WEBHOOK_EVENT_GROUPS: WebhookEventGroup[] = [
  {
    id: "sms",
    label: "SMS",
    events: [
      "sms.submitted",
      "sms.sent",
      "sms.delivered",
      "sms.undelivered",
      "sms.failed",
    ],
  },
  {
    id: "email",
    label: "Emails",
    events: [
      "email.submitted",
      "email.delivered",
      "email.delayed",
      "email.bounced",
      "email.complained",
      "email.rejected",
      "email.failed",
      "email.opened",
      "email.clicked",
      "email.subscription_changed",
    ],
  },
  {
    id: "contact",
    label: "Contacts",
    events: ["contact.created", "contact.updated", "contact.deleted"],
  },
  {
    id: "suppression",
    label: "Suppressions",
    events: ["suppression.created", "suppression.deleted"],
  },
  {
    id: "broadcast",
    label: "Broadcasts",
    events: [
      "broadcast.scheduled",
      "broadcast.queued",
      "broadcast.sent",
      "broadcast.failed",
      "broadcast.canceled",
    ],
  },
];
