import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { hasPermission } from '@/lib/can';
import { type BreadcrumbItem, type SharedData, type User as AuthUser } from '@/types';
import { usePage } from '@inertiajs/react';
import { Copy, Edit, Eye, Plus, Shield, Trash2, Users, Search, Settings, Key, Lock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Security', href: '#' },
    { title: 'Roles & Permissions', href: '/security' },
];

interface Role {
    id: number;
    name: string;
    guard_name: string;
    users_count: number;
    permissions_count: number;
    created_at: string;
    updated_at: string;
    users: Array<{ id: number; name: string; email: string }>;
    permissions: Array<{ name: string }>;
}

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
    roles: Array<{ name: string }>;
}

interface Props {
    roles: {
        data: Role[];
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
    permissions: {
        data: Permission[];
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
    groupedPermissions: Record<string, Record<string, {
        description: string;
        group: string;
        roles_count: number;
        roles: string[];
    }>>;
    rolePermissions: Record<string, string[]>;
    filters: {
        role: string;
        permission: string;
    };
    allRoles: string[];
}

export default function SecurityIndex({ 
    roles, 
    permissions, 
    groupedPermissions, 
    rolePermissions, 
    filters, 
    allRoles 
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as AuthUser;

    const [activeTab, setActiveTab] = useState('roles');
    const [roleFilter, setRoleFilter] = useState(filters.role);
    const [permissionFilter, setPermissionFilter] = useState(filters.permission);

    const applyRoleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('security.index'), { tab: 'roles', role: roleFilter || undefined }, { preserveState: true, replace: true });
    };

    const applyPermissionFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('security.index'), { tab: 'permissions', permission: permissionFilter || undefined }, { preserveState: true, replace: true });
    };

    const copyPermissionList = () => {
        const permissionText = permissions.data.map(p => p.name).join('\n');
        navigator.clipboard.writeText(permissionText);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            
            <div className="mx-auto max-w-7xl space-y-6 px-2 sm:px-0">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Shield className="size-3.5" />
                            Security management
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
                        <p className="text-muted-foreground mt-1 max-w-xl text-sm text-pretty">
                            Manage user roles and permissions to control access to application features.
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        {hasPermission(user, 'roles.create') && (
                            <Button asChild>
                                <Link href={route('roles.create')}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Role
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 rounded-lg bg-muted p-1">
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'roles'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Roles
                        </button>
                        <button
                            onClick={() => setActiveTab('permissions')}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'permissions'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Key className="h-4 w-4" />
                            Permissions
                        </button>
                    </div>

                    {/* Roles Tab */}
                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            {/* Role Filter */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Filter Roles</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={applyRoleFilter} className="flex gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor="role-filter" className="sr-only">
                                                Search roles
                                            </Label>
                                            <Input
                                                id="role-filter"
                                                type="text"
                                                placeholder="Search roles..."
                                                value={roleFilter}
                                                onChange={(e) => setRoleFilter(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" variant="outline">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Roles Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Roles ({roles.meta?.total || 0})</span>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={copyPermissionList}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Copy all roles list</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </CardTitle>
                                    <CardDescription>
                                        Manage user roles and their associated permissions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Users</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roles.data.map((role) => (
                                                <TableRow key={role.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                                                <Users className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{role.name}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {role.guard_name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary">
                                                                {role.users_count}
                                                            </Badge>
                                                            {hasPermission(user, 'roles.view') && role.users_count > 0 && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={route('roles.show', role.id)}>
                                                                        <Eye className="h-3 w-3" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline">
                                                                {role.permissions_count}
                                                            </Badge>
                                                            {hasPermission(user, 'roles.edit') && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={route('roles.edit', role.id)}>
                                                                        <Settings className="h-3 w-3" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(role.created_at).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {hasPermission(user, 'roles.edit') && (
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <Link href={route('roles.edit', role.id)}>
                                                                        <Edit className="h-3 w-3" />
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                            {hasPermission(user, 'roles.delete') && role.name !== 'Super Admin' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
                                                                            router.delete(route('roles.destroy', role.id));
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {roles.meta?.from || 0} to {roles.meta?.to || 0} of {roles.meta?.total || 0} results
                                            </div>
                                            <div className="flex gap-2">
                                                {roles.links.map((link, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        asChild={!!link.url}
                                                    >
                                                        {link.url ? (
                                                            <Link href={link.url || '#'}>
                                                                {link.label}
                                                            </Link>
                                                        ) : (
                                                            <span>{link.label}</span>
                                                        )}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Permissions Tab */}
                    {activeTab === 'permissions' && (
                        <div className="space-y-6">
                            {/* Permission Filter */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Filter Permissions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={applyPermissionFilter} className="flex gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor="permission-filter" className="sr-only">
                                                Search permissions
                                            </Label>
                                            <Input
                                                id="permission-filter"
                                                type="text"
                                                placeholder="Search permissions..."
                                                value={permissionFilter}
                                                onChange={(e) => setPermissionFilter(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" variant="outline">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Grouped Permissions */}
                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                    <Card key={group}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Lock className="h-5 w-5" />
                                                {group.charAt(0).toUpperCase() + group.slice(1)} Permissions
                                            </CardTitle>
                                            <CardDescription>
                                                {Object.keys(permissions).length} permissions in this group
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {Object.entries(permissions).map(([key, permission]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-start justify-between rounded-lg border p-3"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">{key}</div>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {permission.description}
                                                            </div>
                                                            <div className="mt-2">
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {permission.roles_count} roles
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="ml-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <Eye className="h-3 w-3" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="space-y-1">
                                                                            <p className="font-medium">Assigned to:</p>
                                                                            {permission.roles.length > 0 ? (
                                                                                <ul className="text-sm">
                                                                                    {permission.roles.map((role: string) => (
                                                                                        <li key={role}>{role}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            ) : (
                                                                                <p className="text-sm text-muted-foreground">No roles assigned</p>
                                                                            )}
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

// Temporary table components (same as in other files)
const Table = ({ children, className, ...props }: any) => (
    <div className="relative w-full overflow-auto">
        <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
            {children}
        </table>
    </div>
);

const TableHeader = ({ children, className, ...props }: any) => (
    <thead className={`[&_tr]:border-b ${className}`} {...props}>
        {children}
    </thead>
);

const TableBody = ({ children, className, ...props }: any) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>
        {children}
    </tbody>
);

const TableRow = ({ children, className, ...props }: any) => (
    <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`} {...props}>
        {children}
    </tr>
);

const TableHead = ({ children, className, ...props }: any) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`} {...props}>
        {children}
    </th>
);

const TableCell = ({ children, className, ...props }: any) => (
    <td className={`p-4 align-middle ${className}`} {...props}>
        {children}
    </td>
);
