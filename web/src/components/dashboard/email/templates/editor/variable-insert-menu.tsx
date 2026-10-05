// src/components/dashboard/email/templates/editor/variable-insert-menu.tsx

"use client";

import { Braces, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EditorVariable } from "./editor-types";

export function VariableInsertMenu({
  variables,
  onInsert,
}: {
  variables: EditorVariable[];
  onInsert: (key: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={variables.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/40 disabled:pointer-events-none disabled:opacity-50"
      >
        <Braces className="size-3.5" />
        Insert variable
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {variables
          .filter((v) => v.key.trim().length > 0)
          .map((variable) => (
            <DropdownMenuItem
              key={variable.key}
              onClick={() => onInsert(variable.key)}
            >
              <span className="font-mono text-xs font-medium text-foreground">
                {`{{${variable.key}}}`}
              </span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
