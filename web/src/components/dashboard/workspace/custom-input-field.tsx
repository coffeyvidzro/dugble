"use client";

import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { FieldStatus } from "./field-status";
import { FormFieldWrapper } from "./form-field-wrapper";
import type { FormValues } from "./create-workspace-schema";

type InputFieldProps = {
    name: keyof FormValues;
    label: string;
    id: string;
    placeholder: string;
    loading: boolean;
    type?: string;
    className?: string;
    description?: string;
    showStatus?: boolean;
};

export const CustomInputField = memo(function CustomInputField({
    name,
    label,
    id,
    placeholder,
    loading,
    type = "text",
    className = "pr-9",
    description,
    showStatus = true,
}: InputFieldProps) {
    const { control } = useFormContext<FormValues>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const isFieldValueValid =
                    !fieldState.invalid &&
                    typeof field.value === "string" &&
                    field.value.trim().length > 0;

                const input = (
                    <Input
                        {...field}
                        id={id}
                        type={type}
                        aria-invalid={fieldState.invalid}
                        placeholder={placeholder}
                        disabled={loading}
                        className={className}
                    />
                );

                return (
                    <FormFieldWrapper
                        id={id}
                        label={label}
                        invalid={fieldState.invalid}
                        error={fieldState.error}
                        description={description}
                    >
                        {showStatus ? (
                            <div className="relative">
                                {input}
                                <FieldStatus visible={isFieldValueValid} />
                            </div>
                        ) : (
                            input
                        )}
                    </FormFieldWrapper>
                );
            }}
        />
    );
});
