import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
    { title: 'Invite', href: '/users/invitations/create' },
];

interface Props {
    roleOptions: string[];
}

interface FormData {
    email: string;
    roles: string[];
}

export default function UsersInvite({ roleOptions }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        email: '',
        roles: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.invitations.store'));
    };

    const toggleRole = (name: string) => {
        const s = new Set(data.roles);
        if (s.has(name)) {
            s.delete(name);
        } else {
            s.add(name);
        }
        setData('roles', [...s]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invite user" />
            <div className="mx-auto max-w-xl space-y-6">
                <div className="flex items-start gap-3">
                    <div className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-soft-inset)]">
                        <Mail className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Invite by email</h1>
                        <p className="text-muted-foreground text-sm text-pretty">
                            Sends a secure link. After acceptance, the account stays in <strong>pending activation</strong> until an administrator sets it to
                            active.
                        </p>
                    </div>
                </div>
                <form onSubmit={submit} className="soft-card space-y-4 p-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            className="rounded-xl"
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="space-y-2">
                        <Label>Roles on activation</Label>
                        <div className="soft-card-inset flex flex-col gap-2 rounded-xl p-3">
                            {roleOptions.map((r) => (
                                <label key={r} className="flex items-center gap-2 text-sm">
                                    <Checkbox checked={data.roles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                                    {r}
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.roles} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing} className="rounded-xl">
                            {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Send invitation
                        </Button>
                        <Button type="button" variant="outline" className="rounded-xl" asChild>
                            <Link href={route('users.index')}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
