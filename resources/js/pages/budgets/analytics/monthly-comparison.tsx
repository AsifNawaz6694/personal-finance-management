import { Head, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftPageHeader,
    SoftStatCard,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface CategoryRow {
    category: string;
    amount: number;
    count: number;
}

interface MonthRow {
    month: string;
    month_name: string;
    income: number;
    expenses: number;
    net: number;
    savings_rate: number;
    category_breakdown: CategoryRow[];
}

interface Props {
    monthlyData: MonthRow[];
    months: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Analytics', href: '/budgets/analytics' },
    { title: 'Monthly Comparison', href: '/budgets/analytics/monthly-comparison' },
];

export default function MonthlyComparison({ monthlyData, months }: Props) {
    const setMonths = (m: number) => router.get('/budgets/analytics/monthly-comparison', { months: m }, { preserveState: true, preserveScroll: true });

    const sorted = monthlyData ?? [];
    const current = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    const incomeDelta = current && previous && previous.income > 0 ? ((current.income - previous.income) / previous.income) * 100 : 0;
    const expenseDelta = current && previous && previous.expenses > 0 ? ((current.expenses - previous.expenses) / previous.expenses) * 100 : 0;
    const netDelta = current && previous ? current.net - previous.net : 0;

    const chartData = sorted.map((m) => ({
        label: new Date(`${m.month}-01`).toLocaleString('en', { month: 'short', year: '2-digit' }),
        Income: Number(m.income),
        Expenses: Number(m.expenses),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monthly comparison" />

            <SoftPageHeader
                eyebrow="Comparison"
                eyebrowIcon={Calendar}
                title="Monthly comparison"
                gradientTitle
                description={`How income, expenses, and category spending have changed over the last ${months} months.`}
                actions={
                    <div className="flex flex-wrap gap-1.5">
                        {[3, 6, 12].map((m) => (
                            <SoftButton key={m} size="sm" variant={months === m ? 'primary' : 'soft'} onClick={() => setMonths(m)}>
                                {m} months
                            </SoftButton>
                        ))}
                    </div>
                }
            />

            {sorted.length === 0 ? (
                <SoftCard padding="md">
                    <SoftEmptyState icon={BarChart3} title="Not enough history yet" description="Comparisons appear once you have transactions across multiple months." />
                </SoftCard>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SoftStatCard
                            label="This month income"
                            value={`₨ ${Number(current?.income ?? 0).toLocaleString()}`}
                            icon={ArrowUpRight}
                            iconTone="success"
                            delta={previous ? { value: `${Math.abs(incomeDelta).toFixed(1)}%`, trend: incomeDelta >= 0 ? 'up' : 'down' } : undefined}
                        />
                        <SoftStatCard
                            label="This month expenses"
                            value={`₨ ${Number(current?.expenses ?? 0).toLocaleString()}`}
                            icon={ArrowDownRight}
                            iconTone="warning"
                            delta={previous ? { value: `${Math.abs(expenseDelta).toFixed(1)}%`, trend: expenseDelta >= 0 ? 'up' : 'down' } : undefined}
                        />
                        <SoftStatCard
                            label="Net (savings)"
                            value={`₨ ${Number(current?.net ?? 0).toLocaleString()}`}
                            icon={PiggyBank}
                            iconTone={(current?.net ?? 0) >= 0 ? 'success' : 'danger'}
                            sub={previous ? `Δ ₨ ${netDelta.toLocaleString()}` : undefined}
                        />
                        <SoftStatCard
                            label="Savings rate"
                            value={`${(current?.savings_rate ?? 0).toFixed(1)}%`}
                            icon={current && current.savings_rate >= 0 ? TrendingUp : TrendingDown}
                            iconTone={current && current.savings_rate >= 20 ? 'success' : current && current.savings_rate >= 10 ? 'info' : 'warning'}
                        />
                    </div>

                    <SoftCard padding="md">
                        <SoftCardHeader title="Income vs expenses" subtitle="Side-by-side per month" />
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 8" className="stroke-border/50" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(258 55% 58% / 0.06)', radius: 8 }}
                                        contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', boxShadow: 'var(--shadow-soft)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="Income" fill="hsl(152 62% 42%)" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="Expenses" fill="hsl(38 92% 50%)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader title="Top expense categories per month" subtitle="The five largest categories in each month." />
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {sorted.slice().reverse().map((m) => (
                                <div key={m.month} className="border-border/60 flex flex-col gap-2 rounded-xl border p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{m.month_name}</span>
                                        <SoftBadge tone="neutral">{m.category_breakdown.length} cats</SoftBadge>
                                    </div>
                                    {m.category_breakdown.length === 0 ? (
                                        <span className="text-muted-foreground text-xs">No expenses recorded</span>
                                    ) : (
                                        <ul className="flex flex-col gap-1.5">
                                            {m.category_breakdown.slice(0, 5).map((c, idx) => (
                                                <li key={idx} className="flex items-center justify-between gap-2 text-sm">
                                                    <span className="truncate text-muted-foreground">{c.category}</span>
                                                    <span className="font-semibold tabular-nums">₨ {Number(c.amount).toLocaleString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SoftCard>
                </>
            )}
        </AppLayout>
    );
}
