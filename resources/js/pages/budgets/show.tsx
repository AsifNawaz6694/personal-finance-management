import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    Coins,
    Download,
    Edit,
    FolderTree,
    PiggyBank,
    Plus,
    Receipt,
    Share2,
    Trash2,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
    SoftProgress,
    SoftStatCard,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    description?: string;
    type: 'income' | 'expense';
    allocated_amount: number;
    color?: string;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    formatted_amount: string;
    category?: { name: string } | null;
}

interface Budget {
    id: number;
    name: string;
    description?: string;
    type: string;
    custom_type?: string;
    target_amount: number;
    currency: 'PKR' | 'SAR';
    budget_year: number;
    budget_month: number;
    status: string;
    total_income: number;
    total_expenses: number;
    remaining_balance: number;
    budget_utilization: number;
    formatted_target_amount: string;
    formatted_total_income: string;
    formatted_total_expenses: string;
    formatted_remaining_balance: string;
    budget_period: string;
    categories: Category[];
    transactions: Transaction[];
}

interface Props {
    budget: Budget;
}

const symbolFor = (currency: string) => (currency === 'PKR' ? '₨' : '﷼');

export default function BudgetShow({ budget }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
    ];

    const symbol = symbolFor(budget.currency);
    const utilization = Math.min(budget.budget_utilization, 100);
    const incomeCategories = budget.categories.filter((c) => c.type === 'income');
    const expenseCategories = budget.categories.filter((c) => c.type === 'expense');

    const expenseByCategory = expenseCategories
        .map((cat) => {
            const total = budget.transactions
                .filter((t) => t.type === 'expense')
                .filter((t) => t.category?.name === cat.name)
                .reduce((sum, t) => sum + Number(t.amount), 0);
            const pct = cat.allocated_amount > 0 ? (total / cat.allocated_amount) * 100 : 0;
            return { ...cat, spent: total, pct };
        })
        .sort((a, b) => b.spent - a.spent);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={budget.name} />

            <SoftPageHeader
                eyebrow={budget.budget_period}
                eyebrowIcon={Calendar}
                title={budget.name}
                gradientTitle
                description={budget.description ?? `${budget.type === 'custom' ? budget.custom_type : budget.type} • ${budget.currency}`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftButton asChild icon={Plus}>
                            <Link href={`/budgets/${budget.id}/transactions/create`}>Add transaction</Link>
                        </SoftButton>
                        <SoftButton asChild variant="soft" icon={Edit}>
                            <Link href={`/budgets/${budget.id}/edit`}>Edit</Link>
                        </SoftButton>
                        <SoftButton asChild variant="soft" icon={Share2}>
                            <Link href={`/budgets/${budget.id}/shares`}>Share</Link>
                        </SoftButton>
                        <SoftButton asChild variant="soft" icon={Download}>
                            <Link href={`/budgets/export/${budget.id}/excel`}>Export</Link>
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SoftStatCard
                    label="Target"
                    value={budget.formatted_target_amount}
                    icon={PiggyBank}
                    iconTone="primary"
                    sub={`${budget.currency}`}
                />
                <SoftStatCard label="Income" value={budget.formatted_total_income} icon={TrendingUp} iconTone="success" />
                <SoftStatCard label="Expenses" value={budget.formatted_total_expenses} icon={TrendingDown} iconTone="warning" />
                <SoftStatCard
                    label="Remaining"
                    value={budget.formatted_remaining_balance}
                    icon={Wallet}
                    iconTone={budget.remaining_balance >= 0 ? 'success' : 'danger'}
                />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader
                    title="Budget vs actual"
                    subtitle="How much of the target has been spent so far"
                    actions={<SoftBadge tone={utilization >= 90 ? 'danger' : utilization >= 75 ? 'warning' : 'success'}>{utilization.toFixed(1)}% used</SoftBadge>}
                />
                <SoftProgress
                    value={utilization}
                    autoTone={{ warning: 75, danger: 90 }}
                    label="Utilization"
                    sub={`${budget.formatted_total_expenses} of ${budget.formatted_target_amount}`}
                    showLabel
                />
            </SoftCard>

            <div className="grid gap-6 xl:grid-cols-2">
                <SoftCard padding="md">
                    <SoftCardHeader
                        title={
                            <span className="flex items-center gap-2">
                                <FolderTree className="size-4 text-primary" /> Income categories ({incomeCategories.length})
                            </span>
                        }
                        actions={
                            <SoftButton asChild variant="soft" size="sm" icon={Plus}>
                                <Link href={`/budgets/${budget.id}/categories/create?type=income`}>Add</Link>
                            </SoftButton>
                        }
                    />
                    {incomeCategories.length === 0 ? (
                        <SoftEmptyState
                            icon={FolderTree}
                            iconTone="success"
                            title="No income categories"
                            description="Add categories like Salary, Freelance, or Investments."
                        />
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {incomeCategories.map((cat) => (
                                <li key={cat.id} className="border-border/60 flex items-center justify-between gap-3 rounded-xl border p-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: cat.color || 'hsl(152 62% 42%)' }} />
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{cat.name}</div>
                                            {cat.description && <div className="text-muted-foreground truncate text-xs">{cat.description}</div>}
                                        </div>
                                    </div>
                                    <div className="text-success text-right text-sm font-semibold tabular-nums">
                                        {symbol} {Number(cat.allocated_amount).toLocaleString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </SoftCard>

                <SoftCard padding="md">
                    <SoftCardHeader
                        title={
                            <span className="flex items-center gap-2">
                                <FolderTree className="size-4 text-primary" /> Expense categories ({expenseCategories.length})
                            </span>
                        }
                        actions={
                            <SoftButton asChild variant="soft" size="sm" icon={Plus}>
                                <Link href={`/budgets/${budget.id}/categories/create?type=expense`}>Add</Link>
                            </SoftButton>
                        }
                    />
                    {expenseByCategory.length === 0 ? (
                        <SoftEmptyState
                            icon={FolderTree}
                            iconTone="warning"
                            title="No expense categories"
                            description="Add categories like Groceries, Rent, or Transport."
                        />
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {expenseByCategory.map((cat) => (
                                <li key={cat.id} className="border-border/60 flex flex-col gap-2 rounded-xl border p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: cat.color || 'hsl(38 92% 50%)' }} />
                                            <div className="min-w-0">
                                                <div className="truncate font-medium">{cat.name}</div>
                                                <div className="text-muted-foreground truncate text-xs">
                                                    {symbol} {Number(cat.spent).toLocaleString()} of {symbol} {Number(cat.allocated_amount).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums">{cat.pct.toFixed(0)}%</span>
                                    </div>
                                    <SoftProgress value={Math.min(cat.pct, 100)} autoTone={{ warning: 75, danger: 100 }} size="sm" />
                                </li>
                            ))}
                        </ul>
                    )}
                </SoftCard>
            </div>

            <SoftCard padding="md">
                <SoftCardHeader
                    title={
                        <span className="flex items-center gap-2">
                            <Receipt className="size-4 text-primary" /> Recent transactions
                        </span>
                    }
                    subtitle={`${budget.transactions.length} total in this budget`}
                    actions={
                        <SoftButton asChild variant="soft" size="sm">
                            <Link href={`/budgets/${budget.id}/transactions`}>View all</Link>
                        </SoftButton>
                    }
                />
                {budget.transactions.length === 0 ? (
                    <SoftEmptyState
                        icon={Coins}
                        title="No transactions yet"
                        description="Add the first income or expense to start tracking activity."
                        action={
                            <SoftButton asChild icon={Plus}>
                                <Link href={`/budgets/${budget.id}/transactions/create`}>Add transaction</Link>
                            </SoftButton>
                        }
                    />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {budget.transactions.slice(0, 8).map((t) => {
                            const isIncome = t.type === 'income';
                            return (
                                <li key={t.id} className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <SoftIconTile icon={isIncome ? ArrowUpRight : ArrowDownRight} tone={isIncome ? 'success' : 'danger'} size="sm" />
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{t.description}</div>
                                            <div className="text-muted-foreground truncate text-xs">
                                                {t.category?.name ?? 'Uncategorized'} • {new Date(t.transaction_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`text-right font-semibold tabular-nums ${isIncome ? 'text-success' : 'text-destructive'}`}>{t.formatted_amount}</div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SoftCard>

            <div className="flex justify-end">
                <SoftButton
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => {
                        if (confirm(`Delete the "${budget.name}" budget? This cannot be undone.`)) {
                            router.delete(`/budgets/${budget.id}`);
                        }
                    }}
                    className="text-destructive"
                >
                    Delete budget
                </SoftButton>
            </div>
        </AppLayout>
    );
}
