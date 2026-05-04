import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Bell, BellRing, Calendar, CheckCheck, CheckCircle, Info, X, type LucideIcon } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'unread' | 'read' | 'dismissed';
    created_at: string;
    budget?: { id: number; name: string } | null;
}

interface Paginated<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: { current_page: number; from: number; last_page: number; per_page: number; to: number; total: number };
}

interface Props {
    notifications: Paginated<NotificationItem>;
    unreadCount: number;
    filters: { type?: string; status?: string; priority?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Analytics', href: '/budgets/analytics' },
    { title: 'Notifications', href: '/budgets/analytics/notifications' },
];

const priorityTone = (p: NotificationItem['priority']): 'danger' | 'warning' | 'info' | 'neutral' =>
    p === 'critical' ? 'danger' : p === 'high' ? 'warning' : p === 'medium' ? 'info' : 'neutral';

const typeIcon = (t: string): LucideIcon => {
    if (t.includes('overspend') || t.includes('limit')) return AlertTriangle;
    if (t.includes('upcoming') || t.includes('payment')) return Calendar;
    if (t.includes('insight') || t.includes('analytic')) return Info;
    return BellRing;
};

export default function NotificationsPage({ notifications, unreadCount, filters }: Props) {
    const setFilter = (key: 'type' | 'status' | 'priority', value: string) => {
        const next: Record<string, string | undefined> = { ...filters, [key]: value === 'all' ? undefined : value };
        router.get('/budgets/analytics/notifications', next, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <SoftPageHeader
                eyebrow="Alerts"
                eyebrowIcon={Bell}
                title="Notifications"
                gradientTitle
                description="Overspending, approaching limits, upcoming recurring payments, and unusual activity."
                actions={
                    <SoftButton variant="soft" icon={CheckCheck} onClick={() => router.put('/budgets/analytics/notifications/read-all')}>
                        Mark all read
                    </SoftButton>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <SoftStatCard label="Unread" value={unreadCount} icon={BellRing} iconTone={unreadCount > 0 ? 'warning' : 'success'} sub="Awaiting your attention" />
                <SoftStatCard label="Total this page" value={notifications.data.length} icon={Bell} iconTone="primary" />
                <SoftStatCard label="Critical" value={notifications.data.filter((n) => n.priority === 'critical').length} icon={AlertTriangle} iconTone="danger" />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader title="Filters" />
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-wrap gap-1.5">
                        {['all', 'unread', 'read', 'dismissed'].map((s) => (
                            <SoftButton key={s} size="sm" variant={(filters.status ?? 'all') === s ? 'primary' : 'soft'} onClick={() => setFilter('status', s)} className="capitalize">
                                {s}
                            </SoftButton>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {['all', 'low', 'medium', 'high', 'critical'].map((p) => (
                            <SoftButton key={p} size="sm" variant={(filters.priority ?? 'all') === p ? 'primary' : 'soft'} onClick={() => setFilter('priority', p)} className="capitalize">
                                {p}
                            </SoftButton>
                        ))}
                    </div>
                </div>
            </SoftCard>

            <SoftCard padding="md">
                <SoftCardHeader title={`Notifications (${notifications.meta?.total ?? notifications.data.length})`} />
                {notifications.data.length === 0 ? (
                    <SoftEmptyState icon={Bell} title="You're all caught up" description="Nothing to review right now." />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {notifications.data.map((n) => {
                            const Icon = typeIcon(n.type);
                            return (
                                <li key={n.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap ${n.status === 'unread' ? 'border-primary/30 bg-primary/5' : 'border-border/60'}`}>
                                    <div className="flex min-w-0 items-start gap-3">
                                        <SoftIconTile icon={Icon} tone={priorityTone(n.priority)} size="sm" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="truncate font-medium">{n.title}</span>
                                                <SoftBadge tone={priorityTone(n.priority)}>{n.priority}</SoftBadge>
                                                {n.budget && <SoftBadge tone="neutral">{n.budget.name}</SoftBadge>}
                                                {n.status === 'unread' && <SoftBadge tone="primary" dot>new</SoftBadge>}
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{n.message}</p>
                                            <div className="text-muted-foreground mt-1 text-xs">{new Date(n.created_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        {n.status === 'unread' && (
                                            <SoftButton variant="ghost" size="icon-sm" aria-label="Mark read" onClick={() => router.put(`/budgets/analytics/notifications/${n.id}/read`)}>
                                                <CheckCircle />
                                            </SoftButton>
                                        )}
                                        {n.status !== 'dismissed' && (
                                            <SoftButton variant="ghost" size="icon-sm" aria-label="Dismiss" onClick={() => router.put(`/budgets/analytics/notifications/${n.id}/dismiss`)}>
                                                <X />
                                            </SoftButton>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {notifications.meta && notifications.meta.last_page > 1 && (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-muted-foreground text-sm">
                            Showing {notifications.meta.from} to {notifications.meta.to} of {notifications.meta.total}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {notifications.links.map((link, i) => (
                                <SoftButton key={i} variant={link.active ? 'primary' : 'soft'} size="sm" disabled={!link.url} asChild={!!link.url}>
                                    {link.url ? <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                                </SoftButton>
                            ))}
                        </div>
                    </div>
                )}
            </SoftCard>
        </AppLayout>
    );
}
