import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SoftSectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
}

export function SoftSectionHeader({
    title,
    subtitle,
    actions,
    className,
    ...rest
}: SoftSectionHeaderProps) {
    return (
        <div
            className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}
            {...rest}
        >
            <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight sm:text-lg">{title}</h2>
                {subtitle && <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">{subtitle}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
