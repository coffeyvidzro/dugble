import { Suspense } from "react";

import { ComposeBroadcastPage } from "@/components/dashboard/email/broadcasts/compose-broadcast-page";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "New Broadcast",
    description: "Compose and schedule a new email broadcast.",
    path: "/dashboard/email/broadcasts/new",
    preset: "dashboard",
});

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ComposeBroadcastPage />
        </Suspense>
    );
}
