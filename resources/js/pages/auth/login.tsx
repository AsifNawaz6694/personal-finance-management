import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, Lock, Mail, Sparkles } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AppLogoIcon from '@/components/app-logo-icon';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SharedData } from '@/types';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { name } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative min-h-svh overflow-hidden bg-slate-950 text-slate-50">
            <Head title="Sign in" />

            <div
                className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/40 blur-[120px]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-24 bottom-0 h-[24rem] w-[36rem] rounded-full bg-emerald-500/25 blur-[110px]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[100px]"
                aria-hidden
            />

            <div className="relative z-10 flex min-h-svh flex-col lg:flex-row">
                <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
                    <div className="mx-auto w-full max-w-md">
                        <div className="mb-10 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                <AppLogoIcon className="size-7 fill-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/90">Personal finance</p>
                                <p className="text-lg font-semibold tracking-tight text-white">{name}</p>
                            </div>
                        </div>

                        <div className="mb-8 space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200/90 backdrop-blur">
                                <Sparkles className="size-3.5" />
                                Secure workspace
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Welcome back</h1>
                            <p className="text-pretty text-sm leading-relaxed text-slate-400">
                                Sign in to manage budgets, track spending, and keep your financial picture crystal clear.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
                            <form className="flex flex-col gap-5" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-200">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            className="h-11 border-white/10 bg-slate-950/50 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/40"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="password" className="text-slate-200">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={route('password.request')}
                                                className="ml-auto text-xs text-emerald-300 hover:text-emerald-200"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            className="h-11 border-white/10 bg-slate-950/50 pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/40"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(v) => setData('remember', v === true)}
                                        tabIndex={3}
                                        className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-slate-950"
                                    />
                                    <Label htmlFor="remember" className="text-sm font-normal text-slate-300">
                                        Remember this device
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    tabIndex={4}
                                    disabled={processing}
                                    className="h-11 w-full bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400"
                                >
                                    {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                                    Sign in
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-slate-400">
                                New here?{' '}
                                <Link href={route('register')} className="font-medium text-emerald-300 hover:text-emerald-200">
                                    Create an account
                                </Link>
                            </p>
                        </div>

                        {status && <p className="mt-6 text-center text-sm font-medium text-emerald-300">{status}</p>}
                    </div>
                </div>

                <div className="relative hidden flex-1 items-stretch lg:flex">
                    <div className="m-6 flex flex-1 flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 text-white backdrop-blur-md">
                        <div>
                            <p className="text-sm font-medium text-emerald-200/90">Why teams choose us</p>
                            <h2 className="mt-4 max-w-md text-3xl font-semibold leading-tight tracking-tight">
                                Clarity for every dollar, without the spreadsheet chaos.
                            </h2>
                        </div>
                        <ul className="space-y-4 text-sm text-slate-200/90">
                            <li className="flex gap-3">
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                                Role-aware access so finance data stays on a need-to-know basis.
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                                Email-based two-factor authentication for sensitive operations.
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                                Guided onboarding that gets every teammate productive quickly.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
