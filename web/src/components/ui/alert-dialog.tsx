"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AlertDialog({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
    return (
        <AlertDialogPrimitive.Trigger
            data-slot="alert-dialog-trigger"
            {...props}
        />
    );
}

function AlertDialogPortal({
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
    return (
        <AlertDialogPrimitive.Portal
            data-slot="alert-dialog-portal"
            {...props}
        />
    );
}

function AlertDialogBackdrop({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
    return (
        <AlertDialogPrimitive.Backdrop
            data-slot="alert-dialog-backdrop"
            className={cn(
                "fixed inset-0 z-50 bg-black/50",
                "transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogContent({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
    return (
        <AlertDialogPortal>
            <AlertDialogBackdrop />
            <AlertDialogPrimitive.Popup
                data-slot="alert-dialog-content"
                className={cn(
                    "fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-background p-6 shadow-lg outline-none sm:max-w-lg",
                    "transition-[transform,opacity] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
                    className,
                )}
                {...props}
            />
        </AlertDialogPortal>
    );
}

function AlertDialogHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-dialog-header"
            className={cn(
                "flex flex-col gap-1.5 text-center sm:text-left",
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogFooter({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="alert-dialog-footer"
            className={cn(
                "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
                className,
            )}
            {...props}
        />
    );
}

function AlertDialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
    return (
        <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            className={cn("font-heading text-lg font-semibold", className)}
            {...props}
        />
    );
}

function AlertDialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
    return (
        <AlertDialogPrimitive.Description
            data-slot="alert-dialog-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

/** Confirms the destructive/primary action. Closes on click, same as Cancel — run your handler in onClick before it does. */
function AlertDialogAction({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
    return (
        <AlertDialogPrimitive.Close
            data-slot="alert-dialog-action"
            className={cn(buttonVariants(), className)}
            {...props}
        />
    );
}

function AlertDialogCancel({
    className,
    ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
    return (
        <AlertDialogPrimitive.Close
            data-slot="alert-dialog-cancel"
            className={cn(buttonVariants({ variant: "outline" }), className)}
            {...props}
        />
    );
}

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
