import { TermsOfServicePage } from "@/components/marketing/legal/terms/terms-of-service-page";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Terms of Service",
    description:
        "API and dashboard terms for using Dugble's A2P messaging infrastructure.",
    path: "/legal/terms",
    preset: "legal",
});

export default function Page() {
    return <TermsOfServicePage />;
}
