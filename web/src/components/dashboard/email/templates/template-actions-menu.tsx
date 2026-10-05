// src/components/dashboard/email/templates/template-actions-menu.tsx

"use client";

import {
  Copy,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteTemplate,
  useDuplicateTemplate,
} from "@/hooks/queries/use-templates-api";
import type { TemplateListItem } from "@/types/template-api";
import { DeleteTemplateDialog } from "./editor/delete-template-dialog";

// Rendered once per row — load the sheet (and its preview query) only when opened.
const TemplatePreviewSheet = dynamic(
  () =>
    import("./editor/template-preview-sheet").then(
      (mod) => mod.TemplatePreviewSheet,
    ),
  { ssr: false },
);

type ActiveDialog = "preview" | "delete" | null;

export function TemplateActionsMenu({
  template,
}: {
  template: TemplateListItem;
}) {
  const duplicateTemplate = useDuplicateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  function handleConfirmDelete() {
    deleteTemplate.mutate(template.id, {
      onSuccess: () => setActiveDialog(null),
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          aria-label={`Actions for ${template.name}`}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem>
            <Link
              href={`/dashboard/email/templates/${template.id}`}
              className="flex items-center gap-2"
            >
              <Pencil className="size-3.5" />
              Edit template
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setActiveDialog("preview")}
            className="flex items-center gap-2"
          >
            <Eye className="size-3.5" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => duplicateTemplate.mutate(template.id)}
            disabled={duplicateTemplate.isPending}
            className="flex items-center gap-2"
          >
            {duplicateTemplate.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setActiveDialog("delete")}
            className="flex items-center gap-2 text-danger focus:text-danger"
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeDialog === "preview" && (
        <TemplatePreviewSheet
          templateId={template.id}
          templateName={template.name}
          open
          onOpenChange={(open) => setActiveDialog(open ? "preview" : null)}
        />
      )}
      <DeleteTemplateDialog
        templateName={template.name}
        open={activeDialog === "delete"}
        onOpenChange={(open) => setActiveDialog(open ? "delete" : null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteTemplate.isPending}
      />
    </>
  );
}
