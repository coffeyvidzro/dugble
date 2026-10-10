"use client";

import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/dashboard/shared/data-states";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTemplatePreview } from "@/hooks/queries/use-templates-api";
import { InboxPreviewStrip } from "./inbox-preview-strip";

export function TemplatePreviewSheet({
  templateId,
  templateName,
  open,
  onOpenChange,
}: {
  templateId: string;
  templateName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const preview = useTemplatePreview(templateId, { enabled: open });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{templateName}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6 sm:px-6">
          {preview.isPending ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Rendering preview…
            </div>
          ) : preview.isError ? (
            <ErrorState title="Couldn't render a preview for this template" />
          ) : preview.data ? (
            <>
              <div className="overflow-hidden rounded-lg border border-border/40">
                <InboxPreviewStrip
                  subject={preview.data.subject ?? ""}
                  previewText=""
                />
              </div>

              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Preview
                </p>
                <div className="overflow-hidden rounded-lg border border-border/40 bg-muted/20 p-4">
                  <iframe
                    title={`Preview of ${templateName}`}
                    srcDoc={preview.data.html}
                    sandbox=""
                    className="h-120 w-full rounded-lg border border-border/40 bg-white shadow-sm"
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
