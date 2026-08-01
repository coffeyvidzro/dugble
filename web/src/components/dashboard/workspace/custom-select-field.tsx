"use client";

import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormFieldWrapper } from "./form-field-wrapper";
import type { FormValues } from "./create-workspace-schema";

type SelectFieldProps = {
    name: keyof FormValues;
    label: string;
    id: string;
    placeholder: string;
    loading: boolean;
    options: readonly string[] | string[];
    description?: string;
};

export const CustomSelectField = memo(function CustomSelectField({
    name,
    label,
    id,
    placeholder,
    loading,
    options,
    description,
}: SelectFieldProps) {
    const { control } = useFormContext<FormValues>();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormFieldWrapper
                    id={id}
                    label={label}
                    invalid={fieldState.invalid}
                    error={fieldState.error}
                    description={description}
                >
                    <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={loading}
                    >
                        <SelectTrigger
                            id={id}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-y-auto">
                            {options.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormFieldWrapper>
            )}
        />
    );
});
