export type MessageTemplateId = "otp" | "receipt" | "alert" | "reminder";

export type MessageTemplate = {
    id: MessageTemplateId;
    label: string;
    description: string;
    body: string;
};

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
    {
        id: "otp",
        label: "OTP code",
        description: "One-time verification code",
        body: "Your Dugble verification code is 482913. It expires in 5 minutes.",
    },
    {
        id: "receipt",
        label: "Payment receipt",
        description: "Confirm a successful payment",
        body: "Payment of GHS 120.00 received. Thank you for your purchase!",
    },
    {
        id: "alert",
        label: "Account alert",
        description: "Notify about suspicious activity",
        body: "We noticed a new sign-in to your account from a new device. If this wasn't you, reset your password immediately.",
    },
    {
        id: "reminder",
        label: "Appointment reminder",
        description: "Remind a customer of an upcoming visit",
        body: "Reminder: your appointment is tomorrow at 3:00 PM. Reply STOP to opt out.",
    },
];

export function getTemplateById(
    id: string | undefined,
): MessageTemplate | undefined {
    return MESSAGE_TEMPLATES.find((template) => template.id === id);
}

const PREVIEW_MERGE_VALUES: Record<string, string> = {
    first_name: "Ama",
    last_name: "Mensah",
    name: "Ama Mensah",
};

export function resolvePreviewMessage(message: string): string {
    return message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
        return PREVIEW_MERGE_VALUES[key] ?? match;
    });
}
