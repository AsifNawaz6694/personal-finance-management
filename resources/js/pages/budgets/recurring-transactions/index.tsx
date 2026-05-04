import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    SoftBadge,
    SoftButton,
    SoftCombobox,
    SoftDataTable,
    SoftIconTile,
    SoftPageHeader,
    SoftStatCard,
    type SoftDataTableColumn,
    type SoftDataTableSort,
    applyClientSort,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { ArrowDownRight, ArrowUpRight, Calendar, DollarSign, Repeat, TrendingUp } from 'lucide-react';

const breadcrumbs = [
    { title: 'Budget', href: '#' },
    { title: 'Recurring Transactions', href: '/budgets/recurring-transactions' },
];

interface RecurringTransaction {
    id: number;
    title: string;
    description?: string | null;
    amount: number;
    type: 'income' | 'expense';
    interval: 'weekly' | 'monthly' | 'yearly';
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    next_process_at: string | null;
    last_processed_at: string | null;
    process_count: number;
    start_date: string;
    end_date?: string | null;
    budget?: { id: number; name: string; currency: string } | null;
    category?: { id: number; name: string; type: string } | null;
}

interface Paginated<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { from: number | null; to: number | null; total: number; last_page: number };
}

interface Props {
    recurringTransactions: Paginated<RecurringTransaction>;
    totals: { monthly_expense: number; monthly_income: number; active_count: number };
    filters: { interval?: string; status?: string };
}

const intervalTone = (i: string): 'info' | 'primary' | 'warning' | 'neutral' => {
    if (i === 'weekly') return 'info';
    if (i === 'monthly') return 'primary';
    if (i === 'yearly') return 'warning';
    return 'neutral';
};

const statusTone = (s: string): 'success' | 'warning' | 'neutral' => {
    if (s === 'active') return 'success';
    if (s === 'paused') return 'warning';
    return 'neutral';
};

const symbolFor = (currency?: string) => (currency === 'PKR' ? '₨' : currency === 'SAR' ? '﷼' : '');

export default function RecurringOverview({ recurringTransactions, totals, filters }: Props) {
    const [search, setSearch] = useState('');
    const [intervalFilter, setIntervalFilter] = useState<string[]>(filters.interval && filters.interval !== 'all' ? [filters.interval] : []);
    const [statusFilter, setStatusFilter] = useState<string[]>(filters.status && filters.status !== 'all' ? [filters.status] : []);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'next_process_at', direction: 'asc' });

    // Sync server filters when local filters change
    const applyServerFilters = (newInterval: string[], newStatus: string[]) => {
        const params: Record<string, string> = {};
        if (newInterval.length === 1) params.interval = newInterval[0];
        if (newStatus.length === 1) params.status = newStatus[0];
        router.get('/budgets/recurring-transactions', params, { preserveState: true, preserveScroll: true });
    };

    const onIntervalChange = (next: string[]) => {
        setIntervalFilter(next);
        applyServerFilters(next, statusFilter);
    };
    const onStatusChange = (next: string[]) => {
        setStatusFilter(next);
        applyServerFilters(intervalFilter, next);
    };

    const columns: SoftDataTableColumn<RecurringTransaction>[] = [
        {
            key: 'title',
            label: 'Title',
            sortable: true,
            sortValue: (r) => r.title.toLowerCase(),
            render: (rt) => {
                const isIncome = rt.type === 'income';
                return (
                    <div className="flex min-w-0 items-center gap-3">
                        <SoftIconTile icon={isIncome ? ArrowUpRight : ArrowDownRight} tone={isIncome ? 'success' : 'danger'} size="sm" />
                        <div className="min-w-0">
                            <div className="truncate font-medium">{rt.title}</div>
                            <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
                                {rt.budget && (
                                    <Link className="hover:text-primary underline" href={`/budgets/${rt.budget.id}`}>
                                        {rt.budget.name}
                                    </Link>
                                )}
                                {rt.category && <span>· {rt.category.name}</span>}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'interval',
            label: 'Interval',
            sortable: true,
            sortValue: (r) => r.interval,
            hideOnMobile: true,
            render: (r) => <SoftBadge tone={intervalTone(r.interval)}>{r.interval}</SoftBadge>,
        },
        {
            key: 'next_process_at',
            label: 'Next',
            sortable: true,
            sortValue: (r) => (r.next_process_at ? new Date(r.next_process_at).getTime() : 0),
            hideOnMobile: true,
            render: (r) =>
                r.next_process_at ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                        <Calendar className="size-3.5" />
                        {new Date(r.next_process_at).toLocaleDateString()}
                    </span>
                ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            sortValue: (r) => r.status,
            render: (r) => <SoftBadge tone={statusTone(r.status)}>{r.status}</SoftBadge>,
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            align: 'right',
            sortValue: (r) => Number(r.amount),
            render: (r) => {
                const sym = symbolFor(r.budget?.currency);
                return <span className={`font-semibold tabular-nums ${r.type === 'income' ? 'text-success' : 'text-destructive'}`}>{sym} {Number(r.amount).toLocaleString()}</span>;
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (r) =>
                r.budget ? (
                    <SoftButton asChild variant="ghost" size="sm">
                        <Link href={`/budgets/${r.budget.id}/recurring-transactions/${r.id}`}>Open</Link>
                    </SoftButton>
                ) : null,
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = recurringTransactions.data;
        const q = search.trim().toLowerCase();
        if (q) rows = rows.filter((rt) => rt.title.toLowerCase().includes(q) || rt.description?.toLowerCase().includes(q));
        if (typeFilter.length) rows = rows.filter((rt) => typeFilter.includes(rt.type));
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recurringTransactions.data, search, typeFilter, sort]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recurring transactions" />

            <SoftPageHeader
                eyebrow="Cross-budget"
                eyebrowIcon={Repeat}
                title="Recurring transactions"
                gradientTitle
                description="All scheduled income and expenses across every budget."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard label="Monthly income" value={`₨ ${Number(totals.monthly_income).toLocaleString()}`} icon={ArrowUpRight} iconTone="success" sub="Active monthly" />
                <SoftStatCard label="Monthly expenses" value={`₨ ${Number(totals.monthly_expense).toLocaleString()}`} icon={ArrowDownRight} iconTone="warning" sub="Active monthly" />
                <SoftStatCard label="Active schedules" value={totals.active_count} icon={TrendingUp} iconTone="primary" sub="Across all budgets" />
            </div>

            <SoftDataTable<RecurringTransaction>
                rows={filteredRows}
                columns={columns}
                paginator={recurringTransactions.meta ? { ...recurringTransactions.meta, links: recurringTransactions.links } : undefined}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search by title or description…' }}
                emptyIcon={Repeat}
                emptyTitle="No recurring transactions match your filters"
                filtersSlot={
                    <>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                value={intervalFilter}
                                onChange={onIntervalChange}
                                options={[
                                    { value: 'weekly', label: 'Weekly' },
                                    { value: 'monthly', label: 'Monthly' },
                                    { value: 'yearly', label: 'Yearly' },
                                ]}
                                placeholder="All intervals"
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                value={statusFilter}
                                onChange={onStatusChange}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'paused', label: 'Paused' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                                placeholder="All statuses"
                            />
                        </div>
                        <div className="w-full sm:w-40">
                            <SoftCombobox
                                multiple
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={[
                                    { value: 'income', label: 'Income' },
                                    { value: 'expense', label: 'Expense' },
                                ]}
                                placeholder="All types"
                            />
                        </div>
                    </>
                }
            />
        </AppLayout>
    );
}
