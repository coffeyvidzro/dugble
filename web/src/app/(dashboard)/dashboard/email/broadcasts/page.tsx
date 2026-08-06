import { BroadcastsListView } from "@/components/dashboard/email/broadcasts/broadcasts-list-view";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Broadcasts",
    description:
        "Create and monitor email broadcasts from your Dugble workspace.",
    path: "/dashboard/email/broadcasts",
    preset: "dashboard",
});

export default function Page() {
    return <BroadcastsListView />;
}
