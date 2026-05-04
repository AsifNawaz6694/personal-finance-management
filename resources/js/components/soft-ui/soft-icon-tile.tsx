import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SoftIconTone = 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'muted';
export type SoftIconSize = 'sm' | 'md' | 'lg';

const toneClass: Record<SoftIconTone, string> = {
    primary: 'soft-icon-tile',
    success: 'soft-icon-tile soft-icon-tile--success',
    warning: 'soft-icon-tile soft-icon-tile--warning',
    info: 'soft-icon-tile soft-icon-tile--info',
    danger: 'soft-icon-tile soft-icon-tile--danger',
    muted: 'soft-icon-tile soft-icon-tile--muted',
};

const sizeClass: Record<SoftIconSize, string> = {
    sm: 'size-9 [&>svg]:size-4',
    md: 'size-11 [&>svg]:size-5',
    lg: 'size-14 [&>svg]:size-6',
};

export interface SoftIconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
    icon: LucideIcon;
    tone?: SoftIconTone;
    size?: SoftIconSize;
    strokeWidth?: number;
}

export function SoftIconTile({
    icon: Icon,
    tone = 'primary',
    size = 'md',
    strokeWidth = 1.75,
    className,
    ...rest
}: SoftIconTileProps) {
    return (
        <span className={cn(toneClass[tone], sizeClass[size], className)} {...rest}>
            <Icon strokeWidth={strokeWidth} aria-hidden />
        </span>
    );
}
