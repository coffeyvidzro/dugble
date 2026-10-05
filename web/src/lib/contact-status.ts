import {
  SMS_CONSENT_STATUS_LABEL,
  type SmsConsentStatus,
} from "@/types/contact";

export type ConsentBadgeDisplay = {
  dotClassName: string;
  textClassName: string;
  label: string;
};

export function getSmsConsentBadge(
  status: SmsConsentStatus,
): ConsentBadgeDisplay {
  if (status === "opted_in") {
    return {
      dotClassName: "bg-signal",
      textClassName: "text-signal",
      label: SMS_CONSENT_STATUS_LABEL.opted_in,
    };
  }

  if (status === "opted_out") {
    return {
      dotClassName: "bg-danger",
      textClassName: "text-danger",
      label: SMS_CONSENT_STATUS_LABEL.opted_out,
    };
  }

  return {
    dotClassName: "bg-muted-foreground/50",
    textClassName: "text-muted-foreground",
    label: SMS_CONSENT_STATUS_LABEL.unknown,
  };
}
