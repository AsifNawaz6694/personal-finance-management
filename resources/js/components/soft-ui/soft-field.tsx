import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SoftFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: React.ReactNode;
    htmlFor?: string;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
    children: React.ReactNode;
}

/**
 * Uniform field wrapper: label → control → hint/error.
 * Use as: <SoftField label="Name" htmlFor="name" error={errors.name}><Input id="name" .../></SoftField>
 */
export function SoftField({ label, htmlFor, hint, error, required, className, children, ...rest }: SoftFieldProps) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
            {label && (
                <label htmlFor={htmlFor} className="text-foreground text-sm font-medium leading-none">
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </label>
            )}
            {children}
            {error ? (
                <p className="text-destructive text-xs leading-relaxed">{error}</p>
            ) : hint ? (
                <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>
            ) : null}
        </div>
    );
}

export const SoftTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function SoftTextarea(
    { className, ...rest },
    ref,
) {
    return <textarea ref={ref} className={cn('soft-input', className)} {...rest} />;
});
