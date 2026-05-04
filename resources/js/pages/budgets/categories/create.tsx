import { Head, Link, useForm } from '@inertiajs/react';
import { FolderTree } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface Props {
    budget: Budget;
    type: 'income' | 'expense';
}

interface FormData {
    name: string;
    description: string;
    type: 'income' | 'expense';
    allocated_amount: string;
    color: string;
    [key: string]: string;
}

const PALETTE = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f97316',
];

export default function CategoryCreate({ budget, type }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Categories', href: `/budgets/${budget.id}/categories` },
        { title: 'Create', href: `/budgets/${budget.id}/categories/create` },
    ];

    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        description: '',
        type,
        allocated_amount: '',
        color: type === 'income' ? '#10b981' : '#f59e0b',
    });

    const symbol = budget.currency === 'PKR' ? '₨' : '﷼';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/budgets/${budget.id}/categories`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Create category">
            <Head title="Create category" />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader
                    eyebrow={budget.budget_period}
                    eyebrowIcon={FolderTree}
                    title={data.type === 'income' ? 'New income category' : 'New expense category'}
                    description={`On budget “${budget.name}”.`}
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Details" />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={data.type === 'income' ? 'e.g. Salary' : 'e.g. Groceries'} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allocated_amount">Allocated amount ({symbol})</Label>
                                <Input id="allocated_amount" type="number" step="0.01" min="0" value={data.allocated_amount} onChange={(e) => setData('allocated_amount', e.target.value)} placeholder="0.00" required />
                                <InputError message={errors.allocated_amount} />
                            </div>
                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex flex-wrap gap-2">
                                    {PALETTE.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            aria-label={c}
                                            onClick={() => setData('color', c)}
                                            className={`size-8 rounded-full ring-offset-2 transition ${data.color === c ? 'ring-2 ring-primary ring-offset-background' : 'opacity-80 hover:opacity-100'}`}
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                                <InputError message={errors.color} />
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing} variant={data.type === 'income' ? 'success' : 'primary'}>
                            Create category
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href={`/budgets/${budget.id}/categories`}>Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
