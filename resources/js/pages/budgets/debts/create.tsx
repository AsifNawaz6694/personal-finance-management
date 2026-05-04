import { Head, Link, useForm } from '@inertiajs/react';
import { Coins, CreditCard, FileText, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

interface FormData {
    name: string;
    description: string;
    type: string;
    principal_amount: string;
    interest_rate: string;
    interest_type: string;
    current_balance: string;
    monthly_payment: string;
    start_date: string;
    due_date: string;
    lender: string;
    account_number: string;
    [key: string]: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Debts', href: '/budgets/debts' },
    { title: 'Add', href: '/budgets/debts/create' },
];

export default function DebtCreate() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        description: '',
        type: 'loan',
        principal_amount: '',
        interest_rate: '',
        interest_type: 'simple',
        current_balance: '',
        monthly_payment: '',
        start_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        lender: '',
        account_number: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/budgets/debts');
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Add debt">
            <Head title="Add debt" />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader eyebrow="New debt" eyebrowIcon={Sparkles} title="Track a new debt" description="Loans, credit cards, mortgages — anything you owe and need to pay back." />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader
                            title={
                                <span className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" /> Basics
                                </span>
                            }
                        />
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Debt name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Car loan" required />
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
                                    <Label htmlFor="lender">Lender</Label>
                                    <Input id="lender" value={data.lender} onChange={(e) => setData('lender', e.target.value)} placeholder="e.g. HBL" />
                                    <InputError message={errors.lender} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number">Account number (optional)</Label>
                                <Input id="account_number" value={data.account_number} onChange={(e) => setData('account_number', e.target.value)} />
                                <InputError message={errors.account_number} />
                            </div>
                        </div>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader
                            title={
                                <span className="flex items-center gap-2">
                                    <Coins className="size-4 text-primary" /> Amounts & rate
                                </span>
                            }
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="principal_amount">Principal amount</Label>
                                <Input id="principal_amount" type="number" step="0.01" min="0.01" value={data.principal_amount} onChange={(e) => setData('principal_amount', e.target.value)} required />
                                <InputError message={errors.principal_amount} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="current_balance">Current balance</Label>
                                <Input id="current_balance" type="number" step="0.01" min="0" value={data.current_balance} onChange={(e) => setData('current_balance', e.target.value)} required />
                                <InputError message={errors.current_balance} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interest_rate">Interest rate (%)</Label>
                                <Input id="interest_rate" type="number" step="0.01" min="0" max="100" value={data.interest_rate} onChange={(e) => setData('interest_rate', e.target.value)} required />
                                <InputError message={errors.interest_rate} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interest_type">Interest type</Label>
                                <Select value={data.interest_type} onValueChange={(v) => setData('interest_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="simple">Simple</SelectItem>
                                        <SelectItem value="compound">Compound</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.interest_type} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="monthly_payment">Monthly payment</Label>
                                <Input id="monthly_payment" type="number" step="0.01" min="0.01" value={data.monthly_payment} onChange={(e) => setData('monthly_payment', e.target.value)} />
                                <InputError message={errors.monthly_payment} />
                            </div>
                        </div>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader
                            title={
                                <span className="flex items-center gap-2">
                                    <CreditCard className="size-4 text-primary" /> Schedule
                                </span>
                            }
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start date</Label>
                                <Input id="start_date" type="date" max={new Date().toISOString().slice(0, 10)} value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required />
                                <InputError message={errors.start_date} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due date (optional)</Label>
                                <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                                <InputError message={errors.due_date} />
                            </div>
                        </div>
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Add debt
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href="/budgets/debts">Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
