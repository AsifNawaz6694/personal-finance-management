import { Head, Link } from '@inertiajs/react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
    SoftProgress,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowDownRight,
    ArrowUpRight,
    BadgeDollarSign,
    DollarSign,
    PiggyBank,
    Plus,
    Sparkles,
    Target,
    TrendingDown,
    TrendingUp,
    Wallet,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Dashboard', href: '/budgets/dashboard' },
];

interface Budget {
    id: number;
    name: string;
    type: string;
    currency: string;
    target_amount: number;
    total_income: number;
    total_expenses: number;
    budget_utilization: number;
    formatted_target_amount?: string;
    formatted_total_income?: string;
    formatted_total_expenses?: string;
    formatted_remaining_balance?: string;
    budget_period: string;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: string;
    transaction_date: string;
    formatted_amount: string;
    budget: { name: string; currency: string };
    category?: { name: string };
}

interface MonthRow {
    label: string;
    month: string;
    income: number;
    expenses: number;
    net: number;
}

interface CategoryRow {
    name: string;
    value: number;
    count: number;
}

interface Props {
    currentBudgets: Budget[];
    statistics: {
        totalTargetAmount: number;
        totalIncome: number;
        totalExpenses: number;
        totalRemaining: number;
        budgetCount: number;
        savingsRate: number;
    };
    monthlyTrend: MonthRow[];
    categoryBreakdown: CategoryRow[];
    recentTransactions: Transaction[];
    currentPeriod: { year: number; month: number; monthName: string };
}

const PIE_COLORS = ['#cb0c9f', '#7928ca', '#21d4fd', '#2152ff', '#82d616', '#fbcf33'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 26 } },
};

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const mv = useMotionValue(0);
    const rounded = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
    useEffect(() => {
        const controls = animate(mv, value, { duration: 1.2, ease: 'easeOut' });
        return controls.stop;
    }, [mv, value]);
    return <motion.span>{rounded}</motion.span>;
}

interface KpiTileProps {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    icon: LucideIcon;
    tone: 'primary' | 'success' | 'warning' | 'info' | 'danger';
    delta?: { value: string; trend: 'up' | 'down' | 'flat' };
    sub?: React.ReactNode;
}

function KpiTile({ label, value, prefix = '', suffix = '', icon: Icon, tone, delta, sub }: KpiTileProps) {
    const trendClass = delta?.trend === 'up' ? 'text-success' : delta?.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
    const trendSign = delta?.trend === 'up' ? '+' : delta?.trend === 'down' ? '-' : '';
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
            className="soft-card relative p-5 sm:p-6"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.12em]">{label}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <p className="truncate text-2xl font-bold tabular-nums leading-tight sm:text-[1.75rem]">
                            <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
                        </p>
                        {delta && (
                            <span className={`text-xs font-bold tabular-nums ${trendClass}`}>
                                {trendSign}
                                {delta.value}
                            </span>
                        )}
                    </div>
                    {sub && <div className="text-muted-foreground mt-1 text-xs">{sub}</div>}
                </div>
                <SoftIconTile icon={Icon} tone={tone} size="md" className="size-12 shrink-0 [&>svg]:size-5" />
            </div>
        </motion.div>
    );
}

const tooltipStyle = {
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--card)',
    boxShadow: 'var(--shadow-soft)',
    fontSize: 12,
    padding: '8px 12px',
};

export default function BudgetDashboard({ currentBudgets, statistics, monthlyTrend, categoryBreakdown, recentTransactions, currentPeriod }: Props) {
    const remainingTone = statistics.totalRemaining >= 0 ? 'success' : 'danger';
    const savingsRate = statistics.savingsRate;
    const utilization = statistics.totalTargetAmount > 0 ? (statistics.totalExpenses / statistics.totalTargetAmount) * 100 : 0;
    const hasTrend = monthlyTrend.some((m) => m.income > 0 || m.expenses > 0);
    const lastMonth = monthlyTrend.at(-2);
    const thisMonth = monthlyTrend.at(-1);
    const incomeDelta = lastMonth && lastMonth.income > 0 && thisMonth ? ((thisMonth.income - lastMonth.income) / lastMonth.income) * 100 : 0;
    const expenseDelta = lastMonth && lastMonth.expenses > 0 && thisMonth ? ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budget Dashboard" />

            {/* HERO BANNER */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_10px_28px_-6px_rgba(20,20,50,0.18)] sm:p-8"
                style={{ background: 'var(--grad-primary)' }}
            >
                <div className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-12 size-72 rounded-full bg-white/10 blur-3xl" />
                <div className="relative grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
                    <div>
                        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                            <Sparkles className="size-3.5" /> {currentPeriod.monthName} {currentPeriod.year}
                        </span>
                        <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-[2rem]">Welcome back to your money story.</h1>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                            You've earned <strong className="font-bold">₨ {Number(statistics.totalIncome).toLocaleString()}</strong> and spent <strong className="font-bold">₨ {Number(statistics.totalExpenses).toLocaleString()}</strong> this month — that's a <strong className="font-bold">{savingsRate.toFixed(1)}%</strong> savings rate across <strong className="font-bold">{statistics.budgetCount}</strong> active budget{statistics.budgetCount === 1 ? '' : 's'}.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <Link href="/budgets/create" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary shadow-lg transition hover:-translate-y-0.5">
                                <Plus className="size-4" /> New budget
                            </Link>
                            <Link href="/budgets/analytics/predictions" className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20">
                                <Target className="size-4" /> See predictions
                            </Link>
                        </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-3xl bg-white/15 blur-2xl" />
                            <div className="relative flex size-44 flex-col items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md sm:size-52">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Net balance</span>
                                <span className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
                                    <AnimatedNumber value={statistics.totalRemaining} prefix="₨ " />
                                </span>
                                <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold ${statistics.totalRemaining >= 0 ? 'text-white' : 'text-rose-100'}`}>
                                    {statistics.totalRemaining >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                                    {savingsRate.toFixed(1)}% saved
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* KPI ROW */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiTile
                    label="Today's earnings"
                    value={statistics.totalIncome}
                    prefix="₨ "
                    icon={BadgeDollarSign}
                    tone="success"
                    delta={lastMonth ? { value: `${Math.abs(incomeDelta).toFixed(1)}%`, trend: incomeDelta >= 0 ? 'up' : 'down' } : undefined}
                    sub="vs. last month"
                />
                <KpiTile
                    label="Today's spending"
                    value={statistics.totalExpenses}
                    prefix="₨ "
                    icon={Wallet}
                    tone="warning"
                    delta={lastMonth ? { value: `${Math.abs(expenseDelta).toFixed(1)}%`, trend: expenseDelta >= 0 ? 'down' : 'up' } : undefined}
                    sub="vs. last month"
                />
                <KpiTile
                    label="Active budgets"
                    value={statistics.budgetCount}
                    icon={PiggyBank}
                    tone="primary"
                    sub={`Target ₨ ${Number(statistics.totalTargetAmount).toLocaleString()}`}
                />
                <KpiTile
                    label="Net balance"
                    value={statistics.totalRemaining}
                    prefix="₨ "
                    icon={DollarSign}
                    tone={remainingTone}
                    sub={`Savings rate ${savingsRate.toFixed(1)}%`}
                />
            </motion.div>

            {/* INCOME-VS-EXPENSE BIG CHART + DONUT */}
            <div className="grid gap-5 xl:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="soft-card xl:col-span-2 p-5 sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.12em]">Sales overview</p>
                            <h2 className="mt-1 text-lg font-bold sm:text-xl">Income vs expenses</h2>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                <span className="text-success font-bold">{savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(1)}%</span> savings rate this month
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <SoftBadge tone="success" dot>Income</SoftBadge>
                            <SoftBadge tone="warning" dot>Expenses</SoftBadge>
                        </div>
                    </div>
                    {hasTrend ? (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#82d616" stopOpacity={0.5} />
                                            <stop offset="100%" stopColor="#82d616" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fb6340" stopOpacity={0.45} />
                                            <stop offset="100%" stopColor="#fb6340" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `₨ ${v.toLocaleString()}`} cursor={{ stroke: 'hsl(258 75% 56% / 0.3)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    <Area type="monotone" dataKey="income" name="Income" stroke="#82d616" strokeWidth={3} fill="url(#incomeArea)" animationDuration={1400} />
                                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#fb6340" strokeWidth={3} fill="url(#expenseArea)" animationDuration={1400} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <SoftEmptyState icon={TrendingUp} title="No trend data yet" description="Trends appear after you log a few transactions across months." />
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }} className="soft-card flex flex-col p-5 sm:p-6">
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.12em]">Where it goes</p>
                    <h2 className="mt-1 text-lg font-bold sm:text-xl">Top categories</h2>
                    <p className="text-muted-foreground mt-0.5 text-xs">{currentPeriod.monthName} expenses</p>
                    {categoryBreakdown.length === 0 ? (
                        <SoftEmptyState icon={DollarSign} title="No expenses yet" description="Categories appear as you record transactions." />
                    ) : (
                        <>
                            <div className="relative my-4 h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryBreakdown}
                                            innerRadius={48}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            stroke="var(--card)"
                                            strokeWidth={3}
                                            animationDuration={1300}
                                        >
                                            {categoryBreakdown.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `₨ ${v.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.12em]">Total</span>
                                    <span className="text-base font-bold tabular-nums">₨ {Number(statistics.totalExpenses).toLocaleString()}</span>
                                </div>
                            </div>
                            <ul className="flex flex-col gap-2 text-sm">
                                {categoryBreakdown.map((c, i) => (
                                    <li key={c.name} className="flex items-center justify-between gap-2">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="truncate">{c.name}</span>
                                        </span>
                                        <span className="font-semibold tabular-nums">₨ {c.value.toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </motion.div>
            </div>

            {/* NET CASH FLOW + UTILIZATION ALERT */}
            <div className="grid gap-5 xl:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }} className="soft-card xl:col-span-2 p-5 sm:p-6">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.12em]">Cash flow</p>
                            <h2 className="mt-1 text-lg font-bold sm:text-xl">Net cash, last 6 months</h2>
                        </div>
                        <SoftBadge tone={statistics.totalRemaining >= 0 ? 'success' : 'danger'}>
                            {statistics.totalRemaining >= 0 ? 'Positive' : 'Negative'} this month
                        </SoftBadge>
                    </div>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#cb0c9f" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#7928ca" stopOpacity={0.85} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(258 75% 56% / 0.06)', radius: 8 }} contentStyle={tooltipStyle} formatter={(v: number) => `₨ ${v.toLocaleString()}`} />
                                <Bar dataKey="net" name="Net" fill="url(#netGrad)" radius={[10, 10, 4, 4]} animationDuration={1400} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.32 }}
                    className="relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_10px_28px_-6px_rgba(20,20,50,0.18)]"
                    style={{ background: 'var(--grad-info)' }}
                >
                    <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">Budget health</p>
                    <h3 className="mt-1 text-lg font-bold sm:text-xl">Target utilization</h3>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-4xl font-bold tabular-nums">
                            <AnimatedNumber value={Math.min(utilization, 999)} suffix="%" />
                        </span>
                        <span className="text-xs uppercase tracking-wider text-white/80">used</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(utilization, 100)}%` }}
                            transition={{ duration: 1.4, ease: 'easeOut' }}
                            className="h-full rounded-full bg-white"
                        />
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-white/85">
                        {utilization >= 90
                            ? 'You\'re running close to your monthly target. Consider trimming non-essential spending.'
                            : utilization >= 75
                              ? 'You\'re getting near your target. Keep an eye on category limits.'
                              : utilization >= 50
                                ? 'Healthy pace — about half of your monthly target consumed.'
                                : 'Plenty of runway. You\'re well below this month\'s target.'}
                    </p>
                    <Link href="/budgets/analytics" className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/25">
                        Open analytics
                    </Link>
                </motion.div>
            </div>

            {/* ACTIVE BUDGETS GRID */}
            <SoftCard padding="md">
                <SoftCardHeader
                    title={
                        <span className="flex items-center gap-2">
                            <PiggyBank className="size-5 text-primary" /> Active budgets ({currentBudgets.length})
                        </span>
                    }
                    subtitle={`Live status for ${currentPeriod.monthName} ${currentPeriod.year}`}
                    actions={
                        <SoftButton asChild variant="soft" size="sm">
                            <Link href="/budgets">View all</Link>
                        </SoftButton>
                    }
                />
                {currentBudgets.length === 0 ? (
                    <SoftEmptyState
                        icon={PiggyBank}
                        iconTone="primary"
                        title="No active budgets this month"
                        description="Create your first budget to start tracking income and expenses."
                        action={
                            <SoftButton asChild icon={Plus}>
                                <Link href="/budgets/create">Create budget</Link>
                            </SoftButton>
                        }
                    />
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
                        {currentBudgets.map((b) => {
                            const u = Number(b.budget_utilization ?? 0);
                            return (
                                <motion.div key={b.id} variants={itemVariants} whileHover={{ y: -3 }} className="border-border/60 hover:border-primary/40 flex flex-col gap-3 rounded-2xl border p-4 transition">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold">{b.name}</h3>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                                <SoftBadge tone="info">{b.type}</SoftBadge>
                                                <SoftBadge tone="neutral">{b.currency}</SoftBadge>
                                            </div>
                                        </div>
                                        <SoftButton asChild variant="soft" size="sm">
                                            <Link href={`/budgets/${b.id}`}>Open</Link>
                                        </SoftButton>
                                    </div>
                                    <SoftProgress
                                        value={Math.min(u, 100)}
                                        autoTone={{ warning: 75, danger: 90 }}
                                        size="sm"
                                        label={`${u.toFixed(0)}% used`}
                                        sub={`${b.formatted_total_expenses ?? '—'} of ${b.formatted_target_amount ?? '—'}`}
                                        showLabel
                                    />
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">Income</div>
                                            <div className="text-success font-semibold">{b.formatted_total_income ?? '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">Expenses</div>
                                            <div className="text-destructive font-semibold">{b.formatted_total_expenses ?? '—'}</div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">Remaining</div>
                                            <div className="font-semibold">{b.formatted_remaining_balance ?? '—'}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </SoftCard>

            {/* RECENT TRANSACTIONS FEED */}
            <SoftCard padding="md">
                <SoftCardHeader
                    title="Recent transactions"
                    subtitle="Latest income and expense activity across all budgets"
                    actions={
                        <SoftButton asChild variant="soft" size="sm">
                            <Link href="/budgets">View all budgets</Link>
                        </SoftButton>
                    }
                />
                {recentTransactions.length === 0 ? (
                    <SoftEmptyState icon={DollarSign} title="No transactions yet" description="Recorded transactions will appear here." />
                ) : (
                    <motion.ul variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-2">
                        {recentTransactions.map((t) => {
                            const isIncome = t.type === 'income';
                            return (
                                <motion.li key={t.id} variants={itemVariants} whileHover={{ x: 3 }} className="border-border/60 hover:border-primary/40 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition sm:flex-nowrap">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <SoftIconTile icon={isIncome ? ArrowUpRight : ArrowDownRight} tone={isIncome ? 'success' : 'danger'} size="sm" />
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{t.description}</div>
                                            <div className="text-muted-foreground truncate text-xs">
                                                {t.budget.name} • {t.category?.name ?? 'Uncategorized'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-semibold tabular-nums ${isIncome ? 'text-success' : 'text-destructive'}`}>{t.formatted_amount}</div>
                                        <div className="text-muted-foreground text-xs">{new Date(t.transaction_date).toLocaleDateString()}</div>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </motion.ul>
                )}
            </SoftCard>
        </AppLayout>
    );
}
