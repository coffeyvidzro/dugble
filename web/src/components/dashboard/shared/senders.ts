import { SENDER_NUMBERS } from "../sms/sms-dashboard/types";

export function getApprovedSenders() {
    return SENDER_NUMBERS.filter((sender) => sender.status === "approved");
}
