"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  useCreateCampaign,
  useScheduleCampaignByIdMutation,
  useSendCampaignByIdMutation,
} from "@/hooks/queries/use-campaigns-api";
import { errorMessage } from "@/lib/errors";
import { toDateTimeLocalValue } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { BuilderStepper } from "./builder-stepper";
import type { CampaignScheduleMode } from "./campaign-builder-types";
import { StepAudience } from "./step-audience";
import { StepDetails } from "./step-details";
import { StepReview } from "./step-review";
import { StepSchedule } from "./step-schedule";

const STEP_COUNT = 4;

export function CampaignBuilder() {
  const router = useRouter();
  const minDateTime = useMemo(
    () => toDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)),
    [],
  );

  const createCampaign = useCreateCampaign();
  const sendCampaign = useSendCampaignByIdMutation();
  const scheduleCampaign = useScheduleCampaignByIdMutation();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [senderId, setSenderId] = useState("");
  const [body, setBody] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [scheduleMode, setScheduleMode] = useState<CampaignScheduleMode>("now");
  const [sendAt, setSendAt] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepValid = [
    name.trim().length > 0 && senderId.length > 0 && body.trim().length > 0,
    segmentId.length > 0,
    scheduleMode === "now" || sendAt.length > 0,
    true,
  ];

  const canGoNext = stepValid[step];
  const isSubmitting =
    createCampaign.isPending ||
    sendCampaign.isPending ||
    scheduleCampaign.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (step !== STEP_COUNT - 1 || !stepValid.slice(0, 3).every(Boolean))
      return;

    setSubmitError(null);

    createCampaign.mutate(
      {
        name: name.trim(),
        segment_id: segmentId,
        sender_id: senderId,
        body,
      },
      {
        onSuccess: (campaign) => {
          const goToCampaign = () =>
            router.push(`/dashboard/sms/campaigns/${campaign.id}?created=1`);

          if (scheduleMode === "now") {
            sendCampaign.mutate(
              { campaignId: campaign.id },
              {
                onSuccess: goToCampaign,
                onError: () => {
                  goToCampaign();
                },
              },
            );
            return;
          }

          scheduleCampaign.mutate(
            {
              campaignId: campaign.id,
              input: {
                scheduled_at: new Date(sendAt).toISOString(),
              },
            },
            {
              onSuccess: goToCampaign,
              onError: () => {
                goToCampaign();
              },
            },
          );
        },
        onError: (error) => {
          setSubmitError(
            errorMessage(
              error,
              "Couldn't create the campaign. Check the details and try again.",
            ),
          );
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <BuilderStepper currentStep={step} />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          {step === 0 && (
            <StepDetails
              name={name}
              onNameChange={setName}
              senderId={senderId}
              onSenderIdChange={(value) => setSenderId(value ?? "")}
              body={body}
              onBodyChange={setBody}
            />
          )}
          {step === 1 && (
            <StepAudience value={segmentId} onChange={setSegmentId} />
          )}
          {step === 2 && (
            <StepSchedule
              mode={scheduleMode}
              onModeChange={setScheduleMode}
              sendAt={sendAt}
              onSendAtChange={setSendAt}
              minDateTime={minDateTime}
            />
          )}
          {step === 3 && (
            <StepReview
              name={name}
              senderId={senderId}
              segmentId={segmentId}
              body={body}
              scheduleMode={scheduleMode}
              sendAt={sendAt}
            />
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            {step < STEP_COUNT - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEP_COUNT - 1, s + 1))}
                disabled={!canGoNext}
                className="group/button relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90"
              >
                Continue
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "group/button relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Rocket className="size-4" />
                )}
                {isSubmitting
                  ? "Creating…"
                  : scheduleMode === "later"
                    ? "Schedule campaign"
                    : "Send campaign"}
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
