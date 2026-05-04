import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SoftCard } from './soft-card';
import { SoftIconTile, type SoftIconTone } from './soft-icon-tile';

type Trend = 'up' | 'down' | 'flat';

export interface SoftStatCardProps {
    label: string;
    value: React.ReactNode;
    icon?: LucideIcon;
    iconTone?: SoftIconTone;
    sub?: React.ReactNode;
    delta?: { value: string; trend: Trend };
    loading?: boolean;
    className?: string;
}

const deltaColor: Record<Trend, string> = {
    up: 'text-success',
    down: 'text-destructive',
    flat: 'text-muted-foreground',
};

const deltaSign: Record<Trend, string> = {
    up: '+',
    down: '-',
    flat: '~',
};

export function SoftStatCard({ label, value, icon, iconTone = 'primary', sub, delta, loading, className }: SoftStatCardProps) {
    return (
        <SoftCard className={cn('relative overflow-hidden', className)} padding="md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground truncate text-xs font-semibold uppercase tracking-wide">{label}</p>
                    {loading ? (
                        <div className="bg-muted mt-3 h-8 w-24 animate-pulse rounded-lg" />
                    ) : (
                        <div className="mt-2 flex items-baseline gap-2">
                            <p className="truncate text-2xl font-bold tabular-nums leading-tight sm:text-[1.75rem]">{value}</p>
                            {delta && (
                                <span className={cn('text-xs font-bold tabular-nums', deltaColor[delta.trend])}>
                                    {deltaSign[delta.trend]}
                                    {delta.value}
                                </span>
                            )}
                        </div>
                    )}
                    {sub && <div className="text-muted-foreground mt-1 text-xs">{sub}</div>}
                </div>
                {icon && <SoftIconTile icon={icon} tone={iconTone} size="md" className="shrink-0" />}
            </div>
        </SoftCard>
    );
}
