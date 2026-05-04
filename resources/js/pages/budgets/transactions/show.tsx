import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Calendar, Edit, Receipt, Tag as TagIcon, Trash2 } from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftIconTile,
    SoftPageHeader,
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

interface Category {
    id: number;
    name: string;
    type: string;
}

interface Tag {
    id: number;
    name: string;
    color?: string;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    notes?: string | null;
    formatted_amount?: string;
    budget?: Budget;
    category?: Category | null;
    tags?: Tag[];
}

interface Props {
    budget: Budget;
    transaction: Transaction;
}

const symbol = (currency: string) => (currency === 'PKR' ? '₨' : currency === 'SAR' ? '﷼' : '');

export default function TransactionShow({ budget, transaction }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Transactions', href: `/budgets/${budget.id}/transactions` },
        { title: transaction.description, href: `/budgets/${budget.id}/transactions/${transaction.id}` },
    ];

    const sym = symbol(budget.currency);
    const isIncome = transaction.type === 'income';

    const remove = () => {
        if (confirm('Delete this transaction?')) {
            router.delete(`/budgets/${budget.id}/transactions/${transaction.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={transaction.description} />

            <SoftPageHeader
                eyebrow={budget.budget_period}
                eyebrowIcon={Receipt}
                title={transaction.description}
                gradientTitle
                description={`${isIncome ? 'Income' : 'Expense'} recorded on ${new Date(transaction.transaction_date).toLocaleDateString()} • ${budget.currency}`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftButton asChild variant="soft" icon={Edit}>
                            <Link href={`/budgets/${budget.id}/transactions/${transaction.id}/edit`}>Edit</Link>
                        </SoftButton>
                        <SoftButton variant="ghost" icon={Trash2} onClick={remove} className="text-destructive">
                            Delete
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard
                    label="Amount"
                    value={`${sym} ${Number(transaction.amount).toLocaleString()}`}
                    icon={isIncome ? ArrowUpRight : ArrowDownRight}
                    iconTone={isIncome ? 'success' : 'warning'}
                />
                <SoftStatCard label="Type" value={transaction.type} icon={Receipt} iconTone={isIncome ? 'success' : 'danger'} />
                <SoftStatCard label="Date" value={new Date(transaction.transaction_date).toLocaleDateString()} icon={Calendar} iconTone="info" />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader title="Details" />
                <div className="grid gap-3 text-sm">
                    <Row
                        label="Budget"
                        value={
                            <Link href={`/budgets/${budget.id}`} className="text-primary underline">
                                {budget.name}
                            </Link>
                        }
                    />
                    <Row label="Category" value={transaction.category ? <SoftBadge tone="neutral">{transaction.category.name}</SoftBadge> : 'Uncategorized'} />
                    <Row label="Tags" value={transaction.tags && transaction.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {transaction.tags.map((t) => (
                                <SoftBadge key={t.id} tone="primary" icon={TagIcon}>{t.name}</SoftBadge>
                            ))}
                        </div>
                    ) : '—'} />
                    {transaction.notes && (
                        <div className="border-border/60 flex flex-col gap-1 border-t pt-3">
                            <span className="text-muted-foreground">Notes</span>
                            <p className="leading-relaxed">{transaction.notes}</p>
                        </div>
                    )}
                </div>
            </SoftCard>
        </AppLayout>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="border-border/60 flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
