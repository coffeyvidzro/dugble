// src/app/(dashboard)/dashboard/sms/send/page.tsx

import { SendHub } from "@/components/dashboard/sms/send-sms/send-hub";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Send SMS",
  description: "Send an A2P SMS message from your Dugble workspace.",
  path: "/dashboard/sms/send",
  preset: "dashboard",
});

export default function Page() {
  return <SendHub />;
}
