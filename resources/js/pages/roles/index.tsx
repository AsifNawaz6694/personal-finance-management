import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Edit, Eye, Plus, Shield, Trash2, Users } from 'lucide-react';

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
import { type BreadcrumbItem, type SharedData, type User as AuthUser } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Roles', href: '/roles' }];

interface Role {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    permissions: Array<{ name: string }>;
}

interface Props {
    roles: {
        data: Role[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        meta?: { from: number | null; to: number | null; total: number; last_page: number };
    };
    permissionGroups: Record<string, string[]>;
}

const permTone = (count: number): 'neutral' | 'info' | 'success' | 'primary' => {
    if (count === 0) return 'neutral';
    if (count <= 5) return 'info';
    if (count <= 10) return 'success';
    return 'primary';
};

export default function RolesIndex({ roles, permissionGroups }: Props) {
    const { auth } = usePage<SharedData>().props;
    const me = auth.user as AuthUser | null;
    const canManage = hasPermission(me, 'pfm.security.roles.sync');

    const [search, setSearch] = useState('');
    const [groupFilter, setGroupFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'name', direction: 'asc' });

    const groupOptions = useMemo(
        () => Object.keys(permissionGroups ?? {}).map((g) => ({ value: g, label: g })),
        [permissionGroups],
    );

    const columns: SoftDataTableColumn<Role>[] = [
        {
            key: 'name',
            label: 'Role',
            sortable: true,
            sortValue: (r) => r.name.toLowerCase(),
            render: (r) => (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                        <Shield className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <Link href={`/roles/${r.id}`} className="hover:text-primary block truncate font-medium">
                            {r.name}
                        </Link>
                        <div className="text-muted-foreground truncate text-xs">guard: {r.guard_name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'users_count',
            label: 'Members',
            sortable: true,
            sortValue: (r) => r.users_count,
            render: (r) => (
                <span className="inline-flex items-center gap-1.5 text-sm">
                    <Users className="text-muted-foreground size-3.5" />
                    {r.users_count}
                </span>
            ),
        },
        {
            key: 'permissions',
            label: 'Permissions',
            sortable: true,
            sortValue: (r) => r.permissions.length,
            render: (r) => <SoftBadge tone={permTone(r.permissions.length)}>{r.permissions.length}</SoftBadge>,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (r) => (
                <div className="flex justify-end gap-1">
                    <SoftButton asChild variant="ghost" size="icon-sm" aria-label="View">
                        <Link href={`/roles/${r.id}`}>
                            <Eye />
                        </Link>
                    </SoftButton>
                    {canManage && (
                        <SoftButton asChild variant="ghost" size="icon-sm" aria-label="Edit">
                            <Link href={`/roles/${r.id}/edit`}>
                                <Edit />
                            </Link>
                        </SoftButton>
                    )}
                    {canManage && (
                        <SoftButton
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete"
                            className="text-destructive"
                            onClick={() => {
                                if (confirm(`Delete the "${r.name}" role?`)) router.delete(`/roles/${r.id}`);
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
        let rows = roles.data;
        const q = search.trim().toLowerCase();
        if (q) {
            rows = rows.filter(
                (r) => r.name.toLowerCase().includes(q) || r.permissions.some((p) => p.name.toLowerCase().includes(q)),
            );
        }
        if (groupFilter.length) {
            const allowed = new Set<string>(groupFilter.flatMap((g) => permissionGroups[g] ?? []));
            rows = rows.filter((r) => r.permissions.some((p) => allowed.has(p.name)));
        }
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roles.data, search, groupFilter, sort]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles management" />

            <SoftPageHeader
                eyebrow="Security"
                eyebrowIcon={Shield}
                title="Roles management"
                gradientTitle
                description="Roles bundle permissions together to control access across the workspace."
                actions={
                    canManage ? (
                        <SoftButton asChild icon={Plus}>
                            <Link href="/roles/create">Create role</Link>
                        </SoftButton>
                    ) : null
                }
            />

            <SoftDataTable<Role>
                rows={filteredRows}
                columns={columns}
                paginator={roles.meta ? { ...roles.meta, links: roles.links } : undefined}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search roles or permission names…' }}
                emptyIcon={Shield}
                emptyTitle="No roles match your filters"
                filtersSlot={
                    groupOptions.length > 0 ? (
                        <div className="w-full sm:w-64">
                            <SoftCombobox
                                multiple
                                value={groupFilter}
                                onChange={setGroupFilter}
                                options={groupOptions}
                                placeholder="All permission groups"
                                searchPlaceholder="Filter groups…"
                            />
                        </div>
                    ) : null
                }
            />
        </AppLayout>
    );
}
