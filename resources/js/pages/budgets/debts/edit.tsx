import { Head, Link, useForm } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

interface Debt {
    id: number;
    name: string;
    description?: string;
    type: string;
    current_balance: number;
    monthly_payment?: number;
    status: string;
    due_date?: string;
    lender?: string;
    account_number?: string;
}

interface FormData {
    name: string;
    description: string;
    type: string;
    current_balance: string;
    monthly_payment: string;
    status: string;
    due_date: string;
    lender: string;
    account_number: string;
    [key: string]: string;
}

interface Props {
    debt: Debt;
}

export default function DebtEdit({ debt }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Debts', href: '/budgets/debts' },
        { title: debt.name, href: `/budgets/debts/${debt.id}` },
        { title: 'Edit', href: `/budgets/debts/${debt.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: debt.name,
        description: debt.description ?? '',
        type: debt.type,
        current_balance: String(debt.current_balance),
        monthly_payment: debt.monthly_payment ? String(debt.monthly_payment) : '',
        status: debt.status,
        due_date: debt.due_date ? String(debt.due_date).slice(0, 10) : '',
        lender: debt.lender ?? '',
        account_number: debt.account_number ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/budgets/debts/${debt.id}`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Edit debt">
            <Head title={`Edit ${debt.name}`} />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader eyebrow="Edit" eyebrowIcon={CreditCard} title={`Edit ${debt.name}`} description="Principal and start date are locked. Update balance, status, payment, and metadata." />

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
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="loan">Loan</SelectItem>
                                            <SelectItem value="credit_card">Credit card</SelectItem>
                                            <SelectItem value="mortgage">Mortgage</SelectItem>
                                            <SelectItem value="personal">Personal</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paid_off">Paid off</SelectItem>
                                            <SelectItem value="defaulted">Defaulted</SelectItem>
                                            <SelectItem value="restructured">Restructured</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="current_balance">Current balance</Label>
                                    <Input id="current_balance" type="number" step="0.01" min="0" value={data.current_balance} onChange={(e) => setData('current_balance', e.target.value)} required />
                                    <InputError message={errors.current_balance} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="monthly_payment">Monthly payment</Label>
                                    <Input id="monthly_payment" type="number" step="0.01" min="0.01" value={data.monthly_payment} onChange={(e) => setData('monthly_payment', e.target.value)} />
                                    <InputError message={errors.monthly_payment} />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Due date</Label>
                                    <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                    <InputError message={errors.due_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lender">Lender</Label>
                                    <Input id="lender" value={data.lender} onChange={(e) => setData('lender', e.target.value)} />
                                    <InputError message={errors.lender} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number">Account number</Label>
                                <Input id="account_number" value={data.account_number} onChange={(e) => setData('account_number', e.target.value)} />
                                <InputError message={errors.account_number} />
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Save changes
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href={`/budgets/debts/${debt.id}`}>Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
