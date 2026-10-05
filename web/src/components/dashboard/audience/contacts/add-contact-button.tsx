"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ShimmerPillButton } from "../shared/shimmer-pill-button";
import { ContactFormDialog } from "./contact-form-dialog";

export function AddContactButton({
  label = "Add contact",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ShimmerPillButton onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {label}
      </ShimmerPillButton>
      <ContactFormDialog open={open} onOpenChange={setOpen} contact={null} />
    </>
  );
}
