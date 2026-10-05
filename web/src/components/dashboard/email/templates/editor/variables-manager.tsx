// src/components/dashboard/email/templates/editor/variables-manager.tsx

"use client";

import { Braces, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateVariableType } from "@/types/template-api";
import type { EditorVariable } from "./editor-types";

export function VariablesManager({
  variables,
  onChange,
}: {
  variables: EditorVariable[];
  onChange: (variables: EditorVariable[]) => void;
}) {
  function updateVariable(id: string, patch: Partial<EditorVariable>) {
    onChange(variables.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function removeVariable(id: string) {
    onChange(variables.filter((v) => v.id !== id));
  }

  function addVariable() {
    onChange([
      ...variables,
      { id: crypto.randomUUID(), key: "", type: "string", fallbackValue: "" },
    ]);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/40 bg-muted/10 p-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Braces className="size-3.5" />
          Variables
        </p>
        <button
          type="button"
          onClick={addVariable}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary"
        >
          <Plus className="size-3.5" />
          Add
        </button>
      </div>

      {variables.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No variables yet. Reference them in your HTML as{" "}
          <code className="rounded bg-muted/60 px-1 py-0.5 font-mono">
            {"{{key}}"}
          </code>
          .
        </p>
      ) : (
        <div className="space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className="flex flex-wrap items-center gap-2"
            >
              <Input
                value={variable.key}
                onChange={(e) =>
                  updateVariable(variable.id, {
                    key: e.target.value,
                  })
                }
                placeholder="variable_key"
                className="h-8 w-36 font-mono text-xs"
              />
              <Select
                value={variable.type}
                onValueChange={(value) =>
                  value &&
                  updateVariable(variable.id, {
                    type: value as TemplateVariableType,
                  })
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={variable.fallbackValue}
                onChange={(e) =>
                  updateVariable(variable.id, {
                    fallbackValue: e.target.value,
                  })
                }
                placeholder="Fallback value"
                className="h-8 flex-1 text-xs"
              />
              <button
                type="button"
                onClick={() => removeVariable(variable.id)}
                aria-label="Remove variable"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
