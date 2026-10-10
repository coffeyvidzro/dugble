"use client";

import { Loader2, Plus, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSendEmail } from "@/hooks/queries/use-emails-api";

function parseAddressList(raw: string): string[] {
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function SendEmailDialog() {
  const sendEmail = useSendEmail();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFrom("");
    setTo("");
    setCc("");
    setBcc("");
    setReplyTo("");
    setSubject("");
    setBody("");
    setIsHtml(false);
    setScheduledAt("");
    setError(null);
    sendEmail.reset();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const recipients = parseAddressList(to);

    if (recipients.length === 0) {
      setError("Enter at least one recipient.");
      return;
    }
    if (!subject.trim()) {
      setError("Enter a subject line.");
      return;
    }
    if (!body.trim()) {
      setError("Write a message body.");
      return;
    }
    setError(null);

    sendEmail.mutate(
      {
        from: from.trim() || undefined,
        to: recipients,
        cc: cc.trim() ? parseAddressList(cc) : undefined,
        bcc: bcc.trim() ? parseAddressList(bcc) : undefined,
        reply_to: replyTo.trim() ? parseAddressList(replyTo) : undefined,
        subject: subject.trim(),
        html: isHtml ? body : undefined,
        text: isHtml ? undefined : body,
        scheduled_at: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
        onError: (err) =>
          setError(
            err instanceof Error ? err.message : "Couldn't send that email.",
          ),
      },
    );
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
          <Button className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90" />
        }
      >
        <Plus className="size-4" />
        Send email
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-border/40 shadow-xl max-h-[90dvh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader className="shrink-0">
            <DialogTitle>Send email</DialogTitle>
            <DialogDescription>
              Send a one-off transactional email through the Dugble API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6 overflow-y-auto flex-1 px-1 no-scrollbar">
            {error && (
              <p className="text-xs font-medium text-danger">{error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="send-email-from">From (optional)</Label>
              <Input
                id="send-email-from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Acme <hello@yourdomain.com>"
                className="border-foreground/15 bg-background focus-visible:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use your workspace&apos;s default sender.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-email-to">To</Label>
              <Input
                id="send-email-to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="jane@example.com, sam@example.com"
                className="border-foreground/15 bg-background font-mono text-sm focus-visible:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="send-email-cc">Cc</Label>
                <Input
                  id="send-email-cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="border-foreground/15 bg-background font-mono text-sm focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="send-email-bcc">Bcc</Label>
                <Input
                  id="send-email-bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="border-foreground/15 bg-background font-mono text-sm focus-visible:ring-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-email-reply-to">Reply-to</Label>
              <Input
                id="send-email-reply-to"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="border-foreground/15 bg-background font-mono text-sm focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-email-subject">Subject</Label>
              <Input
                id="send-email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your verification code"
                className="border-foreground/15 bg-background focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="send-email-body">Body</Label>
                <button
                  type="button"
                  onClick={() => setIsHtml((v) => !v)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {isHtml ? "Sending as HTML" : "Sending as plain text"} ·
                  toggle
                </button>
              </div>
              <Textarea
                id="send-email-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isHtml ? "<p>Hello!</p>" : "Write your message..."}
                rows={7}
                className="border-foreground/15 bg-background font-mono text-sm focus-visible:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-email-schedule">Send at (optional)</Label>
              <Input
                id="send-email-schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="border-foreground/15 bg-background focus-visible:ring-primary/50"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 pt-4 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendEmail.isPending}
              className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              {sendEmail.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {sendEmail.isPending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
