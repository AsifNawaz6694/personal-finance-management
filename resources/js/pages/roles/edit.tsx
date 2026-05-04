import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';
import { Shield } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SoftBadge, SoftButton, SoftCard, SoftCardHeader, SoftPageHeader } from '@/components/soft-ui';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

interface PermissionRef {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: PermissionRef[];
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

interface FormData {
    name: string;
    description: string;
    permissions: string[];
    [key: string]: string | string[];
}

export default function RoleEdit({ role, permissionGroups }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: '/roles' },
        { title: role.name, href: `/roles/${role.id}` },
        { title: 'Edit', href: `/roles/${role.id}/edit` },
    ];

    const initialPermissions = role.permissions.map((p) => p.name);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: role.name,
        description: '',
        permissions: initialPermissions,
    });

    const grouped = useMemo(() => {
        const map = new Map<string, PermissionCatalogRow[]>();
        for (const p of permissionGroups) {
            if (!map.has(p.group)) map.set(p.group, []);
            map.get(p.group)!.push(p);
        }
        return Array.from(map.entries());
    }, [permissionGroups]);

    const togglePermission = (name: string) => {
        const set = new Set(data.permissions);
        if (set.has(name)) set.delete(name);
        else set.add(name);
        setData('permissions', Array.from(set));
    };

    const toggleGroup = (perms: PermissionCatalogRow[]) => {
        const set = new Set(data.permissions);
        const allHave = perms.every((p) => set.has(p.name));
        if (allHave) perms.forEach((p) => set.delete(p.name));
        else perms.forEach((p) => set.add(p.name));
        setData('permissions', Array.from(set));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/roles/${role.id}`);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title={`Edit ${role.name}`}>
            <Head title={`Edit ${role.name}`} />

            <div className="flex w-full flex-col gap-6">
                <SoftPageHeader
                    eyebrow="Security"
                    eyebrowIcon={Shield}
                    title={`Edit ${role.name}`}
                    description="Rename the role and toggle which permissions it grants."
                />

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <SoftCard padding="md">
                        <SoftCardHeader title="Basic info" />
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required disabled={role.name === 'super-admin'} />
                                <InputError message={errors.name} />
                                {role.name === 'super-admin' && (
                                    <p className="text-muted-foreground text-xs">The super-admin role cannot be renamed.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </SoftCard>

                    <SoftCard padding="md">
                        <SoftCardHeader
                            title="Permissions"
                            subtitle={`${data.permissions.length} of ${permissionGroups.length} granted`}
                            actions={<SoftBadge tone="primary">{data.permissions.length} granted</SoftBadge>}
                        />
                        {role.name === 'super-admin' && (
                            <p className="text-muted-foreground mb-4 text-xs">Super-admin always bypasses permission checks; toggling here has no effect.</p>
                        )}
                        <div className="grid gap-4 lg:grid-cols-2">
                            {grouped.map(([group, perms]) => {
                                const grantedCount = perms.filter((p) => data.permissions.includes(p.name)).length;
                                const allOn = grantedCount === perms.length;
                                return (
                                    <div key={group} className="border-border/60 flex flex-col gap-2 rounded-xl border p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold">{group}</h3>
                                            <SoftButton type="button" variant="ghost" size="sm" onClick={() => toggleGroup(perms)}>
                                                {allOn ? 'Clear all' : 'Select all'}
                                            </SoftButton>
                                        </div>
                                        <ul className="flex flex-col gap-1">
                                            {perms.map((p) => {
                                                const checked = data.permissions.includes(p.name);
                                                return (
                                                    <li key={p.name}>
                                                        <label className={`hover:bg-muted flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-xs transition ${checked ? 'bg-primary/5' : ''}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => togglePermission(p.name)}
                                                                className="accent-primary mt-0.5 size-4 shrink-0"
                                                            />
                                                            <span className="min-w-0">
                                                                <code className="font-mono text-[11px] font-semibold">{p.name}</code>
                                                                {p.description && <p className="text-muted-foreground mt-0.5 leading-snug">{p.description}</p>}
                                                            </span>
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                        <InputError className="mt-2" message={errors.permissions as string | undefined} />
                    </SoftCard>

                    <div className="flex flex-wrap items-center gap-2">
                        <SoftButton type="submit" loading={processing}>
                            Save changes
                        </SoftButton>
                        <SoftButton type="button" variant="soft" asChild>
                            <Link href={`/roles/${role.id}`}>Cancel</Link>
                        </SoftButton>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
