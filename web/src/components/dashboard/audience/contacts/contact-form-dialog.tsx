// src/components/dashboard/audience/contacts/contact-form-dialog.tsx

"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateContact,
  useUpdateContact,
} from "@/hooks/queries/use-contacts";
import {
  type Contact,
  SMS_CONSENT_STATUS_LABEL,
  type SmsConsentStatus,
  smsConsentStatusSchema,
} from "@/types/contact";

type ContactFormState = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  sms_consent_status: SmsConsentStatus;
  unsubscribed: boolean;
};

const EMPTY_FORM: ContactFormState = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  sms_consent_status: "unknown",
  unsubscribed: false,
};

function contactToFormState(contact: Contact): ContactFormState {
  return {
    email: contact.email,
    first_name: contact.first_name ?? "",
    last_name: contact.last_name ?? "",
    phone: contact.phone ?? "",
    sms_consent_status: contact.sms_consent_status,
    unsubscribed: contact.unsubscribed,
  };
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
}) {
  const isEditing = Boolean(contact);
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact(contact?.id ?? "");
  const mutation = isEditing ? updateMutation : createMutation;

  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  // Reset the form when the dialog opens or targets a different contact.
  // Adjusting state during render (not in an effect) avoids a stale frame.
  const openKey = open ? (contact?.id ?? "new") : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (openKey) {
      setForm(contact ? contactToFormState(contact) : EMPTY_FORM);
      setError(null);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const email = form.email.trim();
    if (!email) {
      setError("Email is required.");
      return;
    }

    // The API requires sms_consent_source whenever an explicit consent
    // status is set — "unknown" is the only status that can go without
    // one, so we only attach a source once the operator has made a
    // deliberate choice here.
    const payload = {
      email,
      first_name: form.first_name.trim() || undefined,
      last_name: form.last_name.trim() || undefined,
      phone: form.phone.trim() || undefined,
      sms_consent_status: form.sms_consent_status,
      sms_consent_source:
        form.sms_consent_status !== "unknown" ? ("manual" as const) : undefined,
      unsubscribed: form.unsubscribed,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit contact" : "Add contact"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this contact's details and SMS consent."
              : "New contacts can be added to segments and included in campaigns."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  email: e.target.value,
                }))
              }
              placeholder="ada@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contact-first-name">First name</Label>
              <Input
                id="contact-first-name"
                value={form.first_name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    first_name: e.target.value,
                  }))
                }
                placeholder="Ada"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-last-name">Last name</Label>
              <Input
                id="contact-last-name"
                value={form.last_name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    last_name: e.target.value,
                  }))
                }
                placeholder="Lovelace"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  phone: e.target.value,
                }))
              }
              placeholder="+233201234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-sms-consent">SMS consent</Label>
            {/* Native select to avoid assuming a shadcn Select
                            component exists in this project — swap for yours
                            if you have one. */}
            <select
              id="contact-sms-consent"
              value={form.sms_consent_status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sms_consent_status: smsConsentStatusSchema.parse(
                    e.target.value,
                  ),
                }))
              }
              className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
            >
              {smsConsentStatusSchema.options.map((status) => (
                <option key={status} value={status}>
                  {SMS_CONSENT_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.unsubscribed}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  unsubscribed: e.target.checked,
                }))
              }
              className="size-4 rounded border-border/60"
            />
            Unsubscribed from email
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEditing ? "Save changes" : "Add contact"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
