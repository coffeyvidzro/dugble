import { constructMetadata } from "@/utils/metadata";
import { RequestHeader } from "@/components/dashboard/sms/sender-ids/request-header";
import { SenderIdRequestForm } from "@/components/dashboard/sms/sender-ids/sender-id-request-form";

export const metadata = constructMetadata({
    title: "Request Sender ID",
    description: "Request a new sender ID for A2P SMS delivery.",
    path: "/dashboard/sms/sender-ids/new",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="mx-auto w-full max-w-2xl pb-6">
            <RequestHeader />
            <SenderIdRequestForm />
        </div>
    );
}
