// src/app/(dashboard)/dashboard/sms/sender-ids/new/page.tsx

import { RequestHeader } from "@/components/dashboard/sms/sender-ids/request-header";
import { SenderIdRequestForm } from "@/components/dashboard/sms/sender-ids/sender-id-request-form";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-2xl pb-6">
      <RequestHeader />
      <SenderIdRequestForm />
    </div>
  );
}
