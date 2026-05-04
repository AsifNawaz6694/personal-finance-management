import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    SoftBadge,
    SoftButton,
    SoftCombobox,
    SoftDataTable,
    SoftPageHeader,
    SoftProgress,
    type SoftDataTableColumn,
    type SoftDataTableSort,
    applyClientSort,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { DollarSign, Filter, Layers, Plus } from 'lucide-react';

const breadcrumbs = [
    { title: 'Budget', href: '#' },
    { title: 'Budgets', href: '/budgets' },
];

interface Budget {
    id: number;
    name: string;
    description?: string;
    type: string;
    custom_type?: string;
    target_amount: number;
    formatted_target_amount?: string;
    currency: string;
    budget_year: number;
    budget_month: number;
    status: string;
    formatted_total_income?: string;
    formatted_total_expenses?: string;
    budget_utilization?: number;
}

interface PaginatedBudgets {
    data: Budget[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { current_page: number; from: number | null; last_page: number; per_page: number; to: number | null; total: number };
    from?: number | null;
    to?: number | null;
    total?: number;
    last_page?: number;
}

interface Props {
    budgets: PaginatedBudgets;
    availableYears: number[];
    filters: { search?: string; year?: string; month?: string; currency?: string };
}

export default function BudgetsIndex({ budgets, availableYears, filters: initialFilters }: Props) {
    const [search, setSearch] = useState(initialFilters.search ?? '');
    const [year, setYear] = useState(initialFilters.year && initialFilters.year !== 'all' ? [initialFilters.year] : []);
    const [month, setMonth] = useState(initialFilters.month && initialFilters.month !== 'all' ? [initialFilters.month] : []);
    const [currency, setCurrency] = useState(initialFilters.currency && initialFilters.currency !== 'all' ? [initialFilters.currency] : []);
    const [typeFilter, setTypeFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'budget_year', direction: 'desc' });

    const meta = budgets.meta ?? {
        from: budgets.from ?? null,
        to: budgets.to ?? null,
        total: budgets.total ?? budgets.data.length,
        last_page: budgets.last_page ?? 1,
        per_page: 10,
        current_page: 1,
    };

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' }),
    }));

    const columns: SoftDataTableColumn<Budget>[] = [
        {
            key: 'name',
            label: 'Budget',
            sortable: true,
            sortValue: (b) => b.name.toLowerCase(),
            render: (b) => (
                <div className="min-w-0">
                    <Link href={`/budgets/${b.id}`} className="hover:text-primary block truncate font-medium">
                        {b.name}
                    </Link>
                    {b.description && <div className="text-muted-foreground truncate text-xs">{b.description}</div>}
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            sortValue: (b) => b.type,
            hideOnMobile: true,
            render: (b) => <SoftBadge tone="info">{b.type}</SoftBadge>,
        },
        {
            key: 'currency',
            label: 'Currency',
            sortable: true,
            sortValue: (b) => b.currency,
            hideOnMobile: true,
            render: (b) => <SoftBadge tone="neutral">{b.currency}</SoftBadge>,
        },
        {
            key: 'period',
            label: 'Period',
            sortable: true,
            sortValue: (b) => b.budget_year * 100 + b.budget_month,
            render: (b) => `${new Date(2024, b.budget_month - 1).toLocaleString('en', { month: 'short' })} ${b.budget_year}`,
        },
        {
            key: 'target_amount',
            label: 'Target',
            sortable: true,
            align: 'right',
            sortValue: (b) => Number(b.target_amount),
            render: (b) => <span className="font-semibold tabular-nums">{b.formatted_target_amount ?? '—'}</span>,
        },
        {
            key: 'budget_utilization',
            label: 'Utilization',
            sortable: true,
            sortValue: (b) => Number(b.budget_utilization ?? 0),
            render: (b) => {
                const u = Number(b.budget_utilization ?? 0);
                return (
                    <div className="flex min-w-32 items-center gap-2">
                        <SoftProgress value={Math.min(u, 100)} autoTone={{ warning: 75, danger: 90 }} size="sm" className="flex-1" />
                        <span className="text-xs font-semibold tabular-nums">{u.toFixed(0)}%</span>
                    </div>
                );
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (b) => (
                <div className="flex justify-end gap-1">
                    <SoftButton asChild variant="ghost" size="sm">
                        <Link href={`/budgets/${b.id}`}>Open</Link>
                    </SoftButton>
                    <SoftButton asChild variant="ghost" size="sm">
                        <Link href={`/budgets/${b.id}/edit`}>Edit</Link>
                    </SoftButton>
                </div>
            ),
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = budgets.data;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (b) =>
                    b.name.toLowerCase().includes(q) ||
                    b.description?.toLowerCase().includes(q) ||
                    b.type.toLowerCase().includes(q) ||
                    b.currency.toLowerCase().includes(q),
            );
        }
        if (year.length) rows = rows.filter((b) => year.includes(String(b.budget_year)));
        if (month.length) rows = rows.filter((b) => month.includes(String(b.budget_month)));
        if (currency.length) rows = rows.filter((b) => currency.includes(b.currency));
        if (typeFilter.length) rows = rows.filter((b) => typeFilter.includes(b.type));
        if (statusFilter.length) rows = rows.filter((b) => statusFilter.includes(b.status));
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [budgets.data, search, year, month, currency, typeFilter, statusFilter, sort]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Budgets" />

            <SoftPageHeader
                eyebrow="All budgets"
                eyebrowIcon={Layers}
                title="Budgets management"
                gradientTitle
                description="Plan, organize, and track every monthly budget."
                actions={
                    <SoftButton asChild icon={Plus}>
                        <Link href="/budgets/create">New budget</Link>
                    </SoftButton>
                }
            />

            <SoftDataTable<Budget>
                rows={filteredRows}
                columns={columns}
                paginator={{ from: meta.from, to: meta.to, total: meta.total, last_page: meta.last_page, links: budgets.links }}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search budgets…' }}
                emptyIcon={Filter}
                emptyTitle="No budgets match your filters"
                filtersSlot={
                    <>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                value={year}
                                onChange={setYear}
                                options={availableYears.map((y) => ({ value: String(y), label: String(y) }))}
                                placeholder="All years"
                                searchPlaceholder="Filter year…"
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <SoftCombobox multiple value={month} onChange={setMonth} options={monthOptions} placeholder="All months" />
                        </div>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                value={currency}
                                onChange={setCurrency}
                                options={[
                                    { value: 'PKR', label: 'PKR — Pakistani Rupee' },
                                    { value: 'SAR', label: 'SAR — Saudi Riyal' },
                                ]}
                                placeholder="All currencies"
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                value={typeFilter}
                                onChange={setTypeFilter}
                                options={[
                                    { value: 'personal', label: 'Personal' },
                                    { value: 'household', label: 'Household' },
                                    { value: 'travel', label: 'Travel' },
                                    { value: 'custom', label: 'Custom' },
                                ]}
                                placeholder="All types"
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'archived', label: 'Archived' },
                                ]}
                                placeholder="All statuses"
                            />
                        </div>
                    </>
                }
            />
        </AppLayout>
    );
}
