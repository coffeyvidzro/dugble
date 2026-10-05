"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ShimmerPillButton } from "../shared/shimmer-pill-button";
import { SegmentFormDialog } from "./segment-form-dialog";

export function CreateSegmentButton({
  label = "Create segment",
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
      <SegmentFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
