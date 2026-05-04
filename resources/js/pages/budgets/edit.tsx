import { Head, Link, useForm } from '@inertiajs/react';
import { Coins, FileText, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

interface Budget {
    id: number;
    name: string;
    description?: string;
    type: string;
    custom_type?: string;
    target_amount: number;
    currency: string;
    budget_year: number;
    budget_month: number;
    status: string;
}

interface Props {
    budget: Budget;
}

interface FormData {
    name: string;
    description: string;
    type: string;
    custom_type: string;
    target_amount: string;
    status: string;
    [key: string]: string;
}

export default function BudgetEdit({ budget }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Edit', href: `/budgets/${budget.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: budget.name,
        description: budget.description ?? '',
        type: budget.type,
        custom_type: budget.custom_type ?? '',
        target_amount: String(budget.target_amount),
        status: budget.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/budgets/${budget.id}`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Edit Budget">
            <Head title={`Edit ${budget.name}`} />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader
                    eyebrow="Edit"
                    eyebrowIcon={Sparkles}
                    title={`Edit ${budget.name}`}
                    description="Update the metadata, target amount, and status of this budget."
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader
                            title={
                                <span className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" /> Basic information
                                </span>
                            }
                        />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Budget name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Budget type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                        <Input id="custom_type" value={data.custom_type} onChange={(e) => setData('custom_type', e.target.value)} required />
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
                                    <Coins className="size-4 text-primary" /> Target & status
                                </span>
                            }
                            subtitle="Currency and period are locked once a budget is created."
                        />
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="target_amount">Target amount ({budget.currency})</Label>
                                    <Input id="target_amount" type="number" step="0.01" min="0" value={data.target_amount} onChange={(e) => setData('target_amount', e.target.value)} required />
                                    <InputError message={errors.target_amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                            <div className="soft-card-inset p-4 text-sm text-muted-foreground">
                                Period: <span className="text-foreground font-medium">{new Date(2024, budget.budget_month - 1).toLocaleString('en', { month: 'long' })} {budget.budget_year}</span>
                                {' • '}
                                Currency: <span className="text-foreground font-medium">{budget.currency}</span>
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Save changes
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href={`/budgets/${budget.id}`}>Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
