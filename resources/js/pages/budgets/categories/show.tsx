import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Edit, FolderTree, Plus, Receipt, Trash2 } from 'lucide-react';
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

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
    type: 'income' | 'expense';
    allocated_amount: number;
    color?: string;
    transactions: Transaction[];
}

interface Props {
    budget: Budget;
    category: Category;
}

const symbol = (currency: string) => (currency === 'PKR' ? '₨' : currency === 'SAR' ? '﷼' : '');

export default function CategoryShow({ budget, category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Categories', href: `/budgets/${budget.id}/categories` },
        { title: category.name, href: `/budgets/${budget.id}/categories/${category.id}` },
    ];

    const sym = symbol(budget.currency);
    const used = category.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const utilization = category.allocated_amount > 0 ? (used / category.allocated_amount) * 100 : 0;
    const remaining = Number(category.allocated_amount) - used;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <SoftPageHeader
                eyebrow={`${category.type} category`}
                eyebrowIcon={FolderTree}
                title={category.name}
                gradientTitle
                description={category.description ?? `Activity inside “${budget.name}”.`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftButton asChild icon={Plus}>
                            <Link href={`/budgets/${budget.id}/transactions/create?type=${category.type}`}>Add transaction</Link>
                        </SoftButton>
                        <SoftButton asChild variant="soft" icon={Edit}>
                            <Link href={`/budgets/${budget.id}/categories/${category.id}/edit`}>Edit</Link>
                        </SoftButton>
                        <SoftButton
                            variant="ghost"
                            icon={Trash2}
                            className="text-destructive"
                            onClick={() => {
                                if (confirm(`Delete the "${category.name}" category?`)) {
                                    router.delete(`/budgets/${budget.id}/categories/${category.id}`);
                                }
                            }}
                        >
                            Delete
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard label="Allocated" value={`${sym} ${Number(category.allocated_amount).toLocaleString()}`} icon={FolderTree} iconTone="primary" />
                <SoftStatCard
                    label={category.type === 'income' ? 'Earned' : 'Spent'}
                    value={`${sym} ${used.toLocaleString()}`}
                    icon={category.type === 'income' ? ArrowUpRight : ArrowDownRight}
                    iconTone={category.type === 'income' ? 'success' : 'warning'}
                />
                <SoftStatCard
                    label="Remaining"
                    value={`${sym} ${remaining.toLocaleString()}`}
                    icon={Receipt}
                    iconTone={remaining < 0 ? 'danger' : 'info'}
                />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader title="Utilization" />
                <SoftProgress
                    value={Math.min(utilization, 100)}
                    autoTone={category.type === 'expense' ? { warning: 75, danger: 100 } : undefined}
                    tone={category.type === 'income' ? 'success' : undefined}
                    label={`${utilization.toFixed(1)}% used`}
                    showLabel
                    sub={`${sym} ${used.toLocaleString()} of ${sym} ${Number(category.allocated_amount).toLocaleString()}`}
                />
            </SoftCard>

            <SoftCard padding="md">
                <SoftCardHeader title={`Transactions (${category.transactions.length})`} subtitle="All transactions assigned to this category." />
                {category.transactions.length === 0 ? (
                    <SoftEmptyState icon={Receipt} title="No transactions in this category" description="Once you record transactions here they'll appear in this list." />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {category.transactions.slice(0, 25).map((t) => (
                            <li key={t.id} className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap">
                                <div className="flex min-w-0 items-center gap-3">
                                    <SoftIconTile icon={t.type === 'income' ? ArrowUpRight : ArrowDownRight} tone={t.type === 'income' ? 'success' : 'danger'} size="sm" />
                                    <div className="min-w-0">
                                        <Link href={`/budgets/${budget.id}/transactions/${t.id}`} className="hover:text-primary block truncate font-medium">
                                            {t.description}
                                        </Link>
                                        <div className="text-muted-foreground text-xs">{new Date(t.transaction_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <span className={`text-right font-semibold tabular-nums ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>{sym} {Number(t.amount).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </SoftCard>
        </AppLayout>
    );
}
