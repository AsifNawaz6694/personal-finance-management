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

interface FormData {
    title: string;
    description: string;
    budget_category_id: string;
    amount: string;
    type: 'income' | 'expense';
    interval: 'weekly' | 'monthly' | 'yearly';
    day_of_week: string;
    day_of_month: string;
    month_of_year: string;
    start_date: string;
    end_date: string;
    [key: string]: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' }),
}));

export default function RecurringCreate({ budget, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Recurring', href: `/budgets/${budget.id}/recurring-transactions` },
        { title: 'Create', href: `/budgets/${budget.id}/recurring-transactions/create` },
    ];

    const today = new Date().toISOString().slice(0, 10);
    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: '',
        description: '',
        budget_category_id: '',
        amount: '',
        type: 'expense',
        interval: 'monthly',
        day_of_week: 'monday',
        day_of_month: String(new Date().getDate()),
        month_of_year: '1',
        start_date: today,
        end_date: '',
    });

    const filteredCategories = categories.filter((c) => c.type === data.type);
    const symbol = budget.currency === 'PKR' ? '₨' : '﷼';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/budgets/${budget.id}/recurring-transactions`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Add recurring transaction">
            <Head title="Add recurring transaction" />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader eyebrow={budget.budget_period} eyebrowIcon={Repeat} title="New recurring transaction" description={`Repeats automatically on a schedule for “${budget.name}”.`} />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="What & how much" />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="e.g. Rent" required />
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
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v as 'income' | 'expense')}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
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
                        </div>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader title="Schedule" subtitle="Pick how often it should repeat." />
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-2">
                                {(['weekly', 'monthly', 'yearly'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setData('interval', opt)}
                                        className={`rounded-xl border p-3 text-sm font-medium capitalize transition ${data.interval === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            {data.interval === 'weekly' && (
                                <div className="space-y-2">
                                    <Label htmlFor="day_of_week">Day of week</Label>
                                    <Select value={data.day_of_week} onValueChange={(v) => setData('day_of_week', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map((d) => (
                                                <SelectItem key={d} value={d} className="capitalize">
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.day_of_week} />
                                </div>
                            )}

                            {data.interval === 'monthly' && (
                                <div className="space-y-2">
                                    <Label htmlFor="day_of_month">Day of month</Label>
                                    <Input id="day_of_month" type="number" min="1" max="31" value={data.day_of_month} onChange={(e) => setData('day_of_month', e.target.value)} required />
                                    <InputError message={errors.day_of_month} />
                                </div>
                            )}

                            {data.interval === 'yearly' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="month_of_year">Month</Label>
                                        <Select value={data.month_of_year} onValueChange={(v) => setData('month_of_year', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MONTHS.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.month_of_year} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="day_of_month_yearly">Day of month</Label>
                                        <Input id="day_of_month_yearly" type="number" min="1" max="31" value={data.day_of_month} onChange={(e) => setData('day_of_month', e.target.value)} />
                                        <InputError message={errors.day_of_month} />
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start date</Label>
                                    <Input id="start_date" type="date" min={today} value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End date (optional)</Label>
                                    <Input id="end_date" type="date" min={data.start_date} value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Create recurring
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
