import * as React from 'react';
import { cn } from '@/lib/utils';

export type SoftProgressTone = 'primary' | 'success' | 'warning' | 'info' | 'danger';

const fillClass: Record<SoftProgressTone, string> = {
    primary: 'soft-gradient-bar',
    success: 'soft-gradient-success',
    warning: 'soft-gradient-warning',
    info: 'soft-gradient-info',
    danger: 'soft-gradient-danger',
};

export interface SoftProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    tone?: SoftProgressTone;
    /** Auto-pick warning/danger past these utilization thresholds (0–100). */
    autoTone?: { warning?: number; danger?: number };
    showLabel?: boolean;
    label?: React.ReactNode;
    sub?: React.ReactNode;
    size?: 'sm' | 'md';
}

export function SoftProgress({
    value,
    max = 100,
    tone,
    autoTone,
    showLabel,
    label,
    sub,
    size = 'md',
    className,
    ...rest
}: SoftProgressProps) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    const resolved: SoftProgressTone =
        tone ??
        (autoTone?.danger !== undefined && pct >= autoTone.danger
            ? 'danger'
            : autoTone?.warning !== undefined && pct >= autoTone.warning
              ? 'warning'
              : 'primary');

    return (
        <div className={cn('flex flex-col gap-1.5', className)} {...rest}>
            {(label || showLabel) && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground tabular-nums">{Math.round(pct)}%</span>
                </div>
            )}
            <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                className={cn(
                    'soft-card-inset relative w-full overflow-hidden',
                    size === 'sm' ? 'h-1.5' : 'h-2.5',
                )}
            >
                <div
                    className={cn('absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out', fillClass[resolved])}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
        </div>
    );
}
