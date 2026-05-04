import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Shield } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';

interface Props {
    email?: string | null;
}

interface FormData {
    code: string;
}

export default function TwoFactorChallenge({ email }: Props) {
    const { name } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors } = useForm<FormData>({ code: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('two-factor.verify'));
    };

    return (
        <div className="relative min-h-svh overflow-hidden bg-slate-950 text-slate-50">
            <Head title="Verify sign-in" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/50 via-slate-950 to-slate-950" />

            <div className="relative z-10 flex min-h-svh items-center justify-center p-6">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30">
                            <Shield className="size-6 text-emerald-300" />
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                            <AppLogoIcon className="size-6 fill-white" />
                            <span className="text-sm font-medium text-slate-300">{name}</span>
                        </div>
                        <h1 className="text-xl font-semibold text-white">Check your email</h1>
                        <p className="mt-2 text-sm text-slate-400">
                            We sent a 6-digit code {email ? <>to {email}</> : 'to your inbox'}. Enter it below to finish signing in.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-slate-200">
                                Verification code
                            </Label>
                            <Input
                                id="code"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                required
                                className="h-12 border-white/10 bg-slate-950/50 text-center text-2xl tracking-[0.5em] text-white focus-visible:ring-emerald-500/40"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                autoFocus
                            />
                            <InputError message={errors.code} />
                        </div>
                        <Button
                            type="submit"
                            disabled={processing || data.code.length < 6}
                            className="h-11 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950"
                        >
                            {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Verify & continue
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        <Link href={route('login')} className="text-emerald-300 hover:text-emerald-200">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
