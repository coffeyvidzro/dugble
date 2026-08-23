// src/components/dashboard/webhooks/confirm-dialog.tsx

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    confirmPending = false,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description: React.ReactNode;
    confirmLabel: string;
    confirmPending?: boolean;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirmPending}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-danger text-white hover:bg-danger/90"
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        disabled={confirmPending}
                    >
                        {confirmPending ? "Deleting…" : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
