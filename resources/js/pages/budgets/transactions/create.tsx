import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Receipt } from 'lucide-react';
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

interface TagOption {
    id: number;
    name: string;
    color?: string;
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
    tags?: TagOption[];
    type: 'income' | 'expense';
}

interface FormData {
    description: string;
    amount: string;
    type: 'income' | 'expense';
    transaction_date: string;
    budget_category_id: string;
    notes: string;
    tag_ids: number[];
    [key: string]: string | number[] | string[] | 'income' | 'expense';
}

export default function TransactionCreate({ budget, categories, tags = [], type }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Transactions', href: `/budgets/${budget.id}/transactions` },
        { title: 'Add', href: `/budgets/${budget.id}/transactions/create` },
    ];

    const { data, setData, post, processing, errors } = useForm<FormData>({
        description: '',
        amount: '',
        type,
        transaction_date: new Date().toISOString().slice(0, 10),
        budget_category_id: '',
        notes: '',
        tag_ids: [] as number[],
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
        post(`/budgets/${budget.id}/transactions`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Add transaction">
            <Head title={`Add transaction • ${budget.name}`} />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader
                    eyebrow={budget.budget_period}
                    eyebrowIcon={Receipt}
                    title={data.type === 'income' ? 'Add income' : 'Add expense'}
                    description={`Recording a ${data.type} entry against “${budget.name}”.`}
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Type" subtitle="Choose whether this is income or an expense." />
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData('type', 'income')}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                    data.type === 'income' ? 'border-success bg-success/10' : 'border-border hover:border-success/50'
                                }`}
                            >
                                <span className={`soft-icon-tile soft-icon-tile--success size-10 [&>svg]:size-5`}>
                                    <ArrowUpRight />
                                </span>
                                <div>
                                    <div className="font-semibold">Income</div>
                                    <div className="text-muted-foreground text-xs">Salary, freelance, gifts…</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('type', 'expense')}
                                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                    data.type === 'expense' ? 'border-destructive bg-destructive/10' : 'border-border hover:border-destructive/50'
                                }`}
                            >
                                <span className="soft-icon-tile soft-icon-tile--danger size-10 [&>svg]:size-5">
                                    <ArrowDownRight />
                                </span>
                                <div>
                                    <div className="font-semibold">Expense</div>
                                    <div className="text-muted-foreground text-xs">Groceries, rent, bills…</div>
                                </div>
                            </button>
                        </div>
                        <InputError message={errors.type} />
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader title="Details" />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="e.g. Monthly salary" required />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount ({symbol})</Label>
                                    <Input id="amount" type="number" step="0.01" min="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} placeholder="0.00" required />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transaction_date">Date</Label>
                                    <Input id="transaction_date" type="date" max={new Date().toISOString().slice(0, 10)} value={data.transaction_date} onChange={(e) => setData('transaction_date', e.target.value)} required />
                                    <InputError message={errors.transaction_date} />
                                </div>
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
                                {filteredCategories.length === 0 && (
                                    <p className="text-muted-foreground text-xs">
                                        No {data.type} categories yet. <Link className="text-primary underline" href={`/budgets/${budget.id}/categories/create?type=${data.type}`}>Create one</Link>.
                                    </p>
                                )}
                                <InputError message={errors.budget_category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} placeholder="Additional context" />
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
                        <SoftButton type="submit" loading={processing} variant={data.type === 'income' ? 'success' : 'primary'}>
                            Add {data.type}
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
