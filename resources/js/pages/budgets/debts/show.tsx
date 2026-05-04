import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    Calendar,
    CreditCard,
    DollarSign,
    Edit,
    History,
    Percent,
    PiggyBank,
    TrendingDown,
} from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
    SoftProgress,
    SoftStatCard,
} from '@/components/soft-ui';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Repayment {
    id: number;
    amount: number;
    principal_amount: number;
    interest_amount: number;
    payment_date: string;
    status: string;
    notes?: string | null;
}

interface ScheduledPayment {
    date: string;
    amount: number;
    status: string;
}

interface Debt {
    id: number;
    name: string;
    description?: string;
    type: string;
    principal_amount: number;
    interest_rate: number;
    interest_type: string;
    current_balance: number;
    monthly_payment?: number;
    start_date: string;
    due_date?: string;
    status: string;
    lender?: string;
    account_number?: string;
    formatted_principal_amount: string;
    formatted_current_balance: string;
    formatted_monthly_payment: string;
    formatted_total_paid: string;
    progress_percentage: number;
    monthly_interest: number;
    estimated_payoff_date?: string;
    repayments: Repayment[];
}

interface Props {
    debt: Debt;
    scheduledPayments: ScheduledPayment[];
}

const statusTone = (status: string): 'info' | 'success' | 'danger' | 'warning' | 'neutral' => {
    switch (status) {
        case 'active':
            return 'info';
        case 'paid_off':
            return 'success';
        case 'defaulted':
            return 'danger';
        case 'restructured':
            return 'warning';
        default:
            return 'neutral';
    }
};

interface PaymentFormData {
    amount: string;
    payment_date: string;
    notes: string;
    [key: string]: string;
}

export default function DebtShow({ debt, scheduledPayments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Debts', href: '/budgets/debts' },
        { title: debt.name, href: `/budgets/debts/${debt.id}` },
    ];

    const progress = Math.min(debt.progress_percentage, 100);

    const { data, setData, post, processing, errors, reset } = useForm<PaymentFormData>({
        amount: debt.monthly_payment ? String(debt.monthly_payment) : '',
        payment_date: new Date().toISOString().slice(0, 10),
        notes: '',
    });

    const submitPayment: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/budgets/debts/${debt.id}/record-payment`, {
            onSuccess: () => reset('notes'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={debt.name} />

            <SoftPageHeader
                eyebrow={debt.type.replace('_', ' ')}
                eyebrowIcon={CreditCard}
                title={debt.name}
                gradientTitle
                description={debt.description ?? debt.lender ?? 'Debt detail'}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftBadge tone={statusTone(debt.status)}>{debt.status.replace('_', ' ')}</SoftBadge>
                        <SoftButton asChild variant="soft" icon={Edit}>
                            <Link href={`/budgets/debts/${debt.id}/edit`}>Edit</Link>
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SoftStatCard label="Principal" value={debt.formatted_principal_amount} icon={PiggyBank} iconTone="primary" />
                <SoftStatCard label="Current balance" value={debt.formatted_current_balance} icon={DollarSign} iconTone="warning" sub={`Monthly interest: ₨ ${Number(debt.monthly_interest).toFixed(2)}`} />
                <SoftStatCard label="Monthly payment" value={debt.formatted_monthly_payment} icon={Calendar} iconTone="info" />
                <SoftStatCard label="Interest rate" value={`${Number(debt.interest_rate).toFixed(2)}%`} icon={Percent} iconTone="warning" sub={debt.interest_type} />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader
                    title="Payoff progress"
                    subtitle={`Total paid: ${debt.formatted_total_paid}${debt.estimated_payoff_date ? ` • Est. payoff: ${new Date(debt.estimated_payoff_date).toLocaleDateString()}` : ''}`}
                    actions={<SoftBadge tone={progress >= 75 ? 'success' : progress >= 50 ? 'info' : progress >= 25 ? 'warning' : 'danger'}>{progress.toFixed(1)}% paid</SoftBadge>}
                />
                <SoftProgress value={progress} tone="success" label="Principal paid" showLabel sub={`${debt.formatted_principal_amount} principal`} />
            </SoftCard>

            <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <SoftCard padding="md">
                    <SoftCardHeader title={`Repayment history (${debt.repayments.length})`} subtitle="Past payments split into principal and interest." />
                    {debt.repayments.length === 0 ? (
                        <SoftEmptyState icon={History} title="No payments yet" description="Record your first payment to start tracking progress." />
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {debt.repayments.map((r) => (
                                <li key={r.id} className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <SoftIconTile icon={TrendingDown} tone="success" size="sm" />
                                        <div className="min-w-0">
                                            <div className="font-medium tabular-nums">₨ {Number(r.amount).toLocaleString()}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {new Date(r.payment_date).toLocaleDateString()} • Principal ₨ {Number(r.principal_amount).toLocaleString()} • Interest ₨ {Number(r.interest_amount).toLocaleString()}
                                            </div>
                                            {r.notes && <div className="text-muted-foreground mt-0.5 truncate text-xs italic">{r.notes}</div>}
                                        </div>
                                    </div>
                                    <SoftBadge tone="success">{r.status}</SoftBadge>
                                </li>
                            ))}
                        </ul>
                    )}
                </SoftCard>

                <div className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Record a payment" subtitle="Logs the entry and reduces the balance." />
                        <form onSubmit={submitPayment} className="flex flex-col gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="payment_amount">Amount (₨)</Label>
                                <Input id="payment_amount" type="number" step="0.01" min="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} required />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_date">Payment date</Label>
                                <Input id="payment_date" type="date" max={new Date().toISOString().slice(0, 10)} value={data.payment_date} onChange={(e) => setData('payment_date', e.target.value)} required />
                                <InputError message={errors.payment_date} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_notes">Notes (optional)</Label>
                                <Input id="payment_notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                                <InputError message={errors.notes} />
                            </div>
                            <SoftButton type="submit" loading={processing} variant="success" full>
                                Record payment
                            </SoftButton>
                        </form>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader title="Upcoming schedule" subtitle="Next 6 expected payments." />
                        {scheduledPayments.length === 0 ? (
                            <SoftEmptyState icon={Calendar} iconTone="muted" title="No schedule" description="Set a monthly payment to forecast upcoming dues." />
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {scheduledPayments.map((s, idx) => (
                                    <li key={idx} className="border-border/60 flex items-center justify-between gap-2 rounded-xl border p-2.5 text-sm">
                                        <span className="text-muted-foreground inline-flex items-center gap-2">
                                            <Calendar className="size-3.5" />
                                            {new Date(s.date).toLocaleDateString()}
                                        </span>
                                        <span className="font-semibold tabular-nums">₨ {Number(s.amount).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </SoftCard>
                </div>
            </div>
        </AppLayout>
    );
}
