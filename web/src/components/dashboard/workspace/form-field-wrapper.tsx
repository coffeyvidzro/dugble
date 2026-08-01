import type { ReactNode } from "react";
import type { FieldError as RHFFieldError } from "react-hook-form";

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";

type FormFieldWrapperProps = {
    id: string;
    label: string;
    invalid: boolean;
    error?: RHFFieldError;
    description?: string;
    children: ReactNode;
};

export function FormFieldWrapper({
    id,
    label,
    invalid,
    error,
    description,
    children,
}: FormFieldWrapperProps) {
    return (
        <Field data-invalid={invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            {children}
            {invalid ? (
                <FieldError errors={[error]} />
            ) : (
                description && (
                    <FieldDescription>{description}</FieldDescription>
                )
            )}
        </Field>
    );
}
