import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Check, Eye, Inbox, Pencil, Plus, Send, Share2, Trash2, X } from 'lucide-react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftEmptyState,
    SoftIconTile,
    SoftPageHeader,
    SoftStatCard,
} from '@/components/soft-ui';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface BudgetSummary {
    id: number;
    name: string;
    currency: string;
    budget_year: number;
    budget_month: number;
}

interface UserSummary {
    id: number;
    name: string;
    email: string;
}

interface Share {
    id: number;
    budget_id: number;
    user_id: number;
    shared_by: number;
    permission: 'view' | 'edit';
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    accepted_at?: string | null;
    expires_at?: string | null;
    message?: string | null;
    created_at: string;
    budget?: BudgetSummary | null;
    user?: UserSummary | null;
    shared_by_user?: UserSummary | null;
    sharedBy?: UserSummary | null;
}

interface Props {
    received: Share[];
    sent: Share[];
    myBudgets: BudgetSummary[];
}

interface FormData {
    budget_id: string;
    email: string;
    permission: 'view' | 'edit';
    message: string;
    expires_at: string;
    [key: string]: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Budget', href: '#' },
    { title: 'Shared budgets', href: '/budgets/shares' },
];

const statusTone = (s: Share['status']): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (s) {
        case 'accepted':
            return 'success';
        case 'pending':
            return 'warning';
        case 'declined':
            return 'danger';
        default:
            return 'neutral';
    }
};

const monthLabel = (b?: BudgetSummary | null) =>
    b ? `${new Date(2024, b.budget_month - 1).toLocaleString('en', { month: 'short' })} ${b.budget_year}` : '';

export default function SharesIndex({ received, sent, myBudgets }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        budget_id: myBudgets[0] ? String(myBudgets[0].id) : '',
        email: '',
        permission: 'view',
        message: '',
        expires_at: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/budgets/shares', {
            onSuccess: () => reset('email', 'message', 'expires_at'),
        });
    };

    const pendingReceived = received.filter((s) => s.status === 'pending').length;
    const acceptedReceived = received.filter((s) => s.status === 'accepted').length;
    const sentActive = sent.filter((s) => s.status !== 'declined').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shared budgets" />

            <SoftPageHeader
                eyebrow="Sharing"
                eyebrowIcon={Share2}
                title="Shared budgets"
                gradientTitle
                description="Invite family or teammates to view or edit a budget — and manage invitations you receive."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard label="Pending invites" value={pendingReceived} icon={Inbox} iconTone={pendingReceived > 0 ? 'warning' : 'muted'} sub="Awaiting your response" />
                <SoftStatCard label="Active shares received" value={acceptedReceived} icon={Eye} iconTone="success" sub="Budgets you can view/edit" />
                <SoftStatCard label="Sent" value={sentActive} icon={Send} iconTone="primary" sub="Active invitations you've sent" />
            </div>

            <SoftCard padding="md">
                <SoftCardHeader title="Invite to a budget" subtitle="Pick a budget you own and the user's email." />
                {myBudgets.length === 0 ? (
                    <SoftEmptyState icon={Share2} title="You don't have any budgets" description="Create a budget first, then invite collaborators here." />
                ) : (
                    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]">
                        <div className="space-y-2">
                            <Label htmlFor="budget_id">Budget</Label>
                            <Select value={data.budget_id} onValueChange={(v) => setData('budget_id', v)}>
                                <SelectTrigger id="budget_id">
                                    <SelectValue placeholder="Select budget" />
                                </SelectTrigger>
                                <SelectContent>
                                    {myBudgets.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.name} • {monthLabel(b)} • {b.currency}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.budget_id} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Recipient email</Label>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="user@example.com" required />
                            <InputError message={errors.email} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="permission">Permission</Label>
                            <Select value={data.permission} onValueChange={(v) => setData('permission', v as 'view' | 'edit')}>
                                <SelectTrigger id="permission" className="min-w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="view">View only</SelectItem>
                                    <SelectItem value="edit">Edit</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.permission} />
                        </div>
                        <div className="flex items-end">
                            <SoftButton type="submit" loading={processing} icon={Plus} full>
                                Send invite
                            </SoftButton>
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="message">Personal message (optional)</Label>
                            <Input id="message" value={data.message} onChange={(e) => setData('message', e.target.value)} maxLength={500} />
                            <InputError message={errors.message} />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <Label htmlFor="expires_at">Expires on (optional)</Label>
                            <Input id="expires_at" type="date" min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)} value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} />
                            <InputError message={errors.expires_at} />
                        </div>
                    </form>
                )}
            </SoftCard>

            <SoftCard padding="md">
                <SoftCardHeader title={`Received (${received.length})`} subtitle="Invitations sent to you." />
                {received.length === 0 ? (
                    <SoftEmptyState icon={Inbox} title="No invitations yet" description="When someone shares a budget with you, it appears here." />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {received.map((s) => {
                            const inviter = s.sharedBy ?? s.shared_by_user;
                            return (
                                <li key={s.id} className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <SoftIconTile icon={s.permission === 'edit' ? Pencil : Eye} tone={s.permission === 'edit' ? 'primary' : 'info'} size="sm" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="truncate font-medium">{s.budget?.name ?? 'Budget'}</span>
                                                <SoftBadge tone={statusTone(s.status)}>{s.status}</SoftBadge>
                                                <SoftBadge tone="neutral">{s.permission}</SoftBadge>
                                                {s.budget && <SoftBadge tone="neutral">{s.budget.currency}</SoftBadge>}
                                            </div>
                                            <div className="text-muted-foreground mt-0.5 truncate text-xs">
                                                {inviter ? `From ${inviter.name} (${inviter.email})` : 'From another user'}
                                                {s.message ? ` • “${s.message}”` : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        {s.status === 'pending' && (
                                            <>
                                                <SoftButton variant="success" size="sm" icon={Check} onClick={() => router.put(`/budgets/shares/${s.id}/accept`)}>
                                                    Accept
                                                </SoftButton>
                                                <SoftButton variant="soft" size="sm" icon={X} onClick={() => router.put(`/budgets/shares/${s.id}/decline`)}>
                                                    Decline
                                                </SoftButton>
                                            </>
                                        )}
                                        <SoftButton
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label="Remove"
                                            onClick={() => {
                                                if (confirm('Remove this share?')) router.delete(`/budgets/shares/${s.id}`);
                                            }}
                                        >
                                            <Trash2 />
                                        </SoftButton>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SoftCard>

            <SoftCard padding="md">
                <SoftCardHeader title={`Sent (${sent.length})`} subtitle="Invitations you've sent to others." />
                {sent.length === 0 ? (
                    <SoftEmptyState icon={Send} title="You haven't shared anything yet" description="Use the form above to invite someone to a budget." />
                ) : (
                    <ul className="flex flex-col gap-2">
                        {sent.map((s) => (
                            <li key={s.id} className="border-border/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:flex-nowrap">
                                <div className="flex min-w-0 items-center gap-3">
                                    <SoftIconTile icon={s.permission === 'edit' ? Pencil : Eye} tone={s.permission === 'edit' ? 'primary' : 'info'} size="sm" />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="truncate font-medium">{s.budget?.name ?? 'Budget'}</span>
                                            <SoftBadge tone={statusTone(s.status)}>{s.status}</SoftBadge>
                                            <SoftBadge tone="neutral">{s.permission}</SoftBadge>
                                        </div>
                                        <div className="text-muted-foreground mt-0.5 truncate text-xs">
                                            To {s.user ? `${s.user.name} (${s.user.email})` : 'unknown user'}
                                            {s.expires_at ? ` • Expires ${new Date(s.expires_at).toLocaleDateString()}` : ''}
                                        </div>
                                    </div>
                                </div>
                                <SoftButton
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label="Revoke"
                                    onClick={() => {
                                        if (confirm('Revoke this share?')) router.delete(`/budgets/shares/${s.id}`);
                                    }}
                                >
                                    <Trash2 />
                                </SoftButton>
                            </li>
                        ))}
                    </ul>
                )}
            </SoftCard>
        </AppLayout>
    );
}
