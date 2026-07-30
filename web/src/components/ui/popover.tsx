import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

function Popover({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
    className,
    side = "bottom",
    align = "center",
    sideOffset = 8,
    alignOffset = 0,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
    Pick<
        React.ComponentProps<typeof PopoverPrimitive.Positioner>,
        "side" | "align" | "sideOffset" | "alignOffset"
    >) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner
                data-slot="popover-positioner"
                side={side}
                align={align}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                className="z-50 outline-none"
            >
                <PopoverPrimitive.Popup
                    data-slot="popover-content"
                    className={cn(
                        "w-72 origin-(--transform-origin) rounded-xl border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                        "transition-[transform,opacity] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
                        className,
                    )}
                    {...props}
                />
            </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
    );
}

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
