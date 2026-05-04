import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { hasPermission } from '@/lib/can';
import { type BreadcrumbItem, type SharedData, type User as AuthUser } from '@/types';
import { usePage } from '@inertiajs/react';
import { Eye, Search, Shield, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Security', href: '#' },
    { title: 'Permissions', href: '/permissions' },
];

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    roles_count: number;
    roles: Array<{ name: string }>;
}

interface Props {
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
    roles: string[];
}

export default function PermissionsIndex({ permissions, groupedPermissions, roles }: Props) {
    const { auth } = usePage<SharedData>().props;
    const me = auth.user as AuthUser | null;

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;
        
        router.get('/permissions', { search }, { preserveState: true });
    };

    const getRoleBadgeColor = (count: number) => {
        if (count === 0) return 'bg-gray-100 text-gray-800';
        if (count === 1) return 'bg-blue-100 text-blue-800';
        if (count === 2) return 'bg-green-100 text-green-800';
        if (count === 3) return 'bg-orange-100 text-orange-800';
        return 'bg-purple-100 text-purple-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions Management" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Permissions Management</h1>
                        <p className="text-muted-foreground mt-2">
                            View and understand system permissions and their role assignments.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Search Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                name="search"
                                type="text"
                                placeholder="Search permissions..."
                                defaultValue={new URLSearchParams(window.location.search).get('search') || ''}
                                className="max-w-sm"
                            />
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{permissions.meta?.total || permissions.data.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{roles.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Grouped Permissions */}
                {Object.entries(groupedPermissions).map(([group, permissions]) => (
                    <Card key={group}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                {group}
                            </CardTitle>
                            <CardDescription>
                                {Object.keys(permissions).length} permissions in this group
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(permissions).map(([name, permission]) => (
                                    <div key={name} className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-mono text-sm">{name}</h4>
                                                <Badge variant="outline" className={getRoleBadgeColor(permission.roles_count)}>
                                                    {permission.roles_count} {permission.roles_count === 1 ? 'role' : 'roles'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {permission.description}
                                            </p>
                                            {permission.roles.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {permission.roles.map((role) => (
                                                        <Badge key={role} variant="secondary" className="text-xs">
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/permissions/${name}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View details</p>
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

                {/* Permissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Permissions</CardTitle>
                        <CardDescription>
                            Complete list of all system permissions with their role assignments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.data.map((permission) => (
                                    <TableRow key={permission.id}>
                                        <TableCell>
                                            <code className="rounded bg-muted px-2 py-1 text-sm">
                                                {permission.name}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {permission.name.split('.')[1]?.split('.')[0] || 'Other'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {permission.roles.length > 0 ? (
                                                    permission.roles.map((role) => (
                                                        <Badge key={role.name} variant="secondary" className="text-xs">
                                                            {role.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No roles</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/permissions/${permission.name}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {permissions.meta && permissions.meta.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {permissions.meta.from} to {permissions.meta.to} of {permissions.meta.total} results
                                </div>
                                <div className="flex gap-2">
                                    {permissions.links.map((link, index) => (
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
