import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FullPageLayout from '@/layouts/full-page-layout';
import { hasPermission } from '@/lib/can';
import { type BreadcrumbItem, type SharedData, type User as AuthUser } from '@/types';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
    { title: 'Add user', href: '/users/create' },
];

interface Props {
    roleOptions: string[];
    accountStatuses: { value: string; label: string }[];
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    account_status: string;
    roles: string[];
    force_onboarding: boolean;
    phone: string;
    job_title: string;
    [key: string]: string | string[] | boolean;
}

export default function UsersCreate({ roleOptions, accountStatuses }: Props) {
    const { auth } = usePage<SharedData>().props;
    const me = auth.user as AuthUser | null;
    const canAssign = hasPermission(me, 'pfm.identity.users.assign-roles');

    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        account_status: 'active',
        roles: [],
        force_onboarding: false,
        phone: '',
        job_title: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const toggleRole = (name: string) => {
        const set = new Set(data.roles);
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        setData('roles', [...set]);
    };

    return (
        <FullPageLayout breadcrumbs={breadcrumbs} title="Add user">
            <Head title="Add user" />
            <div className="w-full max-w-none space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Add user</h1>
                    <p className="text-muted-foreground text-sm">Create an account and assign access.</p>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="account_status">Account status</Label>
                        <select
                            id="account_status"
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
                            value={data.account_status}
                            onChange={(e) => setData('account_status', e.target.value)}
                        >
                            {accountStatuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.account_status} />
                    </div>
                    {data.account_status === 'active' && (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="force_onboarding"
                                checked={data.force_onboarding}
                                onCheckedChange={(v) => setData('force_onboarding', v === true)}
                            />
                            <Label htmlFor="force_onboarding" className="text-sm font-normal">
                                Require onboarding wizard on first login
                            </Label>
                        </div>
                    )}
                    {canAssign && (
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="flex flex-col gap-2 rounded-md border p-3">
                                {roleOptions.map((r) => (
                                    <label key={r} className="flex items-center gap-2 text-sm">
                                        <Checkbox checked={data.roles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                                        {r}
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.roles} />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="job_title">Job title (optional)</Label>
                        <Input id="job_title" value={data.job_title} onChange={(e) => setData('job_title', e.target.value)} />
                        <InputError message={errors.job_title} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Save user
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('users.index')}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
            </FullPageLayout>
    );
}
