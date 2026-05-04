import { Head, Link, useForm } from '@inertiajs/react';
import { Repeat } from 'lucide-react';
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

interface RecurringTransaction {
    id: number;
    title: string;
    description?: string | null;
    budget_category_id?: number | null;
    amount: number;
    type: 'income' | 'expense';
    interval: 'weekly' | 'monthly' | 'yearly';
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    start_date: string;
    end_date?: string | null;
}

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface Props {
    budget: Budget;
    recurringTransaction: RecurringTransaction;
    categories: Category[];
}

interface FormData {
    title: string;
    description: string;
    budget_category_id: string;
    amount: string;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    end_date: string;
    [key: string]: string;
}

export default function RecurringEdit({ budget, recurringTransaction, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Recurring', href: `/budgets/${budget.id}/recurring-transactions` },
        { title: 'Edit', href: `/budgets/${budget.id}/recurring-transactions/${recurringTransaction.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        title: recurringTransaction.title,
        description: recurringTransaction.description ?? '',
        budget_category_id: recurringTransaction.budget_category_id ? String(recurringTransaction.budget_category_id) : '',
        amount: String(recurringTransaction.amount),
        status: recurringTransaction.status,
        end_date: recurringTransaction.end_date ? String(recurringTransaction.end_date).slice(0, 10) : '',
    });

    const filteredCategories = categories.filter((c) => c.type === recurringTransaction.type);
    const symbol = budget.currency === 'PKR' ? '₨' : '﷼';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/budgets/${budget.id}/recurring-transactions/${recurringTransaction.id}`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Edit recurring">
            <Head title={`Edit ${recurringTransaction.title}`} />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader eyebrow={budget.budget_period} eyebrowIcon={Repeat} title={`Edit ${recurringTransaction.title}`} description={`${recurringTransaction.interval} ${recurringTransaction.type} on “${budget.name}”.`} />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Details" subtitle="Type, interval, and start date are locked once a recurring transaction is created." />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                <InputError message={errors.title} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount ({symbol})</Label>
                                    <Input id="amount" type="number" step="0.01" min="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v as FormData['status'])}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budget_category_id">Category</Label>
                                <Select value={data.budget_category_id || 'none'} onValueChange={(v) => setData('budget_category_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger>
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
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End date (optional)</Label>
                                <Input id="end_date" type="date" min={recurringTransaction.start_date.slice(0, 10)} value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                <InputError message={errors.end_date} />
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Save changes
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href={`/budgets/${budget.id}/recurring-transactions`}>Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
