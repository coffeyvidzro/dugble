import { AudiencePageShell } from "../shared/audience-page-shell";
import { ContactsHeader } from "./contacts-header";
import { ContactsList } from "./contacts-list";

export function ContactsPage() {
  return (
    <AudiencePageShell header={<ContactsHeader />}>
      <ContactsList />
    </AudiencePageShell>
  );
}
