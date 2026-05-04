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
import { type BreadcrumbItem } from '@/types';
import { ArrowDownRight, ArrowUpRight, Edit, Plus, Receipt, Trash2, TrendingDown, TrendingUp } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    formatted_amount: string;
    category?: Category | null;
}

interface PaginatedTransactions {
    data: Transaction[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { current_page: number; from: number | null; last_page: number; per_page: number; to: number | null; total: number };
}

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
    formatted_total_income: string;
    formatted_total_expenses: string;
}

interface Props {
    budget: Budget;
    transactions: PaginatedTransactions;
    categories: Category[];
    filters: { type?: string; category_id?: string; start_date?: string; end_date?: string };
}

export default function TransactionsIndex({ budget, transactions, categories, filters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Transactions', href: `/budgets/${budget.id}/transactions` },
    ];

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string[]>(filters.type ? [filters.type] : []);
    const [categoryFilter, setCategoryFilter] = useState<string[]>(filters.category_id ? [filters.category_id] : []);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'transaction_date', direction: 'desc' });

    const applyServer = (nextType: string[], nextCat: string[]) => {
        const params: Record<string, string> = {};
        if (nextType.length === 1) params.type = nextType[0];
        if (nextCat.length === 1) params.category_id = nextCat[0];
        router.get(`/budgets/${budget.id}/transactions`, params, { preserveState: true, preserveScroll: true });
    };

    const onTypeChange = (n: string[]) => {
        setTypeFilter(n);
        applyServer(n, categoryFilter);
    };
    const onCategoryChange = (n: string[]) => {
        setCategoryFilter(n);
        applyServer(typeFilter, n);
    };

    const columns: SoftDataTableColumn<Transaction>[] = [
        {
            key: 'description',
            label: 'Description',
            sortable: true,
            sortValue: (t) => t.description.toLowerCase(),
            render: (t) => {
                const isIncome = t.type === 'income';
                return (
                    <div className="flex min-w-0 items-center gap-3">
                        <SoftIconTile icon={isIncome ? ArrowUpRight : ArrowDownRight} tone={isIncome ? 'success' : 'danger'} size="sm" />
                        <div className="min-w-0">
                            <Link href={`/budgets/${budget.id}/transactions/${t.id}`} className="hover:text-primary block truncate font-medium">
                                {t.description}
                            </Link>
                            <div className="text-muted-foreground truncate text-xs">
                                {t.category?.name ?? 'Uncategorized'}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'category',
            label: 'Category',
            hideOnMobile: true,
            sortable: true,
            sortValue: (t) => t.category?.name ?? '',
            render: (t) => (t.category ? <SoftBadge tone="neutral">{t.category.name}</SoftBadge> : <span className="text-muted-foreground text-xs">—</span>),
        },
        {
            key: 'transaction_date',
            label: 'Date',
            sortable: true,
            sortValue: (t) => new Date(t.transaction_date).getTime(),
            render: (t) => <span className="text-muted-foreground text-sm">{new Date(t.transaction_date).toLocaleDateString()}</span>,
        },
        {
            key: 'amount',
            label: 'Amount',
            align: 'right',
            sortable: true,
            sortValue: (t) => Number(t.amount),
            render: (t) => (
                <span className={`font-semibold tabular-nums ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>{t.formatted_amount}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (t) => (
                <div className="flex justify-end gap-1">
                    <SoftButton asChild variant="ghost" size="icon-sm" aria-label="Edit">
                        <Link href={`/budgets/${budget.id}/transactions/${t.id}/edit`}>
                            <Edit />
                        </Link>
                    </SoftButton>
                    <SoftButton
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete"
                        className="text-destructive"
                        onClick={() => {
                            if (confirm('Delete this transaction?')) router.delete(`/budgets/${budget.id}/transactions/${t.id}`);
                        }}
                    >
                        <Trash2 />
                    </SoftButton>
                </div>
            ),
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = transactions.data;
        const q = search.trim().toLowerCase();
        if (q) rows = rows.filter((t) => t.description.toLowerCase().includes(q) || t.category?.name?.toLowerCase().includes(q));
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transactions.data, search, sort]);

    const incomeCount = transactions.data.filter((t) => t.type === 'income').length;
    const expenseCount = transactions.data.filter((t) => t.type === 'expense').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${budget.name} • Transactions`} />

            <SoftPageHeader
                eyebrow={budget.budget_period}
                eyebrowIcon={Receipt}
                title="Transactions"
                gradientTitle
                description={`All income and expenses recorded against “${budget.name}”.`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftButton asChild variant="success" icon={Plus}>
                            <Link href={`/budgets/${budget.id}/transactions/create?type=income`}>Add income</Link>
                        </SoftButton>
                        <SoftButton asChild icon={Plus}>
                            <Link href={`/budgets/${budget.id}/transactions/create?type=expense`}>Add expense</Link>
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard label="Income" value={budget.formatted_total_income} icon={TrendingUp} iconTone="success" sub={`${incomeCount} entries on this page`} />
                <SoftStatCard label="Expenses" value={budget.formatted_total_expenses} icon={TrendingDown} iconTone="warning" sub={`${expenseCount} entries on this page`} />
                <SoftStatCard label="Total" value={transactions.meta?.total ?? transactions.data.length} icon={Receipt} iconTone="primary" sub="All-time count" />
            </div>

            <SoftDataTable<Transaction>
                rows={filteredRows}
                columns={columns}
                paginator={transactions.meta ? { ...transactions.meta, links: transactions.links } : undefined}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search transactions by description or category…' }}
                emptyIcon={Receipt}
                emptyTitle="No transactions match your filters"
                filtersSlot={
                    <>
                        <div className="w-full sm:w-44">
                            <SoftCombobox
                                multiple
                                max={1}
                                value={typeFilter}
                                onChange={onTypeChange}
                                options={[
                                    { value: 'income', label: 'Income' },
                                    { value: 'expense', label: 'Expense' },
                                ]}
                                placeholder="All types"
                            />
                        </div>
                        {categories.length > 0 && (
                            <div className="w-full sm:w-56">
                                <SoftCombobox
                                    multiple
                                    max={1}
                                    value={categoryFilter}
                                    onChange={onCategoryChange}
                                    options={categories.map((c) => ({ value: String(c.id), label: c.name, description: c.type }))}
                                    placeholder="All categories"
                                    searchPlaceholder="Filter categories…"
                                />
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    );
}
