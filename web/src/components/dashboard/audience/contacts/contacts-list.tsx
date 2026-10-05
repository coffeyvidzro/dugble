"use client";

import { Layers, Loader2, Pencil, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate } from "@/components/dashboard/sms/sms-dashboard/types";
import { Card } from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContacts, useDeleteContact } from "@/hooks/queries/use-contacts";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { getSmsConsentBadge } from "@/lib/contact-status";
import { cn } from "@/lib/utils";
import { type Contact, computeContactName } from "@/types/contact";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { EmptyState } from "../shared/empty-state";
import { ListCardHeader } from "../shared/list-card-header";
import { ListErrorState, ListLoadingState } from "../shared/list-status";
import { RowActionsMenu } from "../shared/row-actions-menu";
import { AddContactButton } from "./add-contact-button";
import { ContactFormDialog } from "./contact-form-dialog";
import { ContactSegmentsDialog } from "./contact-segments-dialog";

export function ContactsList() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContacts();
  const deleteMutation = useDeleteContact();

  const [search, setSearch] = useState("");
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [segmentsContact, setSegmentsContact] = useState<Contact | null>(null);

  const {
    pendingItem: deletingContact,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useDeleteConfirmation<Contact>((contact) =>
    deleteMutation.mutateAsync(contact.id),
  );

  const contacts = useMemo(() => data?.pages.flat() ?? [], [data]);

  // GET /contacts doesn't take a search query, so this filters whatever
  // pages have already been loaded — good enough for the common "find one

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((contact) => {
      const name = computeContactName(contact).toLowerCase();
      return (
        contact.email.toLowerCase().includes(query) ||
        name.includes(query) ||
        (contact.phone ?? "").toLowerCase().includes(query)
      );
    });
  }, [contacts, search]);

  if (isLoading) {
    return <ListLoadingState label="Loading contacts…" />;
  }

  if (isError) {
    return <ListErrorState label="Failed to load contacts. Try refreshing." />;
  }

  return (
    <>
      <Card className="border-border/40 shadow-sm">
        <ListCardHeader
          title="All contacts"
          description={`${contacts.length} contact${
            contacts.length === 1 ? "" : "s"
          } loaded${hasNextPage ? " (more available)" : ""}.`}
          action={contacts.length > 0 && <AddContactButton />}
        />

        {contacts.length > 0 && (
          <div className="border-b border-border/40 bg-muted/10 px-6 py-3">
            <div className="relative max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter loaded contacts…"
                className="pl-8"
              />
            </div>
          </div>
        )}

        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add your first contact, or import them via the API, to start building segments and sending campaigns."
            action={<AddContactButton label="Add first contact" />}
          />
        ) : filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            No contacts match &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>SMS consent</TableHead>
                  <TableHead>Email status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-12 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => {
                  const consent = getSmsConsentBadge(
                    contact.sms_consent_status,
                  );
                  return (
                    <TableRow
                      key={contact.id}
                      className="border-b border-border/40 last:border-0"
                    >
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {computeContactName(contact)}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {contact.email}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {contact.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-sm",
                            consent.textClassName,
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              consent.dotClassName,
                            )}
                          />
                          {consent.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {contact.unsubscribed ? (
                          <span className="text-muted-foreground">
                            Unsubscribed
                          </span>
                        ) : (
                          <span className="text-signal">Subscribed</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(new Date(contact.created_at))}
                      </TableCell>
                      <TableCell className="text-right">
                        <RowActionsMenu>
                          <DropdownMenuItem
                            onClick={() => setEditingContact(contact)}
                          >
                            <Pencil className="mr-2 size-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setSegmentsContact(contact)}
                          >
                            <Layers className="mr-2 size-3.5" />
                            Manage segments
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger focus:text-danger"
                            onClick={() => requestDelete(contact)}
                          >
                            <Trash2 className="mr-2 size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </RowActionsMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center border-t border-border/40 py-4">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isFetchingNextPage && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Load more
            </button>
          </div>
        )}
      </Card>

      <ContactFormDialog
        open={Boolean(editingContact)}
        onOpenChange={(open) => !open && setEditingContact(null)}
        contact={editingContact}
      />

      <ContactSegmentsDialog
        contact={segmentsContact}
        onOpenChange={(open) => !open && setSegmentsContact(null)}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingContact)}
        onOpenChange={(open) => !open && cancelDelete()}
        title="Delete contact?"
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-mono font-medium text-foreground">
              {deletingContact?.email}
            </span>
            ? This action cannot be undone.
          </>
        }
        confirmLabel="Delete contact"
        isPending={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
