import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    SoftBadge,
    SoftButton,
    SoftCombobox,
    SoftDataTable,
    SoftPageHeader,
    SoftStatCard,
    type SoftDataTableColumn,
    type SoftDataTableSort,
    applyClientSort,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { Calendar, CreditCard, DollarSign, Edit, Eye, Plus, Trash2 } from 'lucide-react';

const breadcrumbs = [
    { title: 'Budget', href: '#' },
    { title: 'Debts', href: '/budgets/debts' },
];

interface Debt {
    id: number;
    name: string;
    description?: string;
    type?: string;
    total_amount: number;
    formatted_total_amount: string;
    current_balance: number;
    formatted_current_balance: string;
    interest_rate: number;
    monthly_payment: number;
    formatted_monthly_payment: string;
    due_date: string;
    status: string;
}

interface Paginated<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { from: number | null; to: number | null; total: number; last_page: number };
}

interface Statistics {
    totalDebt: number;
    totalMonthlyPayments: number;
    activeDebts: number;
    overdueDebts: number;
}

interface Props {
    debts: Debt[] | Paginated<Debt>;
    statistics?: Statistics;
}

const statusTone = (status: string): 'info' | 'success' | 'danger' | 'neutral' => {
    if (status === 'active') return 'info';
    if (status === 'paid' || status === 'paid_off') return 'success';
    if (status === 'overdue' || status === 'defaulted') return 'danger';
    return 'neutral';
};

export default function DebtsIndex({ debts, statistics }: Props) {
    const debtList: Debt[] = Array.isArray(debts) ? debts : (debts?.data ?? []);
    const paginator = !Array.isArray(debts) ? debts : null;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'name', direction: 'asc' });

    const columns: SoftDataTableColumn<Debt>[] = [
        {
            key: 'name',
            label: 'Debt',
            sortable: true,
            sortValue: (d) => d.name.toLowerCase(),
            render: (d) => (
                <div className="min-w-0">
                    <Link href={`/budgets/debts/${d.id}`} className="hover:text-primary block truncate font-medium">
                        {d.name}
                    </Link>
                    {d.description && <div className="text-muted-foreground truncate text-xs">{d.description}</div>}
                </div>
            ),
        },
        {
            key: 'total_amount',
            label: 'Total',
            sortable: true,
            align: 'right',
            sortValue: (d) => Number(d.total_amount),
            hideOnMobile: true,
            render: (d) => <span className="tabular-nums">{d.formatted_total_amount}</span>,
        },
        {
            key: 'current_balance',
            label: 'Balance',
            sortable: true,
            align: 'right',
            sortValue: (d) => Number(d.current_balance),
            render: (d) => <span className="font-semibold tabular-nums">{d.formatted_current_balance}</span>,
        },
        {
            key: 'interest_rate',
            label: 'APR',
            sortable: true,
            sortValue: (d) => Number(d.interest_rate),
            hideOnMobile: true,
            render: (d) => <SoftBadge tone="info">{Number(d.interest_rate).toFixed(2)}%</SoftBadge>,
        },
        {
            key: 'monthly_payment',
            label: 'Monthly',
            sortable: true,
            align: 'right',
            sortValue: (d) => Number(d.monthly_payment),
            hideOnMobile: true,
            render: (d) => <span className="tabular-nums">{d.formatted_monthly_payment}</span>,
        },
        {
            key: 'due_date',
            label: 'Due',
            sortable: true,
            sortValue: (d) => (d.due_date ? new Date(d.due_date).getTime() : 0),
            hideOnMobile: true,
            render: (d) => (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                    <Calendar className="size-3.5" />
                    {d.due_date ? new Date(d.due_date).toLocaleDateString() : '—'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            sortValue: (d) => d.status,
            render: (d) => <SoftBadge tone={statusTone(d.status)}>{d.status.replace('_', ' ')}</SoftBadge>,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (d) => (
                <div className="flex justify-end gap-1">
                    <SoftButton asChild variant="ghost" size="icon-sm" aria-label="View">
                        <Link href={`/budgets/debts/${d.id}`}>
                            <Eye />
                        </Link>
                    </SoftButton>
                    <SoftButton asChild variant="ghost" size="icon-sm" aria-label="Edit">
                        <Link href={`/budgets/debts/${d.id}/edit`}>
                            <Edit />
                        </Link>
                    </SoftButton>
                    <SoftButton
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete"
                        className="text-destructive"
                        onClick={() => {
                            if (confirm(`Delete the "${d.name}" debt?`)) router.delete(`/budgets/debts/${d.id}`);
                        }}
                    >
                        <Trash2 />
                    </SoftButton>
                </div>
            ),
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = debtList;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (d) => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q) || d.type?.toLowerCase().includes(q),
            );
        }
        if (statusFilter.length) rows = rows.filter((d) => statusFilter.includes(d.status));
        if (typeFilter.length) rows = rows.filter((d) => d.type && typeFilter.includes(d.type));
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debtList, search, statusFilter, typeFilter, sort]);

    const totalDebt = statistics?.totalDebt ?? debtList.reduce((s, d) => s + Number(d.current_balance), 0);
    const totalMonthly = statistics?.totalMonthlyPayments ?? debtList.reduce((s, d) => s + Number(d.monthly_payment ?? 0), 0);
    const overdueCount = statistics?.overdueDebts ?? debtList.filter((d) => d.status === 'overdue').length;

    const allTypeOptions = useMemo(() => {
        const set = new Set<string>();
        debtList.forEach((d) => d.type && set.add(d.type));
        return Array.from(set).map((t) => ({ value: t, label: t.replace('_', ' ') }));
    }, [debtList]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Debts" />

            <SoftPageHeader
                eyebrow="Debt management"
                eyebrowIcon={CreditCard}
                title="Debts"
                gradientTitle
                description="Monitor balances, interest rates, monthly payments, and payoff progress."
                actions={
                    <SoftButton asChild icon={Plus}>
                        <Link href="/budgets/debts/create">Add debt</Link>
                    </SoftButton>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard label="Total balance" value={`₨ ${totalDebt.toLocaleString()}`} icon={DollarSign} iconTone="warning" sub="Sum across all debts" />
                <SoftStatCard label="Monthly payments" value={`₨ ${totalMonthly.toLocaleString()}`} icon={Calendar} iconTone="info" sub="Recurring monthly outflow" />
                <SoftStatCard label="Overdue" value={overdueCount} icon={CreditCard} iconTone={overdueCount > 0 ? 'danger' : 'success'} sub={overdueCount > 0 ? 'Action required' : 'All on track'} />
            </div>

            <SoftDataTable<Debt>
                rows={filteredRows}
                columns={columns}
                paginator={paginator?.meta ? { ...paginator.meta, links: paginator.links } : undefined}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search debts…' }}
                emptyIcon={CreditCard}
                emptyTitle="No debts match your filters"
                filtersSlot={
                    <>
                        <div className="w-full sm:w-52">
                            <SoftCombobox
                                multiple
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'paid_off', label: 'Paid off' },
                                    { value: 'overdue', label: 'Overdue' },
                                    { value: 'defaulted', label: 'Defaulted' },
                                    { value: 'restructured', label: 'Restructured' },
                                ]}
                                placeholder="All statuses"
                            />
                        </div>
                        {allTypeOptions.length > 0 && (
                            <div className="w-full sm:w-52">
                                <SoftCombobox multiple value={typeFilter} onChange={setTypeFilter} options={allTypeOptions} placeholder="All types" />
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    );
}
