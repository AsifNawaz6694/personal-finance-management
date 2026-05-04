import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';

interface Props {
    email: string;
    token: string;
}

interface FormData {
    name: string;
    password: string;
    password_confirmation: string;
}

export default function AcceptInvitation({ email, token }: Props) {
    const { name } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('invitation.accept', token));
    };

    return (
        <div className="relative min-h-svh overflow-hidden bg-[hsl(230_35%_97%)]">
            <Head title="Accept invitation" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,hsl(258_55%_58%/0.15),transparent_50%),radial-gradient(ellipse_at_100%_100%,hsl(187_65%_45%/0.12),transparent_45%)]" />
            <div className="relative z-10 flex min-h-svh items-center justify-center p-6">
                <div className="soft-card w-full max-w-md p-8">
                    <div className="mb-6 flex flex-col items-center text-center">
                        <div className="bg-primary/12 text-primary mb-3 flex size-12 items-center justify-center rounded-2xl">
                            <Mail className="size-6" />
                        </div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <AppLogoIcon className="size-5 fill-primary" />
                            {name}
                        </div>
                        <h1 className="text-xl font-bold">Join your workspace</h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            You&apos;re accepting as <span className="text-foreground font-medium">{email}</span>
                        </p>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="rounded-xl" autoFocus />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                className="rounded-xl"
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
                                className="rounded-xl"
                                autoComplete="new-password"
                            />
                        </div>
                        <Button type="submit" disabled={processing} className="w-full rounded-xl">
                            {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Create account
                        </Button>
                    </form>
                    <p className="text-muted-foreground mt-6 text-center text-sm">
                        <Link href={route('login')} className="text-primary font-medium hover:underline">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
