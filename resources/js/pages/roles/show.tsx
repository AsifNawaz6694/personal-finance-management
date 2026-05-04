import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { CheckCircle2, Edit, Mail, Shield, Trash2, Users } from 'lucide-react';
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

interface PermissionRef {
    id: number;
    name: string;
    guard_name?: string;
}

interface UserRef {
    id: number;
    name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: PermissionRef[];
    users: UserRef[];
}

interface PermissionCatalogRow {
    name: string;
    group: string;
    description: string;
}

interface Props {
    role: Role;
    permissionGroups: PermissionCatalogRow[];
}

export default function RoleShow({ role, permissionGroups }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
        { title: role.name, href: `/roles/${role.id}` },
    ];

    const permissionMap = useMemo(() => new Map(permissionGroups.map((p) => [p.name, p])), [permissionGroups]);
    const grantedNames = useMemo(() => new Set(role.permissions.map((p) => p.name)), [role.permissions]);

    const grouped = useMemo(() => {
        const map = new Map<string, PermissionCatalogRow[]>();
        for (const p of permissionGroups) {
            if (!map.has(p.group)) map.set(p.group, []);
            map.get(p.group)!.push(p);
        }
        return Array.from(map.entries());
    }, [permissionGroups]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role · ${role.name}`} />

            <SoftPageHeader
                eyebrow="Security"
                eyebrowIcon={Shield}
                title={role.name}
                gradientTitle
                description={`Guard: ${role.guard_name} · ${role.permissions.length} permissions, ${role.users.length} members.`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        <SoftButton asChild icon={Edit}>
                            <Link href={`/roles/${role.id}/edit`}>Edit role</Link>
                        </SoftButton>
                        <SoftButton
                            variant="ghost"
                            icon={Trash2}
                            className="text-destructive"
                            onClick={() => {
                                if (confirm(`Delete the "${role.name}" role?`)) router.delete(`/roles/${role.id}`);
                            }}
                        >
                            Delete
                        </SoftButton>
                    </div>
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <SoftStatCard label="Permissions" value={role.permissions.length} icon={Shield} iconTone="primary" sub={`of ${permissionGroups.length} total`} />
                <SoftStatCard label="Members" value={role.users.length} icon={Users} iconTone="info" sub="Users assigned" />
                <SoftStatCard label="Guard" value={role.guard_name} icon={CheckCircle2} iconTone="success" />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader title="Permissions" subtitle="Granted permissions are highlighted by group." />
                {grouped.length === 0 ? (
                    <SoftEmptyState icon={Shield} title="No permissions defined" description="No permissions are registered for this guard." />
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {grouped.map(([group, perms]) => {
                            const granted = perms.filter((p) => grantedNames.has(p.name));
                            return (
                                <div key={group} className="border-border/60 flex flex-col gap-2 rounded-xl border p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold">{group}</h3>
                                        <SoftBadge tone={granted.length === perms.length ? 'success' : granted.length > 0 ? 'info' : 'neutral'}>
                                            {granted.length}/{perms.length}
                                        </SoftBadge>
                                    </div>
                                    <ul className="flex flex-col gap-1.5">
                                        {perms.map((p) => {
                                            const has = grantedNames.has(p.name);
                                            return (
                                                <li
                                                    key={p.name}
                                                    className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs ${has ? 'bg-success/10' : 'opacity-60'}`}
                                                >
                                                    <CheckCircle2 className={`mt-0.5 size-3.5 shrink-0 ${has ? 'text-success' : 'text-muted-foreground'}`} />
                                                    <span className="min-w-0">
                                                        <code className="font-mono text-[11px] font-semibold">{p.name}</code>
                                                        {p.description && <p className="text-muted-foreground mt-0.5 leading-snug">{p.description}</p>}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SoftCard>

            <SoftCard padding="md">
                <SoftCardHeader title={`Members (${role.users.length})`} subtitle="Users with this role assigned." />
                {role.users.length === 0 ? (
                    <SoftEmptyState icon={Users} title="No members yet" description={`No one has been assigned the "${role.name}" role.`} />
                ) : (
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {role.users.map((u) => (
                            <li key={u.id} className="border-border/60 hover:border-primary/40 flex items-center gap-3 rounded-xl border p-3 transition">
                                <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase">
                                    {u.name.slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link href={route('users.edit', u.id)} className="hover:text-primary block truncate text-sm font-medium">
                                        {u.name}
                                    </Link>
                                    <div className="text-muted-foreground inline-flex items-center gap-1 truncate text-xs">
                                        <Mail className="size-3" />
                                        {u.email}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </SoftCard>
        </AppLayout>
    );
}
