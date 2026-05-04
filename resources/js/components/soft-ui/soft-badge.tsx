import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SoftBadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'info' | 'danger';

const toneClass: Record<SoftBadgeTone, string> = {
    primary: 'soft-pill',
    neutral: 'soft-pill soft-pill--neutral',
    success: 'soft-pill soft-pill--success',
    warning: 'soft-pill soft-pill--warning',
    info: 'soft-pill soft-pill--info',
    danger: 'soft-pill soft-pill--danger',
};

export interface SoftBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: SoftBadgeTone;
    icon?: LucideIcon;
    dot?: boolean;
}

export function SoftBadge({ tone = 'neutral', icon: Icon, dot, className, children, ...rest }: SoftBadgeProps) {
    return (
        <span className={cn(toneClass[tone], className)} {...rest}>
            {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
            {Icon && <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />}
            {children}
        </span>
    );
}
