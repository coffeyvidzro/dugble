import { LegalPageShell } from "../shared/legal-page-shell";
import { meta, sections } from "./privacy-data";

export function PrivacyPolicyPage() {
    return <LegalPageShell meta={meta} sections={sections} />;
}
