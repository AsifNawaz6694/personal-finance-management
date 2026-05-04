import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarRange, Coins, FileText, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Budgets', href: '/budgets' },
    { title: 'Create Budget', href: '/budgets/create' },
];

interface BudgetFormData {
    name: string;
    description: string;
    type: string;
    custom_type: string;
    target_amount: string;
    currency: string;
    budget_year: string;
    budget_month: string;
    [key: string]: string;
}

export default function BudgetCreate() {
    const { data, setData, post, processing, errors } = useForm<BudgetFormData>({
        name: '',
        description: '',
        type: 'personal',
        custom_type: '',
        target_amount: '',
        currency: 'PKR',
        budget_year: new Date().getFullYear().toString(),
        budget_month: (new Date().getMonth() + 1).toString(),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/budgets');
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'long' }),
    }));

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Create Budget">
            <Head title="Create Budget" />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader
                    eyebrow="New budget"
                    eyebrowIcon={Sparkles}
                    title="Create a monthly budget"
                    description="Set a target, pick a currency and period — you can add categories and transactions next."
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader
                            title={
                                <span className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" /> Basic information
                                </span>
                            }
                            subtitle="Give the budget a clear name and optional description."
                        />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Budget name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Monthly household budget"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What is this budget for?"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Budget type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select budget type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="personal">Personal</SelectItem>
                                            <SelectItem value="household">Household</SelectItem>
                                            <SelectItem value="travel">Travel</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                {data.type === 'custom' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="custom_type">Custom type name</Label>
                                        <Input
                                            id="custom_type"
                                            value={data.custom_type}
                                            onChange={(e) => setData('custom_type', e.target.value)}
                                            placeholder="e.g. Business, Education"
                                            required={data.type === 'custom'}
                                        />
                                        <InputError message={errors.custom_type} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader
                            title={
                                <span className="flex items-center gap-2">
                                    <Coins className="size-4 text-primary" /> Financial details
                                </span>
                            }
                            subtitle="Target amount, currency, and the period this budget covers."
                        />
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="target_amount">Target amount</Label>
                                    <Input
                                        id="target_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.target_amount}
                                        onChange={(e) => setData('target_amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    <InputError message={errors.target_amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={data.currency} onValueChange={(v) => setData('currency', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PKR">PKR — Pakistani Rupee</SelectItem>
                                            <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.currency} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="budget_year">Budget year</Label>
                                    <Select value={data.budget_year} onValueChange={(v) => setData('budget_year', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.budget_year} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget_month">Budget month</Label>
                                    <Select value={data.budget_month} onValueChange={(v) => setData('budget_month', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.budget_month} />
                                </div>
                            </div>

                            <div className="soft-card-inset flex flex-col gap-2 p-4 text-sm">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    <CalendarRange className="size-3.5" />
                                    Summary
                                </div>
                                <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
                                    <span>
                                        <span className="text-foreground font-medium">Period:</span>{' '}
                                        {months.find((m) => m.value === data.budget_month)?.label} {data.budget_year}
                                    </span>
                                    <span>
                                        <span className="text-foreground font-medium">Currency:</span>{' '}
                                        {data.currency === 'PKR' ? 'Pakistani Rupee (PKR)' : 'Saudi Riyal (SAR)'}
                                    </span>
                                    {data.target_amount && (
                                        <span>
                                            <span className="text-foreground font-medium">Target:</span>{' '}
                                            {data.currency === 'PKR' ? '₨' : '﷼'} {parseFloat(data.target_amount).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Create budget
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href="/budgets">Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
