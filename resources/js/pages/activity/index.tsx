import { Head, router } from '@inertiajs/react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import {
    Activity as ActivityIcon,
    Eye,
    Globe,
    LogIn,
    type LucideIcon,
    PenLine,
    ScrollText,
    Shield,
    User,
} from 'lucide-react';
import {
    SoftBadge,
    SoftCombobox,
    SoftDataTable,
    SoftIconTile,
    SoftStatCard,
    type SoftDataTableColumn,
    type SoftDataTableSort,
    applyClientSort,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Activity', href: '/activity' }];

interface ActivityRow {
    id: number;
    log_name: string | null;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    properties: Record<string, unknown> | null;
    created_at: string;
    causer: { id: number; name: string; email: string } | null;
}

interface Props {
    activities: Paginated<ActivityRow>;
    filters: { log: string };
    logNames: string[];
    canViewAll: boolean;
}

const channelMeta: Record<string, { tone: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'muted'; icon: LucideIcon; label: string }> = {
    auth: { tone: 'success', icon: LogIn, label: 'Auth' },
    http: { tone: 'info', icon: Globe, label: 'HTTP' },
    application: { tone: 'primary', icon: PenLine, label: 'App' },
    security: { tone: 'danger', icon: Shield, label: 'Security' },
    default: { tone: 'muted', icon: ScrollText, label: 'Other' },
};

function metaFor(name: string | null) {
    if (!name) return channelMeta.default;
    return channelMeta[name] ?? { ...channelMeta.default, label: name };
}

function AnimatedNumber({ value }: { value: number }) {
    const mv = useMotionValue(0);
    const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
    useEffect(() => {
        const c = animate(mv, value, { duration: 1.0, ease: 'easeOut' });
        return c.stop;
    }, [mv, value]);
    return <motion.span>{rounded}</motion.span>;
}

function relativeTime(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
}

export default function ActivityIndex({ activities, filters, logNames, canViewAll }: Props) {
    const [search, setSearch] = useState('');
    const [logFilter, setLogFilter] = useState<string[]>(filters.log ? [filters.log] : []);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'created_at', direction: 'desc' });

    const onLogChange = (next: string[]) => {
        setLogFilter(next);
        const value = next.length === 1 ? next[0] : undefined;
        router.get('/activity', { log: value }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const totals = useMemo(() => {
        const byChannel: Record<string, number> = {};
        let today = 0;
        let withActor = 0;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        for (const r of activities.data) {
            const k = r.log_name ?? 'other';
            byChannel[k] = (byChannel[k] ?? 0) + 1;
            if (new Date(r.created_at) >= todayStart) today += 1;
            if (r.causer) withActor += 1;
        }
        return { byChannel, today, withActor };
    }, [activities.data]);

    const total = activities.total ?? activities.data.length;

    const columns: SoftDataTableColumn<ActivityRow>[] = [
        {
            key: 'description',
            label: 'Event',
            sortable: true,
            sortValue: (r) => r.description.toLowerCase(),
            render: (r) => {
                const m = metaFor(r.log_name);
                const Icon = m.icon;
                const hasProps = r.properties && Object.keys(r.properties).length > 0;
                return (
                    <div className="flex min-w-0 items-start gap-3">
                        <SoftIconTile icon={Icon} tone={m.tone} size="sm" />
                        <div className="min-w-0">
                            <p className="truncate font-medium">{r.description}</p>
                            {hasProps && (
                                <details className="group mt-1">
                                    <summary className="text-primary inline-flex cursor-pointer items-center gap-1 text-xs font-semibold hover:underline">
                                        <Eye className="size-3" /> View payload
                                    </summary>
                                    <pre className="text-muted-foreground bg-muted/50 mt-1.5 max-h-40 overflow-auto rounded-lg p-2.5 text-[11px] leading-relaxed">
                                        {JSON.stringify(r.properties, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'log_name',
            label: 'Channel',
            sortable: true,
            sortValue: (r) => r.log_name ?? '',
            hideOnMobile: true,
            render: (r) => {
                const m = metaFor(r.log_name);
                return <SoftBadge tone={m.tone === 'muted' ? 'neutral' : m.tone}>{m.label}</SoftBadge>;
            },
        },
        {
            key: 'causer',
            label: 'Actor',
            hideOnMobile: true,
            sortable: true,
            sortValue: (r) => r.causer?.name?.toLowerCase() ?? 'system',
            render: (r) =>
                r.causer ? (
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/15 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase">
                            {r.causer.name.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-xs font-medium">{r.causer.name}</div>
                            <div className="text-muted-foreground truncate text-[11px]">{r.causer.email}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                        <User className="size-3" /> system
                    </span>
                ),
        },
        {
            key: 'created_at',
            label: 'When',
            sortable: true,
            sortValue: (r) => new Date(r.created_at).getTime(),
            render: (r) => (
                <span className="text-muted-foreground whitespace-nowrap text-xs" title={new Date(r.created_at).toLocaleString()}>
                    {relativeTime(r.created_at)}
                </span>
            ),
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = activities.data;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (r) =>
                    r.description.toLowerCase().includes(q) ||
                    r.log_name?.toLowerCase().includes(q) ||
                    r.causer?.name?.toLowerCase().includes(q) ||
                    r.causer?.email?.toLowerCase().includes(q),
            );
        }
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activities.data, search, sort]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity center" />

            {/* HERO */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_10px_28px_-6px_rgba(20,20,50,0.18)] sm:p-8"
                style={{ background: 'var(--grad-info)' }}
            >
                <div className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-12 size-60 rounded-full bg-white/10 blur-3xl" />
                <div className="relative grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
                    <div>
                        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
                            <ScrollText className="size-3.5" /> Audit & activity
                        </span>
                        <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-[2rem]">
                            {canViewAll ? 'Workspace activity log' : 'Your activity history'}
                        </h1>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                            {canViewAll
                                ? 'Organization-wide stream of security, HTTP, auth, and domain events. Search, sort, and filter by channel.'
                                : 'Every action you take is logged here for transparency and security.'}
                        </p>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-3xl bg-white/15 blur-2xl" />
                            <div className="relative flex size-44 flex-col items-center justify-center rounded-3xl bg-white/15 backdrop-blur-md sm:size-52">
                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Total events</span>
                                <span className="mt-2 text-3xl font-bold tabular-nums sm:text-4xl">
                                    <AnimatedNumber value={total} />
                                </span>
                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                                    <ActivityIcon className="size-3" /> Live stream
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SoftStatCard label="Today" value={totals.today} icon={ActivityIcon} iconTone="primary" sub="Events recorded today" />
                <SoftStatCard label="Auth events" value={totals.byChannel.auth ?? 0} icon={LogIn} iconTone="success" sub="Sign-ins & sessions" />
                <SoftStatCard label="HTTP mutations" value={totals.byChannel.http ?? 0} icon={Globe} iconTone="info" sub="POST / PUT / DELETE" />
                <SoftStatCard label="With actor" value={totals.withActor} icon={User} iconTone="warning" sub="Tied to a user" />
            </div>

            <SoftDataTable<ActivityRow>
                rows={filteredRows}
                columns={columns}
                paginator={activities}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search events, channels, or actors…' }}
                emptyIcon={ScrollText}
                emptyTitle="No events match your filters"
                filtersSlot={
                    <div className="w-full sm:w-56">
                        <SoftCombobox
                            multiple
                            value={logFilter}
                            onChange={onLogChange}
                            options={logNames.map((n) => ({ value: n, label: metaFor(n).label }))}
                            placeholder="All channels"
                            searchPlaceholder="Filter channels…"
                            max={1}
                        />
                    </div>
                }
            />
        </AppLayout>
    );
}
