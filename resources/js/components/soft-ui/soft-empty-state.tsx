import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SoftIconTile, type SoftIconTone } from './soft-icon-tile';

export interface SoftEmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    icon?: LucideIcon;
    iconTone?: SoftIconTone;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
}

export function SoftEmptyState({
    icon,
    iconTone = 'muted',
    title,
    description,
    action,
    className,
    ...rest
}: SoftEmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-xl px-6 py-12 text-center',
                className,
            )}
            {...rest}
        >
            {icon && <SoftIconTile icon={icon} tone={iconTone} size="lg" className="mb-1" />}
            <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
            {description && (
                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
