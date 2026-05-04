import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FullPageLayout from '@/layouts/full-page-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Security', href: '#' },
    { title: 'Roles', href: '/roles' },
    { title: 'Create Role', href: '/roles/create' },
];

interface Props {
    permissionGroups: Array<{
        name: string;
        group: string;
        description: string;
    }>;
}

interface RoleFormData {
    name: string;
    permissions: string[];
    [key: string]: string | string[];
}

export default function RoleCreate({ permissionGroups }: Props) {
    const { data, setData, post, processing, errors } = useForm<RoleFormData>({
        name: '',
        permissions: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/roles');
    };

    const togglePermission = (permission: string) => {
        const current = new Set(data.permissions);
        if (current.has(permission)) {
            current.delete(permission);
        } else {
            current.add(permission);
        }
        setData('permissions', Array.from(current));
    };

    const toggleGroup = (group: string) => {
        const groupPermissions = permissionGroups
            .filter(p => p.group === group)
            .map(p => p.name);
        
        const current = new Set(data.permissions);
        const allSelected = groupPermissions.every(p => current.has(p));
        
        if (allSelected) {
            // Deselect all in group
            groupPermissions.forEach(p => current.delete(p));
        } else {
            // Select all in group
            groupPermissions.forEach(p => current.add(p));
        }
        
        setData('permissions', Array.from(current));
    };

    const groupedPermissions = permissionGroups.reduce((acc, permission) => {
        if (!acc[permission.group]) {
            acc[permission.group] = [];
        }
        acc[permission.group].push(permission);
        return acc;
    }, {} as Record<string, typeof permissionGroups>);

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Create Role">
            <Head title="Create Role" />
            
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Create New Role</h1>
                    <p className="text-muted-foreground text-sm">
                        Define a new role with specific permissions for access control.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Set the basic properties for this role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., content-manager"
                                    required
                                />
                                <InputError message={errors.name} />
                                <p className="text-xs text-muted-foreground">
                                    Use lowercase, hyphenated names for consistency.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Select the permissions that this role should have access to.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                <div key={group} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">{group}</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleGroup(group)}
                                        >
                                            {permissions.every(p => data.permissions.includes(p.name))
                                                ? 'Deselect All'
                                                : 'Select All'}
                                        </Button>
                                    </div>
                                    
                                    <div className="grid gap-3">
                                        {permissions.map((permission) => (
                                            <div
                                                key={permission.name}
                                                className="flex items-start space-x-3 rounded-lg border p-4"
                                            >
                                                <Checkbox
                                                    id={permission.name}
                                                    checked={data.permissions.includes(permission.name)}
                                                    onCheckedChange={() => togglePermission(permission.name)}
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <Label
                                                        htmlFor={permission.name}
                                                        className="text-sm font-medium cursor-pointer"
                                                    >
                                                        {permission.name}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {permission.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            {data.permissions.length > 0 && (
                                <div className="rounded-lg border p-4 bg-muted/50">
                                    <h4 className="text-sm font-medium mb-2">
                                        Selected Permissions ({data.permissions.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {data.permissions.map(permission => (
                                            <Badge key={permission} variant="secondary" className="text-xs">
                                                {permission}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <InputError message={errors.permissions} />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Role
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/roles">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </FullPageLayout>
    );
}
