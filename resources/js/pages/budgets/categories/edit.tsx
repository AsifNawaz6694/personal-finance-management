import { Head, Link, useForm } from '@inertiajs/react';
import { FolderTree } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    description?: string | null;
    type: 'income' | 'expense';
    allocated_amount: number;
    color?: string | null;
}

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface Props {
    budget: Budget;
    category: Category;
}

interface FormData {
    name: string;
    description: string;
    allocated_amount: string;
    color: string;
    [key: string]: string;
}

const PALETTE = [
    '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f97316',
];

export default function CategoryEdit({ budget, category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Categories', href: `/budgets/${budget.id}/categories` },
        { title: 'Edit', href: `/budgets/${budget.id}/categories/${category.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: category.name,
        description: category.description ?? '',
        allocated_amount: String(category.allocated_amount),
        color: category.color ?? (category.type === 'income' ? '#10b981' : '#f59e0b'),
    });

    const symbol = budget.currency === 'PKR' ? '₨' : '﷼';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/budgets/${budget.id}/categories/${category.id}`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Edit category">
            <Head title={`Edit ${category.name}`} />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader eyebrow={budget.budget_period} eyebrowIcon={FolderTree} title={`Edit ${category.name}`} description={`${category.type === 'income' ? 'Income' : 'Expense'} category on “${budget.name}”.`} />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Details" />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allocated_amount">Allocated amount ({symbol})</Label>
                                <Input id="allocated_amount" type="number" step="0.01" min="0" value={data.allocated_amount} onChange={(e) => setData('allocated_amount', e.target.value)} required />
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
                        <SoftButton type="submit" loading={processing}>
                            Save changes
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
