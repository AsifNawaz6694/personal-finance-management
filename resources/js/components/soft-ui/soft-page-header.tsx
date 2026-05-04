import * as React from 'react';
import { type LucideIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SoftPageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    eyebrow?: React.ReactNode;
    eyebrowIcon?: LucideIcon;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    /** When true, title uses the primary→cyan gradient text. */
    gradientTitle?: boolean;
}

export function SoftPageHeader({
    eyebrow,
    eyebrowIcon: EyebrowIcon = Sparkles,
    title,
    description,
    actions,
    gradientTitle,
    className,
    ...rest
}: SoftPageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className,
            )}
            {...rest}
        >
            <div className="min-w-0">
                {eyebrow && (
                    <span className="text-muted-foreground mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                        <EyebrowIcon className="size-3.5 text-primary" strokeWidth={2.25} aria-hidden />
                        {eyebrow}
                    </span>
                )}
                <h1
                    className={cn(
                        'text-2xl font-bold tracking-tight sm:text-[1.75rem]',
                        gradientTitle && 'soft-grad-text',
                    )}
                >
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">{description}</p>
                )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
