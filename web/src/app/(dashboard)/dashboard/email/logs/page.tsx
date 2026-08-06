import { LogsOverview } from "@/components/dashboard/email/logs/logs-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Logs",
    description: "Search and inspect transactional email delivery logs.",
    path: "/dashboard/email/logs",
    preset: "dashboard",
});

export default function Page() {
    return <LogsOverview />;
}

// import { ScrollText } from "lucide-react";
// import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
// import { constructMetadata } from "@/utils/metadata";
// export const metadata = constructMetadata({
//     title: "Email Logs",
//     description: "Search and inspect transactional email delivery logs.",
//     path: "/dashboard/email/logs",
//     preset: "dashboard",
// });

// export default function Page() {
//     return (
//         <PlaceholderPage
//             title="Logs"
//             description="Full email delivery log."
//             icon={ScrollText}
//         />
//     );
// }
