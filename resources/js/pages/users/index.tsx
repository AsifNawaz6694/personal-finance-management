import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { MailPlus, Pencil, Plus, Search, Trash2, Users as UsersIcon } from 'lucide-react';

import {
    SoftBadge,
    SoftButton,
    SoftCombobox,
    SoftDataTable,
    SoftPageHeader,
    type SoftDataTableColumn,
    type SoftDataTableSort,
    applyClientSort,
} from '@/components/soft-ui';
import AppLayout from '@/layouts/app-layout';
import { hasPermission } from '@/lib/can';
import { type BreadcrumbItem, type Paginated, type SharedData, type User as AuthUser } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/users' }];

interface RoleRef {
    id: number;
    name: string;
}

interface ManagedUser {
    id: number;
    name: string;
    email: string;
    account_status: string;
    onboarding_completed_at: string | null;
    roles: RoleRef[];
}

interface Props {
    users: Paginated<ManagedUser>;
    roleOptions?: string[];
    accountStatuses?: { value: string; label: string }[];
}

const statusToTone = (s: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    if (s === 'active') return 'success';
    if (s === 'suspended') return 'danger';
    if (s === 'pending_activation') return 'warning';
    return 'neutral';
};

export default function UsersIndex({ users, roleOptions = [], accountStatuses = [] }: Props) {
    const { auth } = usePage<SharedData>().props;
    const me = auth.user as AuthUser | null;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'name', direction: 'asc' });

    const allRoleNames = useMemo(() => {
        if (roleOptions.length) return roleOptions;
        const set = new Set<string>();
        users.data.forEach((u) => u.roles.forEach((r) => set.add(r.name)));
        return Array.from(set).sort();
    }, [users.data, roleOptions]);

    const allStatusOptions = useMemo(() => {
        if (accountStatuses.length) return accountStatuses;
        const set = new Set<string>();
        users.data.forEach((u) => set.add(u.account_status));
        return Array.from(set).map((s) => ({ value: s, label: s.replace('_', ' ') }));
    }, [users.data, accountStatuses]);

    const columns: SoftDataTableColumn<ManagedUser>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            sortValue: (u) => u.name.toLowerCase(),
            render: (u) => (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase">
                        {u.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate font-medium">{u.name}</div>
                        <div className="text-muted-foreground truncate text-xs">{u.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'roles',
            label: 'Roles',
            hideOnMobile: true,
            render: (u) => (
                <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 ? (
                        <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                        u.roles.map((r) => (
                            <SoftBadge key={r.id} tone="neutral">
                                {r.name}
                            </SoftBadge>
                        ))
                    )}
                </div>
            ),
        },
        {
            key: 'account_status',
            label: 'Status',
            sortable: true,
            sortValue: (u) => u.account_status,
            render: (u) => <SoftBadge tone={statusToTone(u.account_status)}>{u.account_status.replace('_', ' ')}</SoftBadge>,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (u) => (
                <div className="flex justify-end gap-1">
                    {hasPermission(me, 'pfm.identity.users.update') && (
                        <SoftButton asChild variant="ghost" size="icon-sm" aria-label="Edit">
                            <Link href={route('users.edit', u.id)} prefetch>
                                <Pencil />
                            </Link>
                        </SoftButton>
                    )}
                    {hasPermission(me, 'pfm.identity.users.delete') && u.id !== me?.id && (
                        <SoftButton
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove"
                            className="text-destructive"
                            onClick={() => {
                                if (confirm(`Remove ${u.name}?`)) {
                                    router.delete(route('users.destroy', u.id));
                                }
                            }}
                        >
                            <Trash2 />
                        </SoftButton>
                    )}
                </div>
            ),
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = users.data;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.roles.some((r) => r.name.toLowerCase().includes(q)),
            );
        }
        if (statusFilter.length) rows = rows.filter((u) => statusFilter.includes(u.account_status));
        if (roleFilter.length) rows = rows.filter((u) => u.roles.some((r) => roleFilter.includes(r.name)));
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users.data, search, statusFilter, roleFilter, sort]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <SoftPageHeader
                eyebrow="Team"
                eyebrowIcon={UsersIcon}
                title="User management"
                gradientTitle
                description="Onboard teammates, control access, and manage account status."
                actions={
                    <div className="flex flex-wrap gap-2">
                        {hasPermission(me, 'pfm.identity.users.invite') && (
                            <SoftButton asChild variant="soft" icon={MailPlus}>
                                <Link href={route('users.invitations.create')}>Invite</Link>
                            </SoftButton>
                        )}
                        {hasPermission(me, 'pfm.identity.users.create') && (
                            <SoftButton asChild icon={Plus}>
                                <Link href={route('users.create')}>Add user</Link>
                            </SoftButton>
                        )}
                    </div>
                }
            />

            <SoftDataTable<ManagedUser>
                rows={filteredRows}
                columns={columns}
                paginator={users}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search users by name, email, or role…' }}
                emptyIcon={Search}
                emptyTitle="No users match your filters"
                emptyDescription="Try clearing search or removing filters."
                filtersSlot={
                    <>
                        <div className="w-full sm:w-56">
                            <SoftCombobox
                                multiple
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={allStatusOptions.map((s) => ({ value: s.value, label: s.label }))}
                                placeholder="All statuses"
                                searchPlaceholder="Filter statuses…"
                            />
                        </div>
                        <div className="w-full sm:w-56">
                            <SoftCombobox
                                multiple
                                value={roleFilter}
                                onChange={setRoleFilter}
                                options={allRoleNames.map((r) => ({ value: r, label: r }))}
                                placeholder="All roles"
                                searchPlaceholder="Filter roles…"
                            />
                        </div>
                    </>
                }
            />
        </AppLayout>
    );
}
