"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ShimmerPillButton } from "../shared/shimmer-pill-button";
import { AddSuppressionDialog } from "./add-suppression-dialog";

export function AddSuppressionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ShimmerPillButton onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add suppression
      </ShimmerPillButton>
      <AddSuppressionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
