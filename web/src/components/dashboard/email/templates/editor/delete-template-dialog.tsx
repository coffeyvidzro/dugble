"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function DeleteTemplateDialog({
    templateName,
    open,
    onOpenChange,
    onConfirm,
}: {
    templateName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-border/40 shadow-xl sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete template?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete &quot;{templateName}
                        &quot;. This can&apos;t be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="border-t border-border/40 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        className="inline-flex items-center gap-1.5 rounded-full"
                    >
                        <Trash2 className="size-3.5" />
                        Delete template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
