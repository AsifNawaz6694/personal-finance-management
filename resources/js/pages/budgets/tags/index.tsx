import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';
import {
    SoftBadge,
    SoftButton,
    SoftCard,
    SoftCardHeader,
    SoftCombobox,
    SoftDataTable,
    SoftPageHeader,
    SoftStatCard,
    type SoftDataTableColumn,
    type SoftDataTableSort,
    applyClientSort,
} from '@/components/soft-ui';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Edit, Plus, Tag, Trash2 } from 'lucide-react';

const breadcrumbs = [
    { title: 'Budget', href: '#' },
    { title: 'Tags', href: '/budgets/tags' },
];

interface TransactionTag {
    id: number;
    name: string;
    color?: string;
    description?: string;
    transactions_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    tags: TransactionTag[];
}

const PALETTE = [
    { name: 'blue', value: '#3b82f6' },
    { name: 'green', value: '#10b981' },
    { name: 'red', value: '#ef4444' },
    { name: 'yellow', value: '#f59e0b' },
    { name: 'purple', value: '#8b5cf6' },
    { name: 'orange', value: '#f97316' },
    { name: 'pink', value: '#ec4899' },
    { name: 'cyan', value: '#06b6d4' },
];

interface TagFormData {
    name: string;
    color: string;
    description: string;
    [key: string]: string;
}

function TagForm({
    initial,
    onCancel,
    onSubmitted,
    submitUrl,
    method = 'post',
    submitLabel,
}: {
    initial: { name: string; color: string; description: string };
    onCancel: () => void;
    onSubmitted: () => void;
    submitUrl: string;
    method?: 'post' | 'put';
    submitLabel: string;
}) {
    const { data, setData, post, put, processing, errors } = useForm<TagFormData>(initial);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => onSubmitted() };
        if (method === 'put') put(submitUrl, opts);
        else post(submitUrl, opts);
    };

    return (
        <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div className="space-y-2">
                <Label htmlFor="tag_name">Name</Label>
                <Input id="tag_name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Travel, Work" required />
                <InputError message={errors.name} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="tag_description">Description</Label>
                <Input id="tag_description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                <InputError message={errors.description} />
            </div>
            <div className="flex flex-wrap gap-1">
                {PALETTE.map((c) => (
                    <button
                        key={c.value}
                        type="button"
                        aria-label={c.name}
                        onClick={() => setData('color', c.name)}
                        className={`size-8 rounded-full ring-offset-2 transition ${data.color === c.name ? 'ring-2 ring-primary ring-offset-background' : 'opacity-80 hover:opacity-100'}`}
                        style={{ background: c.value }}
                    />
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:col-span-3">
                <SoftButton type="submit" loading={processing} icon={Plus}>
                    {submitLabel}
                </SoftButton>
                <SoftButton type="button" variant="soft" onClick={onCancel}>
                    Cancel
                </SoftButton>
            </div>
        </form>
    );
}

export default function TagsIndex({ tags }: Props) {
    const [search, setSearch] = useState('');
    const [colorFilter, setColorFilter] = useState<string[]>([]);
    const [sort, setSort] = useState<SoftDataTableSort | null>({ key: 'name', direction: 'asc' });
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const columns: SoftDataTableColumn<TransactionTag>[] = [
        {
            key: 'name',
            label: 'Tag',
            sortable: true,
            sortValue: (t) => t.name.toLowerCase(),
            render: (t) => {
                const colorEntry = PALETTE.find((p) => p.name === t.color);
                return (
                    <div className="flex min-w-0 items-center gap-3">
                        <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: colorEntry?.value ?? 'hsl(230 12% 60%)' }} />
                        <div className="min-w-0">
                            <div className="truncate font-medium">{t.name}</div>
                            {t.description && <div className="text-muted-foreground truncate text-xs">{t.description}</div>}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'transactions_count',
            label: 'Transactions',
            sortable: true,
            sortValue: (t) => t.transactions_count,
            render: (t) => <SoftBadge tone="info">{t.transactions_count}</SoftBadge>,
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            sortValue: (t) => new Date(t.created_at).getTime(),
            hideOnMobile: true,
            render: (t) => <span className="text-muted-foreground text-sm">{new Date(t.created_at).toLocaleDateString()}</span>,
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (t) => (
                <div className="flex justify-end gap-1">
                    <SoftButton variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditingId(t.id)}>
                        <Edit />
                    </SoftButton>
                    <SoftButton
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete"
                        className="text-destructive"
                        onClick={() => {
                            if (confirm(`Delete the "${t.name}" tag?`)) router.delete(`/budgets/tags/${t.id}`);
                        }}
                    >
                        <Trash2 />
                    </SoftButton>
                </div>
            ),
        },
    ];

    const filteredRows = useMemo(() => {
        let rows = tags;
        const q = search.trim().toLowerCase();
        if (q) rows = rows.filter((t) => t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
        if (colorFilter.length) rows = rows.filter((t) => t.color && colorFilter.includes(t.color));
        return applyClientSort(rows, sort, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tags, search, colorFilter, sort]);

    const totalTagged = tags.reduce((sum, t) => sum + t.transactions_count, 0);
    const editingTag = editingId !== null ? tags.find((t) => t.id === editingId) ?? null : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction tags" />

            <SoftPageHeader
                eyebrow="Tags"
                eyebrowIcon={Tag}
                title="Transaction tags"
                gradientTitle
                description="Custom labels to slice your transactions by project, vendor, or anything else."
                actions={
                    !creating && editingId === null ? (
                        <SoftButton icon={Plus} onClick={() => setCreating(true)}>
                            Create tag
                        </SoftButton>
                    ) : null
                }
            />

            {creating && (
                <SoftCard padding="md">
                    <SoftCardHeader title="New tag" />
                    <TagForm
                        initial={{ name: '', color: 'blue', description: '' }}
                        onCancel={() => setCreating(false)}
                        onSubmitted={() => setCreating(false)}
                        submitUrl="/budgets/tags"
                        method="post"
                        submitLabel="Create tag"
                    />
                </SoftCard>
            )}

            {editingTag && (
                <SoftCard padding="md">
                    <SoftCardHeader title={`Edit “${editingTag.name}”`} />
                    <TagForm
                        initial={{ name: editingTag.name, color: editingTag.color ?? 'blue', description: editingTag.description ?? '' }}
                        onCancel={() => setEditingId(null)}
                        onSubmitted={() => setEditingId(null)}
                        submitUrl={`/budgets/tags/${editingTag.id}`}
                        method="put"
                        submitLabel="Save changes"
                    />
                </SoftCard>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SoftStatCard label="Tags" value={tags.length} icon={Tag} iconTone="primary" />
                <SoftStatCard label="Tagged transactions" value={totalTagged} icon={Tag} iconTone="success" />
                <SoftStatCard
                    label="Most used"
                    value={tags.length ? [...tags].sort((a, b) => b.transactions_count - a.transactions_count)[0]?.name : '—'}
                    icon={Tag}
                    iconTone="info"
                />
            </div>

            <SoftDataTable<TransactionTag>
                rows={filteredRows}
                columns={columns}
                sort={sort}
                onSortChange={setSort}
                search={{ value: search, onChange: setSearch, placeholder: 'Search tags by name or description…' }}
                emptyIcon={Tag}
                emptyTitle="No tags match your filters"
                emptyAction={
                    <SoftButton icon={Plus} onClick={() => setCreating(true)}>
                        Create tag
                    </SoftButton>
                }
                filtersSlot={
                    <div className="w-full sm:w-52">
                        <SoftCombobox
                            multiple
                            value={colorFilter}
                            onChange={setColorFilter}
                            options={PALETTE.map((p) => ({ value: p.name, label: p.name.charAt(0).toUpperCase() + p.name.slice(1) }))}
                            placeholder="All colors"
                        />
                    </div>
                }
            />
        </AppLayout>
    );
}
