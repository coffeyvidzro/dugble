import { LegalPageShell } from "../shared/legal-page-shell";
import { meta, sections } from "./terms-data";

export function TermsOfServicePage() {
    return <LegalPageShell meta={meta} sections={sections} />;
}
