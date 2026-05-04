import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Brain, CheckCircle, Clock, Info, Lightbulb, Target, X, type LucideIcon } from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftIconTile,
    SoftPageHeader,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Insight {
    id: number;
    type: string;
    title: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'active' | 'acknowledged' | 'dismissed';
    analysis_date: string;
    period_start: string;
    period_end: string;
    data?: Record<string, unknown>;
    recommendations?: string[];
    budget?: { id: number; name: string } | null;
}

interface Props {
    analytics: Insight;
}

const severityTone = (s: Insight['severity']): 'danger' | 'warning' | 'info' => (s === 'critical' ? 'danger' : s === 'warning' ? 'warning' : 'info');
const severityIcon = (s: Insight['severity']): LucideIcon => (s === 'critical' ? AlertTriangle : s === 'warning' ? Clock : Info);

export default function AnalyticsShow({ analytics }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Budget', href: '#' },
        { title: 'Analytics', href: '/budgets/analytics' },
        { title: analytics.title, href: `/budgets/analytics/${analytics.id}` },
    ];

    const Icon = severityIcon(analytics.severity);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={analytics.title} />

            <SoftPageHeader
                eyebrow={analytics.type.replace('_', ' ')}
                eyebrowIcon={Brain}
                title={analytics.title}
                description={`${new Date(analytics.period_start).toLocaleDateString()} – ${new Date(analytics.period_end).toLocaleDateString()}`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        {analytics.status === 'active' && (
                            <>
                                <SoftButton icon={CheckCircle} variant="success" onClick={() => router.put(`/budgets/analytics/${analytics.id}/acknowledge`)}>
                                    Acknowledge
                                </SoftButton>
                                <SoftButton icon={X} variant="soft" onClick={() => router.put(`/budgets/analytics/${analytics.id}/dismiss`)}>
                                    Dismiss
                                </SoftButton>
                            </>
                        )}
                    </div>
                }
            />

            <SoftCard padding="md">
                <div className="flex flex-wrap items-start gap-4">
                    <SoftIconTile icon={Icon} tone={severityTone(analytics.severity)} size="lg" />
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <SoftBadge tone={severityTone(analytics.severity)}>{analytics.severity}</SoftBadge>
                            <SoftBadge tone={analytics.status === 'active' ? 'warning' : analytics.status === 'acknowledged' ? 'info' : 'neutral'}>{analytics.status}</SoftBadge>
                            {analytics.budget && <SoftBadge tone="neutral">{analytics.budget.name}</SoftBadge>}
                        </div>
                        <p className="text-foreground text-base leading-relaxed">{analytics.description}</p>
                    </div>
                </div>
            </SoftCard>

            {analytics.recommendations && analytics.recommendations.length > 0 && (
                <SoftCard padding="md">
                    <SoftCardHeader
                        title={
                            <span className="flex items-center gap-2">
                                <Lightbulb className="size-4 text-primary" /> Recommendations
                            </span>
                        }
                    />
                    <ul className="flex flex-col gap-2">
                        {analytics.recommendations.map((rec, i) => (
                            <li key={i} className="border-border/60 flex items-start gap-3 rounded-xl border p-3">
                                <SoftIconTile icon={Target} tone="primary" size="sm" />
                                <p className="text-sm leading-relaxed">{rec}</p>
                            </li>
                        ))}
                    </ul>
                </SoftCard>
            )}

            {analytics.data && Object.keys(analytics.data).length > 0 && (
                <SoftCard padding="md">
                    <SoftCardHeader title="Raw data" subtitle="Underlying numbers used to generate this insight." />
                    <pre className="bg-muted/50 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">{JSON.stringify(analytics.data, null, 2)}</pre>
                </SoftCard>
            )}
        </AppLayout>
    );
}
