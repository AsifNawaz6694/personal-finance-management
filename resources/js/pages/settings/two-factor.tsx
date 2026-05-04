import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Two-factor authentication', href: '/settings/two-factor' }];

interface Props {
    enabled: boolean;
}

interface EnableForm {
    code: string;
}

interface DisableForm {
    password: string;
}

export default function TwoFactorSettings({ enabled }: Props) {
    const enableForm = useForm<EnableForm>({ code: '' });
    const disableForm = useForm<DisableForm>({ password: '' });

    const requestCode: FormEventHandler = (e) => {
        e.preventDefault();
        enableForm.post(route('two-factor.enable-request'));
    };

    const confirmEnable: FormEventHandler = (e) => {
        e.preventDefault();
        enableForm.post(route('two-factor.enable-confirm'));
    };

    const disable: FormEventHandler = (e) => {
        e.preventDefault();
        disableForm.post(route('two-factor.disable'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-factor authentication" />
            <SettingsLayout>
                <div className="space-y-8">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                            <ShieldCheck className="text-primary size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium">Email two-factor authentication</h2>
                            <p className="text-muted-foreground mt-1 text-sm text-pretty">
                                After you enable this, each sign-in sends a one-time code to your email. Ideal if you work with sensitive
                                financial data.
                            </p>
                        </div>
                    </div>

                    {enabled ? (
                        <div className="space-y-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Two-factor is enabled for your account.</p>
                            <form onSubmit={disable} className="max-w-sm space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="disable_password">Confirm with your password to turn off</Label>
                                    <Input
                                        id="disable_password"
                                        type="password"
                                        value={disableForm.data.password}
                                        onChange={(e) => disableForm.setData('password', e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <InputError message={disableForm.errors.password} />
                                </div>
                                <Button type="submit" variant="destructive" disabled={disableForm.processing}>
                                    {disableForm.processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                    Disable two-factor
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <form onSubmit={requestCode}>
                                <Button type="submit" variant="secondary" disabled={enableForm.processing}>
                                    {enableForm.processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                    Email me a setup code
                                </Button>
                            </form>
                            <form onSubmit={confirmEnable} className="max-w-sm space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Enter the 6-digit code from your email</Label>
                                    <Input
                                        id="code"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={enableForm.data.code}
                                        onChange={(e) => enableForm.setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="tracking-widest"
                                    />
                                    <InputError message={enableForm.errors.code} />
                                </div>
                                <Button type="submit" disabled={enableForm.processing || enableForm.data.code.length < 6}>
                                    {enableForm.processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                    Confirm & enable
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
