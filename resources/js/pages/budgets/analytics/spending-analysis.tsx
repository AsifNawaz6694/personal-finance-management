import { Head, router } from '@inertiajs/react';
import { AlertTriangle, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Pattern {
    id: number;
    category_name: string;
    period_start: string;
    period_end: string;
    total_spent: number;
    transaction_count: number;
    trend_percentage: number | null;
    is_anomalous: boolean;
}

interface CategoryTrend {
    category: string;
    patterns: Pattern[];
    current_amount: number;
    trend_percentage: number | null;
    is_anomalous: boolean;
}

interface Props {
    categoryTrends: Record<string, CategoryTrend>;
    periodType: string;
    months: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Analytics', href: '/budgets/analytics' },
    { title: 'Spending Analysis', href: '/budgets/analytics/spending-analysis' },
];

export default function SpendingAnalysis({ categoryTrends, periodType, months }: Props) {
    const trends = Object.values(categoryTrends ?? {});

    const setPeriod = (key: 'period_type' | 'months', value: string) => {
        router.get('/budgets/analytics/spending-analysis', { period_type: key === 'period_type' ? value : periodType, months: key === 'months' ? value : months }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spending analysis" />

            <SoftPageHeader
                eyebrow="Trends"
                eyebrowIcon={BarChart3}
                title="Spending analysis"
                gradientTitle
                description="Per-category trends over time, with anomaly detection."
                actions={
                    <div className="flex flex-wrap gap-1.5">
                        {['monthly', 'weekly', 'yearly'].map((p) => (
                            <SoftButton key={p} size="sm" variant={periodType === p ? 'primary' : 'soft'} onClick={() => setPeriod('period_type', p)} className="capitalize">
                                {p}
                            </SoftButton>
                        ))}
                        {[3, 6, 12].map((m) => (
                            <SoftButton key={m} size="sm" variant={months === m ? 'primary' : 'soft'} onClick={() => setPeriod('months', String(m))}>
                                {m}m
                            </SoftButton>
                        ))}
                    </div>
                }
            />

            {trends.length === 0 ? (
                <SoftCard padding="md">
                    <SoftEmptyState icon={BarChart3} title="No spending patterns yet" description="Patterns appear after you record transactions over multiple periods." />
                </SoftCard>
            ) : (
                <div className="grid gap-6 xl:grid-cols-2">
                    {trends.map((trend) => {
                        const chartData = (trend.patterns ?? []).map((p) => ({
                            label: new Date(p.period_start).toLocaleDateString('en', { month: 'short', day: '2-digit' }),
                            total: Number(p.total_spent),
                            anomalous: p.is_anomalous,
                        }));
                        const direction = trend.trend_percentage ?? 0;
                        return (
                            <SoftCard key={trend.category} padding="md">
                                <SoftCardHeader
                                    title={trend.category}
                                    subtitle={`Latest period: ₨ ${Number(trend.current_amount).toLocaleString()}`}
                                    actions={
                                        <div className="flex items-center gap-2">
                                            {trend.is_anomalous && <SoftBadge tone="danger" icon={AlertTriangle}>Anomalous</SoftBadge>}
                                            {direction !== 0 && (
                                                <SoftBadge tone={direction > 0 ? 'warning' : 'success'} icon={direction > 0 ? TrendingUp : TrendingDown}>
                                                    {Math.abs(direction).toFixed(1)}%
                                                </SoftBadge>
                                            )}
                                        </div>
                                    }
                                />
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="4 8" className="stroke-border/50" vertical={false} />
                                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(258 55% 58% / 0.06)', radius: 8 }}
                                                contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
                                            />
                                            <Bar dataKey="total" radius={[8, 8, 4, 4]} fill="hsl(258 55% 58%)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {trend.is_anomalous && (
                                    <div className="border-destructive/30 bg-destructive/5 mt-3 flex items-start gap-2 rounded-xl border p-3 text-sm">
                                        <SoftIconTile icon={AlertTriangle} tone="danger" size="sm" />
                                        <p>Unusual activity detected in this category — review recent transactions for accuracy.</p>
                                    </div>
                                )}
                            </SoftCard>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
