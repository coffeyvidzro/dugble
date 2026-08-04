"use client";

import { Braces, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    COMMON_VARIABLES,
    CATEGORY_VARIABLES,
    type TemplateVariable,
} from "../template-content";
import { CATEGORY_CONFIG, type TemplateCategory } from "../types";

export function VariableInsertMenu({
    category,
    onInsert,
}: {
    category: TemplateCategory;
    onInsert: (variable: TemplateVariable) => void;
}) {
    const categoryVariables = CATEGORY_VARIABLES[category];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40">
                <Braces className="size-3.5" />
                Insert variable
                <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {CATEGORY_CONFIG[category].label} variables
                    </DropdownMenuLabel>
                    {categoryVariables.map((variable) => (
                        <DropdownMenuItem
                            key={variable.key}
                            onClick={() => onInsert(variable)}
                            className="flex flex-col items-start gap-0.5"
                        >
                            <span className="font-mono text-xs font-medium text-foreground">
                                {`{{${variable.key}}}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {variable.description}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Common variables
                    </DropdownMenuLabel>
                    {COMMON_VARIABLES.map((variable) => (
                        <DropdownMenuItem
                            key={variable.key}
                            onClick={() => onInsert(variable)}
                            className="flex flex-col items-start gap-0.5"
                        >
                            <span className="font-mono text-xs font-medium text-foreground">
                                {`{{${variable.key}}}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {variable.description}
                            </span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
