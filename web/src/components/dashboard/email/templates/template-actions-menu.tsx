"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTemplatesStore } from "./templates-store";
import { TemplatePreviewSheet } from "./editor/template-preview-sheet";
import { DeleteTemplateDialog } from "./editor/delete-template-dialog";
import type { EmailTemplate } from "./types";

type ActiveDialog = "preview" | "delete" | null;

export function TemplateActionsMenu({ template }: { template: EmailTemplate }) {
    const router = useRouter();
    const { duplicateTemplate, deleteTemplate } = useTemplatesStore();
    const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

    function handleDuplicate() {
        const copy = duplicateTemplate(template.id);
        if (copy) {
            router.push(`/dashboard/email/templates/${copy.id}`);
        }
    }

    function handleConfirmDelete() {
        deleteTemplate(template.id);
        setActiveDialog(null);
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
                        onClick={handleDuplicate}
                        className="flex items-center gap-2"
                    >
                        <Copy className="size-3.5" />
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

            <TemplatePreviewSheet
                template={template}
                open={activeDialog === "preview"}
                onOpenChange={(open) =>
                    setActiveDialog(open ? "preview" : null)
                }
            />
            <DeleteTemplateDialog
                templateName={template.name}
                open={activeDialog === "delete"}
                onOpenChange={(open) => setActiveDialog(open ? "delete" : null)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
