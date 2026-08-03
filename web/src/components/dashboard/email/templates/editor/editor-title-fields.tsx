"use client";

interface EditorTitleFieldsProps {
    name: string;
    onNameChange: (value: string) => void;
    subject: string;
    onSubjectChange: (value: string) => void;
}

export function EditorTitleFields({
    name,
    onNameChange,
    subject,
    onSubjectChange,
}: EditorTitleFieldsProps) {
    return (
        <div className="min-w-0 flex-1">
            <input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Untitled template"
                aria-label="Template name"
                className="w-full truncate bg-transparent font-heading text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <input
                value={subject}
                onChange={(e) => onSubjectChange(e.target.value)}
                placeholder="Add a subject line..."
                aria-label="Email subject"
                className="w-full truncate bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
        </div>
    );
}
