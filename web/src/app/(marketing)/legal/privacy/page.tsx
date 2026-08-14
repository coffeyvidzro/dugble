import { PrivacyPolicyPage } from "@/components/marketing/legal/privacy/privacy-policy-page";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Privacy Policy",
    description:
        "Learn how Dugble handles account, workspace, recipient, message, and webhook data.",
    path: "/legal/privacy",
    preset: "legal",
});

export default function Page() {
    return <PrivacyPolicyPage />;
}
