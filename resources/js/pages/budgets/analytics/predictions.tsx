import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, Brain, ChevronRight, Clock, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
    SoftProgress,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface BudgetSummary {
    id: number;
    name: string;
    currency: string;
    target_amount: number;
}

interface Prediction {
    budget: BudgetSummary;
    current_income: number;
    current_expenses: number;
    predicted_income: number;
    predicted_expenses: number;
    predicted_balance: number;
    confidence_level: 'low' | 'medium' | 'high';
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface Props {
    predictions: Prediction[];
    analysisDate: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Analytics', href: '/budgets/analytics' },
    { title: 'Predictions', href: '/budgets/analytics/predictions' },
];

const riskTone = (r: Prediction['risk_level']): 'success' | 'info' | 'warning' | 'danger' =>
    r === 'low' ? 'success' : r === 'medium' ? 'info' : r === 'high' ? 'warning' : 'danger';

const confidenceTone = (c: Prediction['confidence_level']): 'success' | 'info' | 'warning' =>
    c === 'high' ? 'success' : c === 'medium' ? 'info' : 'warning';

const symbol = (currency: string) => (currency === 'PKR' ? '₨' : currency === 'SAR' ? '﷼' : '');

export default function Predictions({ predictions, analysisDate }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Predictions" />

            <SoftPageHeader
                eyebrow={`As of ${new Date(analysisDate).toLocaleDateString()}`}
                eyebrowIcon={Brain}
                title="End-of-month predictions"
                gradientTitle
                description="Estimated income, expenses, and remaining balance based on current patterns and upcoming recurring transactions."
            />

            {predictions.length === 0 ? (
                <SoftCard padding="md">
                    <SoftEmptyState icon={Brain} title="No active budgets this month" description="Predictions appear when you have an active budget in the current month." />
                </SoftCard>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {predictions.map((p) => {
                        const sym = symbol(p.budget.currency);
                        const utilization = p.budget.target_amount > 0 ? (p.predicted_expenses / p.budget.target_amount) * 100 : 0;
                        const balanceTone = p.predicted_balance >= 0 ? 'success' : 'danger';
                        return (
                            <SoftCard key={p.budget.id} padding="md">
                                <SoftCardHeader
                                    title={p.budget.name}
                                    subtitle={`Target ${sym} ${Number(p.budget.target_amount).toLocaleString()} • ${p.budget.currency}`}
                                    actions={
                                        <div className="flex flex-wrap gap-1.5">
                                            <SoftBadge tone={confidenceTone(p.confidence_level)}>{p.confidence_level} confidence</SoftBadge>
                                            <SoftBadge tone={riskTone(p.risk_level)} icon={p.risk_level === 'critical' ? AlertTriangle : Clock}>
                                                {p.risk_level} risk
                                            </SoftBadge>
                                        </div>
                                    }
                                />

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="border-border/60 flex items-center gap-3 rounded-xl border p-3">
                                        <SoftIconTile icon={TrendingUp} tone="success" size="sm" />
                                        <div className="min-w-0">
                                            <div className="text-muted-foreground text-xs">Predicted income</div>
                                            <div className="truncate font-semibold tabular-nums">{sym} {Number(p.predicted_income).toLocaleString()}</div>
                                            <div className="text-muted-foreground text-xs">Now: {sym} {Number(p.current_income).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="border-border/60 flex items-center gap-3 rounded-xl border p-3">
                                        <SoftIconTile icon={TrendingDown} tone="warning" size="sm" />
                                        <div className="min-w-0">
                                            <div className="text-muted-foreground text-xs">Predicted expenses</div>
                                            <div className="truncate font-semibold tabular-nums">{sym} {Number(p.predicted_expenses).toLocaleString()}</div>
                                            <div className="text-muted-foreground text-xs">Now: {sym} {Number(p.current_expenses).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="border-border/60 flex items-center gap-3 rounded-xl border p-3 sm:col-span-2">
                                        <SoftIconTile icon={PiggyBank} tone={balanceTone} size="sm" />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-muted-foreground text-xs">Predicted end-of-month balance</div>
                                            <div className={`truncate text-lg font-bold tabular-nums ${p.predicted_balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                                                {sym} {Number(p.predicted_balance).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <SoftProgress value={Math.min(utilization, 100)} autoTone={{ warning: 80, danger: 100 }} label="Predicted budget utilization" sub={`${utilization.toFixed(0)}% of target`} showLabel />
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <SoftButton asChild variant="soft" size="sm" icon={ChevronRight} iconPosition="right">
                                        <Link href={`/budgets/${p.budget.id}`}>Open budget</Link>
                                    </SoftButton>
                                </div>
                            </SoftCard>
                        );
                    })}
                </div>
            )}
        </AppLayout>
    );
}
