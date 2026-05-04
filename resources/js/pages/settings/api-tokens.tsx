import { Head, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Copy, KeyRound, LoaderCircle, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'API tokens', href: '/settings/api-tokens' }];

interface TokenRow {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string;
}

interface Props {
    tokens: TokenRow[];
    plainToken: string | null;
}

export default function ApiTokens({ tokens, plainToken }: Props) {
    const [revealed, setRevealed] = useState(plainToken);
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    useEffect(() => {
        setRevealed(plainToken);
    }, [plainToken]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('api-tokens.store'), {
            onSuccess: () => reset('name'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="API tokens" />
            <SettingsLayout>
                <div className="space-y-8">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
                        <div className="bg-primary/12 text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-[var(--shadow-soft-inset)]">
                            <KeyRound className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Personal API tokens</h2>
                            <p className="text-muted-foreground mt-1 text-sm text-pretty">
                                Issue tokens for integrations and scripts. Treat them like passwords — they bypass the browser login flow when calling{' '}
                                <code className="rounded-md bg-muted px-1 py-0.5 text-xs">/api/*</code> with a Bearer header.
                            </p>
                        </div>
                    </motion.div>

                    {revealed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="soft-card border-emerald-500/30 bg-emerald-500/5 space-y-3 p-4"
                        >
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Copy this token now — it will not be shown again.</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <code className="bg-background max-w-full flex-1 overflow-x-auto rounded-xl border px-3 py-2 text-xs">{revealed}</code>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => void navigator.clipboard.writeText(revealed)}
                                >
                                    <Copy className="mr-1 size-4" />
                                    Copy
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setRevealed(null)}>
                                    Dismiss
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 }}
                        onSubmit={submit}
                        className="soft-card max-w-md space-y-4 p-5"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="token_name">Token name</Label>
                            <Input
                                id="token_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Mobile sync"
                                className="rounded-xl"
                                required
                            />
                            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                        </div>
                        <Button type="submit" disabled={processing} className="rounded-xl">
                            {processing && <LoaderCircle className="mr-2 size-4 animate-spin" />}
                            Generate token
                        </Button>
                    </motion.form>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Active tokens</h3>
                        <div className="space-y-2">
                            {tokens.length === 0 && <p className="text-muted-foreground text-sm">No tokens yet.</p>}
                            {tokens.map((t) => (
                                <motion.div
                                    key={t.id}
                                    layout
                                    className="soft-card-inset flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium">{t.name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            Created {new Date(t.created_at).toLocaleDateString()}
                                            {t.last_used_at && ` · Last used ${new Date(t.last_used_at).toLocaleString()}`}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => {
                                            if (confirm('Revoke this token?')) {
                                                router.delete(route('api-tokens.destroy', t.id));
                                            }
                                        }}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
