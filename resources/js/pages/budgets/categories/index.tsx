import { Head, Link, router } from '@inertiajs/react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftPageHeader,
    SoftProgress,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Edit, FolderTree, Plus, Trash2 } from 'lucide-react';

interface Transaction {
    id: number;
    amount: number;
    type: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
    type: 'income' | 'expense';
    allocated_amount: number;
    color?: string;
    transactions?: Transaction[];
}

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface Props {
    budget: Budget;
    categories: Category[];
}

const symbolFor = (currency: string) => (currency === 'PKR' ? '₨' : '﷼');

export default function CategoriesIndex({ budget, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Categories', href: `/budgets/${budget.id}/categories` },
    ];

    const symbol = symbolFor(budget.currency);
    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');

    const renderCategory = (cat: Category) => {
        const used = (cat.transactions ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
        const pct = cat.allocated_amount > 0 ? (used / cat.allocated_amount) * 100 : 0;
        return (
            <li key={cat.id} className="border-border/60 flex flex-col gap-2 rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: cat.color || (cat.type === 'income' ? 'hsl(152 62% 42%)' : 'hsl(38 92% 50%)') }} />
                        <div className="min-w-0">
                            <div className="truncate font-medium">{cat.name}</div>
                            {cat.description && <div className="text-muted-foreground truncate text-xs">{cat.description}</div>}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <SoftBadge tone="neutral">
                            {symbol} {Number(cat.allocated_amount).toLocaleString()}
                        </SoftBadge>
                        <SoftButton asChild variant="ghost" size="icon-sm" aria-label="Edit">
                            <Link href={`/budgets/${budget.id}/categories/${cat.id}/edit`}>
                                <Edit />
                            </Link>
                        </SoftButton>
                        <SoftButton
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete"
                            onClick={() => {
                                if (confirm(`Delete category "${cat.name}"?`)) {
                                    router.delete(`/budgets/${budget.id}/categories/${cat.id}`);
                                }
                            }}
                        >
                            <Trash2 />
                        </SoftButton>
                    </div>
                </div>
                <SoftProgress value={Math.min(pct, 100)} autoTone={cat.type === 'expense' ? { warning: 75, danger: 100 } : undefined} tone={cat.type === 'income' ? 'success' : undefined} size="sm" />
                <div className="text-muted-foreground text-xs">
                    {symbol} {used.toLocaleString()} of {symbol} {Number(cat.allocated_amount).toLocaleString()} ({pct.toFixed(0)}%)
                </div>
            </li>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${budget.name} • Categories`} />

            <SoftPageHeader
                eyebrow={budget.budget_period}
                eyebrowIcon={FolderTree}
                title="Categories"
                gradientTitle
                description={`Organize income and expenses inside “${budget.name}”.`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftButton asChild variant="success" icon={Plus}>
                            <Link href={`/budgets/${budget.id}/categories/create?type=income`}>Add income category</Link>
                        </SoftButton>
                        <SoftButton asChild icon={Plus}>
                            <Link href={`/budgets/${budget.id}/categories/create?type=expense`}>Add expense category</Link>
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <SoftCard padding="md">
                    <SoftCardHeader title={`Income categories (${income.length})`} />
                    {income.length === 0 ? (
                        <SoftEmptyState icon={FolderTree} iconTone="success" title="No income categories" description="Create your first income source category." />
                    ) : (
                        <ul className="flex flex-col gap-3">{income.map(renderCategory)}</ul>
                    )}
                </SoftCard>
                <SoftCard padding="md">
                    <SoftCardHeader title={`Expense categories (${expense.length})`} />
                    {expense.length === 0 ? (
                        <SoftEmptyState icon={FolderTree} iconTone="warning" title="No expense categories" description="Create categories like Groceries, Rent, or Transport." />
                    ) : (
                        <ul className="flex flex-col gap-3">{expense.map(renderCategory)}</ul>
                    )}
                </SoftCard>
            </div>
        </AppLayout>
    );
}
