import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Calendar, Edit, Play, Repeat, Trash2 } from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftPageHeader,
    SoftStatCard,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Budget {
    id: number;
    name: string;
    currency: string;
    budget_period: string;
}

interface Category {
    id: number;
    name: string;
    type: string;
}

interface RecurringTransaction {
    id: number;
    title: string;
    description?: string | null;
    amount: number;
    type: 'income' | 'expense';
    interval: 'weekly' | 'monthly' | 'yearly';
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    day_of_week?: string | null;
    day_of_month?: number | null;
    month_of_year?: number | null;
    start_date: string;
    end_date?: string | null;
    last_processed_at?: string | null;
    next_process_at?: string | null;
    process_count: number;
    formatted_amount?: string;
    budget?: Budget;
    category?: Category | null;
}

interface Props {
    budget: Budget;
    recurringTransaction: RecurringTransaction;
}

const intervalDescription = (rt: RecurringTransaction): string => {
    if (rt.interval === 'weekly') return `Every week on ${rt.day_of_week ?? '—'}`;
    if (rt.interval === 'monthly') return `Every month on day ${rt.day_of_month ?? '—'}`;
    if (rt.interval === 'yearly') {
        const month = rt.month_of_year ? new Date(2024, rt.month_of_year - 1).toLocaleString('en', { month: 'long' }) : '—';
        return `Every year on ${month} ${rt.day_of_month ?? ''}`.trim();
    }
    return rt.interval;
};

const statusTone = (s: RecurringTransaction['status']): 'success' | 'warning' | 'neutral' =>
    s === 'active' ? 'success' : s === 'paused' ? 'warning' : 'neutral';

const symbol = (currency: string) => (currency === 'PKR' ? '₨' : currency === 'SAR' ? '﷼' : '');

export default function RecurringShow({ budget, recurringTransaction: rt }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Budgets', href: '/budgets' },
        { title: budget.name, href: `/budgets/${budget.id}` },
        { title: 'Recurring', href: `/budgets/${budget.id}/recurring-transactions` },
        { title: rt.title, href: `/budgets/${budget.id}/recurring-transactions/${rt.id}` },
    ];

    const sym = symbol(budget.currency);
    const isIncome = rt.type === 'income';

    const processNow = () => {
        if (confirm(`Generate a transaction now for "${rt.title}"?`)) {
            router.post(`/budgets/${budget.id}/recurring-transactions/${rt.id}/process`);
        }
    };

    const remove = () => {
        if (confirm(`Delete recurring transaction "${rt.title}"?`)) {
            router.delete(`/budgets/${budget.id}/recurring-transactions/${rt.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={rt.title} />

            <SoftPageHeader
                eyebrow={`${rt.interval} ${rt.type}`}
                eyebrowIcon={Repeat}
                title={rt.title}
                gradientTitle
                description={rt.description ?? `Recurring ${rt.type} on “${budget.name}”.`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        {rt.status === 'active' && (
                            <SoftButton variant="success" icon={Play} onClick={processNow}>
                                Process now
                            </SoftButton>
                        )}
                        <SoftButton asChild variant="soft" icon={Edit}>
                            <Link href={`/budgets/${budget.id}/recurring-transactions/${rt.id}/edit`}>Edit</Link>
                        </SoftButton>
                        <SoftButton variant="ghost" icon={Trash2} onClick={remove} className="text-destructive">
                            Delete
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SoftStatCard
                    label="Amount"
                    value={`${sym} ${Number(rt.amount).toLocaleString()}`}
                    icon={isIncome ? ArrowUpRight : ArrowDownRight}
                    iconTone={isIncome ? 'success' : 'warning'}
                />
                <SoftStatCard label="Interval" value={intervalDescription(rt)} icon={Repeat} iconTone="primary" />
                <SoftStatCard label="Status" value={rt.status} icon={Calendar} iconTone={statusTone(rt.status)} />
                <SoftStatCard label="Times processed" value={rt.process_count} icon={Calendar} iconTone="info" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <SoftCard padding="md">
                    <SoftCardHeader title="Schedule" />
                    <div className="grid gap-3 text-sm">
                        <Row label="Start date" value={new Date(rt.start_date).toLocaleDateString()} />
                        <Row label="End date" value={rt.end_date ? new Date(rt.end_date).toLocaleDateString() : '—'} />
                        <Row label="Last processed" value={rt.last_processed_at ? new Date(rt.last_processed_at).toLocaleString() : 'Never'} />
                        <Row label="Next occurrence" value={rt.next_process_at ? new Date(rt.next_process_at).toLocaleString() : 'Not scheduled'} />
                    </div>
                </SoftCard>

                <SoftCard padding="md">
                    <SoftCardHeader title="Context" />
                    <div className="grid gap-3 text-sm">
                        <Row
                            label="Budget"
                            value={
                                <Link href={`/budgets/${budget.id}`} className="text-primary underline">
                                    {budget.name}
                                </Link>
                            }
                        />
                        <Row label="Currency" value={budget.currency} />
                        <Row label="Category" value={rt.category ? <SoftBadge tone="neutral">{rt.category.name}</SoftBadge> : '—'} />
                        <Row label="Type" value={<SoftBadge tone={isIncome ? 'success' : 'warning'}>{rt.type}</SoftBadge>} />
                    </div>
                </SoftCard>
            </div>
        </AppLayout>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="border-border/60 flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
