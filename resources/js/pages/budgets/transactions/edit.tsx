import { Head, Link, useForm } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

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
    budget_category_id?: number | null;
    notes?: string | null;
}

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface TagOption {
    id: number;
    name: string;
    color?: string;
}

interface Props {
    budget: Budget;
    transaction: Transaction;
    categories: Category[];
    tags?: TagOption[];
    selectedTagIds?: number[];
}

interface FormData {
    description: string;
    amount: string;
    type: 'income' | 'expense';
    transaction_date: string;
    budget_category_id: string;
    notes: string;
    tag_ids: number[];
    [key: string]: string | number[] | 'income' | 'expense';
}

export default function TransactionEdit({ budget, transaction, categories, tags = [], selectedTagIds = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Transactions', href: `/budgets/${budget.id}/transactions` },
        { title: 'Edit', href: `/budgets/${budget.id}/transactions/${transaction.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        description: transaction.description,
        amount: String(transaction.amount),
        type: transaction.type,
        transaction_date: transaction.transaction_date.slice(0, 10),
        budget_category_id: transaction.budget_category_id ? String(transaction.budget_category_id) : '',
        notes: transaction.notes ?? '',
        tag_ids: selectedTagIds,
    });

    const toggleTag = (id: number) => {
        const set = new Set(data.tag_ids);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        setData('tag_ids', Array.from(set));
    };

    const filteredCategories = categories.filter((c) => c.type === data.type);
    const symbol = budget.currency === 'PKR' ? '₨' : '﷼';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/budgets/${budget.id}/transactions/${transaction.id}`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Edit transaction">
            <Head title="Edit transaction" />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader eyebrow={budget.budget_period} eyebrowIcon={Receipt} title="Edit transaction" description={`Update this entry on “${budget.name}”.`} />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Details" />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount ({symbol})</Label>
                                    <Input id="amount" type="number" step="0.01" min="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transaction_date">Date</Label>
                                    <Input id="transaction_date" type="date" max={new Date().toISOString().slice(0, 10)} value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} required />
                                    <InputError message={errors.transaction_date} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v as 'income' | 'expense')}>
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget_category_id">Category</Label>
                                    <Select value={data.budget_category_id || 'none'} onValueChange={(v) => setData('budget_category_id', v === 'none' ? '' : v)}>
                                        <SelectTrigger id="budget_category_id">
                                            <SelectValue placeholder="Uncategorized" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Uncategorized</SelectItem>
                                            {filteredCategories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.budget_category_id} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                <InputError message={errors.notes} />
                            </div>
                            {tags.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((t) => {
                                            const active = data.tag_ids.includes(t.id);
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    onClick={() => toggleTag(t.id)}
                                                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                                                        active ? 'border-primary bg-primary/15 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                                    }`}
                                                >
                                                    {t.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Save changes
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href={`/budgets/${budget.id}/transactions`}>Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
