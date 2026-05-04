import { Head, Link } from '@inertiajs/react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
    SoftStatCard,
} from '@/components/soft-ui';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    AlertTriangle,
    Bell,
    Brain,
    CheckCircle,
    Clock,
    Filter,
    Info,
    TrendingDown,
    TrendingUp,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Analytics & Insights', href: '/budgets/analytics' },
];

interface Insight {
    id: number;
    type: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    analysis_date: string;
    period_start: string;
    period_end: string;
    data: unknown;
    recommendations: string[];
    budget?: { name: string };
}

interface SpendingPattern {
    id: number;
    category_name: string;
    period_type: string;
    period_start: string;
    period_end: string;
    total_spent: number;
    transaction_count: number;
    trend_percentage: number;
    is_anomalous: boolean;
}

interface Props {
    insights: {
        data: Insight[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta?: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    spendingPatterns: SpendingPattern[];
    filters: { type?: string; severity?: string; status?: string };
}

const severityTone = (severity: string): 'danger' | 'warning' | 'info' => {
    switch (severity) {
        case 'critical':
            return 'danger';
        case 'warning':
            return 'warning';
        default:
            return 'info';
    }
};

const severityIcon = (severity: string): LucideIcon => {
    switch (severity) {
        case 'critical':
            return AlertTriangle;
        case 'warning':
            return Clock;
        default:
            return Info;
    }
};

const statusIcon = (status: string): LucideIcon => {
    switch (status) {
        case 'active':
            return Brain;
        case 'acknowledged':
            return CheckCircle;
        case 'dismissed':
            return XCircle;
        default:
            return Info;
    }
};

const typeIcon = (type: string): LucideIcon => {
    switch (type) {
        case 'spending_trend':
            return TrendingUp;
        case 'budget_utilization':
            return AlertTriangle;
        case 'category_breakdown':
            return Brain;
        case 'monthly_comparison':
            return TrendingDown;
        case 'prediction':
            return Clock;
        case 'anomaly':
            return AlertTriangle;
        default:
            return Info;
    }
};

const typeLabel = (type: string) =>
    type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

export default function AnalyticsIndex({ insights, spendingPatterns, filters }: Props) {
    const significantPatterns = spendingPatterns.filter(
        (p) => p.is_anomalous || (p.trend_percentage && Math.abs(p.trend_percentage) >= 15),
    );

    const activeCount = insights.data.filter((i) => i.status === 'active').length;
    const criticalCount = insights.data.filter((i) => i.severity === 'critical' && i.status === 'active').length;
    const increasingCount = spendingPatterns.filter((p) => p.trend_percentage && p.trend_percentage > 0).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics & Insights" />

            <SoftPageHeader
                eyebrow="Insights"
                eyebrowIcon={Brain}
                title="Analytics & insights"
                gradientTitle
                description="Smart analysis of trends, anomalies, and predictions across every budget."
                actions={
                    <div className="flex gap-2">
                        <SoftButton asChild variant="soft" icon={Clock}>
                            <Link href="/budgets/analytics/predictions">Predictions</Link>
                        </SoftButton>
                        <SoftButton asChild variant="soft" icon={Bell}>
                            <Link href="/budgets/analytics/notifications">Notifications</Link>
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SoftStatCard label="Active insights" value={activeCount} icon={Brain} iconTone="primary" sub="Awaiting attention" />
                <SoftStatCard label="Critical alerts" value={criticalCount} icon={AlertTriangle} iconTone={criticalCount > 0 ? 'danger' : 'success'} sub="Need immediate action" />
                <SoftStatCard label="Anomalous patterns" value={significantPatterns.length} icon={TrendingUp} iconTone="warning" sub="Unusual spending detected" />
                <SoftStatCard label="Categories rising" value={increasingCount} icon={TrendingDown} iconTone="info" sub="Trend going up" />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader
                    title={
                        <span className="flex items-center gap-2">
                            <Filter className="size-4 text-primary" /> Filter insights
                        </span>
                    }
                />
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="type">Insight type</Label>
                        <Select name="type" defaultValue={filters.type}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="spending_trend">Spending trends</SelectItem>
                                <SelectItem value="budget_utilization">Budget utilization</SelectItem>
                                <SelectItem value="category_breakdown">Category breakdown</SelectItem>
                                <SelectItem value="monthly_comparison">Monthly comparison</SelectItem>
                                <SelectItem value="prediction">Predictions</SelectItem>
                                <SelectItem value="anomaly">Anomalies</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select name="severity" defaultValue={filters.severity}>
                            <SelectTrigger id="severity">
                                <SelectValue placeholder="All severities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All severities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={filters.status}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </SoftCard>

            <SoftCard padding="md">
                <SoftCardHeader
                    title={`Recent insights (${insights.meta?.total ?? insights.data.length})`}
                    subtitle="Generated insights about your financial patterns and recommendations."
                />
                {insights.data.length === 0 ? (
                    <SoftEmptyState icon={Brain} title="No insights yet" description="Insights are generated as you record more transactions and budgets." />
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {insights.data.map((insight) => {
                                    const TypeIcon = typeIcon(insight.type);
                                    const SeverityIcon = severityIcon(insight.severity);
                                    const StatusIcon = statusIcon(insight.status);
                                    return (
                                        <TableRow key={insight.id}>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-2 text-sm">
                                                    <TypeIcon className="size-4 text-muted-foreground" />
                                                    {typeLabel(insight.type)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-md">
                                                <div className="font-medium">{insight.title}</div>
                                                <div className="text-muted-foreground line-clamp-2 text-xs">{insight.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                {insight.budget ? (
                                                    <SoftBadge tone="neutral">{insight.budget.name}</SoftBadge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">All budgets</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <SoftBadge tone={severityTone(insight.severity)} icon={SeverityIcon}>
                                                    {insight.severity}
                                                </SoftBadge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5 text-sm capitalize">
                                                    <StatusIcon className="size-4 text-muted-foreground" />
                                                    {insight.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                                                {new Date(insight.analysis_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <SoftButton asChild variant="ghost" size="icon-sm" aria-label="View">
                                                        <Link href={`/budgets/analytics/${insight.id}`}>
                                                            <Brain />
                                                        </Link>
                                                    </SoftButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {insights.meta && insights.meta.last_page > 1 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-muted-foreground text-sm">
                            Showing {insights.meta.from || 0} to {insights.meta.to || 0} of {insights.meta.total || 0} results
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {insights.links.map((link, index) => (
                                <SoftButton key={index} variant={link.active ? 'primary' : 'soft'} size="sm" disabled={!link.url} asChild={!!link.url}>
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </SoftButton>
                            ))}
                        </div>
                    </div>
                )}
            </SoftCard>

            {significantPatterns.length > 0 && (
                <SoftCard padding="md">
                    <SoftCardHeader
                        title={
                            <span className="flex items-center gap-2">
                                <TrendingUp className="size-4 text-primary" /> Notable spending patterns
                            </span>
                        }
                        subtitle="Categories with unusual spending or significant trend changes."
                    />
                    <ul className="flex flex-col gap-2">
                        {significantPatterns.slice(0, 5).map((pattern) => {
                            const tone: 'danger' | 'warning' | 'success' = pattern.is_anomalous
                                ? 'danger'
                                : pattern.trend_percentage > 0
                                  ? 'warning'
                                  : 'success';
                            const Icon: LucideIcon = pattern.is_anomalous ? AlertTriangle : pattern.trend_percentage > 0 ? TrendingUp : TrendingDown;
                            return (
                                <li
                                    key={pattern.id}
                                    className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <SoftIconTile icon={Icon} tone={tone} size="sm" />
                                        <div className="min-w-0">
                                            <div className="truncate font-medium">{pattern.category_name}</div>
                                            <div className="text-muted-foreground truncate text-xs">
                                                {pattern.is_anomalous
                                                    ? 'Unusual spending detected'
                                                    : `${Math.abs(pattern.trend_percentage || 0)}% ${pattern.trend_percentage > 0 ? 'increase' : 'decrease'}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold tabular-nums">₨ {pattern.total_spent.toLocaleString()}</div>
                                        <div className="text-muted-foreground text-xs">{pattern.transaction_count} transactions</div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {significantPatterns.length > 5 && (
                        <div className="mt-4 text-center">
                            <SoftButton asChild variant="soft" size="sm">
                                <Link href="/budgets/analytics/spending-analysis">View all patterns</Link>
                            </SoftButton>
                        </div>
                    )}
                </SoftCard>
            )}
        </AppLayout>
    );
}
