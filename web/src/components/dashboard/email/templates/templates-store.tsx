"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { TEMPLATES, type EmailTemplate } from "./types";

type TemplatePatch = Partial<Omit<EmailTemplate, "id" | "createdAt">>;
type TemplateInput = Partial<
    Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">
>;

type TemplatesStore = {
    templates: EmailTemplate[];
    getTemplate: (id: string) => EmailTemplate | undefined;
    saveTemplate: (id: string, patch: TemplatePatch) => void;
    createTemplate: (input: TemplateInput) => EmailTemplate;
    duplicateTemplate: (id: string) => EmailTemplate | undefined;
    deleteTemplate: (id: string) => void;
};

const TemplatesContext = createContext<TemplatesStore | null>(null);

function generateId(): string {
    return `tpl_${Math.random().toString(36).slice(2, 10)}`;
}

// In-memory only. It reset on full page reload. I'll swap these functions for
// real API calls (create/update/delete template) when the backend is ready; 👌
export function TemplatesProvider({ children }: { children: ReactNode }) {
    const [templates, setTemplates] = useState<EmailTemplate[]>(TEMPLATES);

    const getTemplate = useCallback(
        (id: string) => templates.find((t) => t.id === id),
        [templates],
    );

    const saveTemplate = useCallback((id: string, patch: TemplatePatch) => {
        setTemplates((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, ...patch, updatedAt: new Date() } : t,
            ),
        );
    }, []);

    const createTemplate = useCallback((input: TemplateInput) => {
        const now = new Date();
        const created: EmailTemplate = {
            id: generateId(),
            name: input.name ?? "Untitled template",
            subject: input.subject ?? "",
            previewText: input.previewText ?? "",
            description: input.description ?? "",
            category: input.category ?? "custom",
            status: input.status ?? "draft",
            htmlBody: input.htmlBody ?? "",
            sentLast30d: 0,
            version: 1,
            createdAt: now,
            updatedAt: now,
        };
        setTemplates((prev) => [created, ...prev]);
        return created;
    }, []);

    const duplicateTemplate = useCallback(
        (id: string) => {
            const source = templates.find((t) => t.id === id);
            if (!source) return undefined;

            const now = new Date();
            const copy: EmailTemplate = {
                ...source,
                id: generateId(),
                name: `${source.name} (Copy)`,
                status: "draft",
                sentLast30d: 0,
                version: 1,
                createdAt: now,
                updatedAt: now,
            };
            setTemplates((prev) => [copy, ...prev]);
            return copy;
        },
        [templates],
    );

    const deleteTemplate = useCallback((id: string) => {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            templates,
            getTemplate,
            saveTemplate,
            createTemplate,
            duplicateTemplate,
            deleteTemplate,
        }),
        [
            templates,
            getTemplate,
            saveTemplate,
            createTemplate,
            duplicateTemplate,
            deleteTemplate,
        ],
    );

    return (
        <TemplatesContext.Provider value={value}>
            {children}
        </TemplatesContext.Provider>
    );
}

export function useTemplatesStore(): TemplatesStore {
    const ctx = useContext(TemplatesContext);
    if (!ctx) {
        throw new Error(
            "useTemplatesStore must be used within TemplatesProvider",
        );
    }
    return ctx;
}
