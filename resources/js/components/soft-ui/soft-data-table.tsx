import * as React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SoftButton } from './soft-button';
import { SoftEmptyState } from './soft-empty-state';
import { type LucideIcon } from 'lucide-react';

export interface SoftDataTableColumn<T> {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: string;
    /** Hide on small screens. */
    hideOnMobile?: boolean;
    render: (row: T, index: number) => React.ReactNode;
    /** Custom value extractor for client-side sorting. */
    sortValue?: (row: T) => string | number | Date | null | undefined;
}

export interface SoftDataTableSort {
    key: string;
    direction: 'asc' | 'desc';
}

export interface SoftDataTablePaginator {
    from: number | null;
    to: number | null;
    total: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface SoftDataTableProps<T> {
    /** Either client-side rows or paginator-aware rows; pass `paginator` to render the footer. */
    rows: T[];
    columns: SoftDataTableColumn<T>[];
    /** Lookup key for each row; defaults to `id`. */
    rowKey?: (row: T) => React.Key;
    /** Server-side paginator (Laravel shape). When provided, pagination footer renders. */
    paginator?: SoftDataTablePaginator;

    /** Search bar. Omit to hide. */
    search?: { value: string; onChange: (q: string) => void; placeholder?: string };
    /** Right-aligned filter slot — pass any controls (SoftCombobox, SoftBadge buttons, etc.). */
    filtersSlot?: React.ReactNode;
    /** Optional bulk-action / right-of-search slot (e.g. "Add new" button). */
    actionsSlot?: React.ReactNode;

    /** Client-side sorting controls; omit if rows are pre-sorted. */
    sort?: SoftDataTableSort | null;
    onSortChange?: (next: SoftDataTableSort) => void;

    /** Empty state customization. */
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: LucideIcon;
    emptyAction?: React.ReactNode;

    /** Row interactions. */
    onRowClick?: (row: T) => void;

    className?: string;
    /** Extra classes for the table-element itself. */
    tableClassName?: string;
}

const alignClass = (a?: 'left' | 'center' | 'right') => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

export function SoftDataTable<T>({
    rows,
    columns,
    rowKey,
    paginator,
    search,
    filtersSlot,
    actionsSlot,
    sort,
    onSortChange,
    emptyTitle = 'No results',
    emptyDescription = 'Try adjusting filters or your search terms.',
    emptyIcon,
    emptyAction,
    onRowClick,
    className,
    tableClassName,
}: SoftDataTableProps<T>) {
    const handleSort = (col: SoftDataTableColumn<T>) => {
        if (!col.sortable || !onSortChange) return;
        const isCurrent = sort?.key === col.key;
        const direction: 'asc' | 'desc' = isCurrent && sort?.direction === 'asc' ? 'desc' : 'asc';
        onSortChange({ key: col.key, direction });
    };

    const getKey = (row: T, idx: number): React.Key => {
        if (rowKey) return rowKey(row);
        const r = row as unknown as { id?: React.Key };
        return r.id ?? idx;
    };

    return (
        <div className={cn('soft-card flex flex-col gap-4 p-4 sm:p-5', className)}>
            {/* Header — search + filters + actions */}
            {(search || filtersSlot || actionsSlot) && (
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {search && (
                        <div className="soft-input flex h-11 items-center gap-2 px-3 lg:max-w-sm">
                            <Search className="text-muted-foreground size-4 shrink-0" />
                            <input
                                type="search"
                                value={search.value}
                                onChange={(e) => search.onChange(e.target.value)}
                                placeholder={search.placeholder ?? 'Search…'}
                                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
                            />
                            {search.value && (
                                <button type="button" onClick={() => search.onChange('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search">
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                    {(filtersSlot || actionsSlot) && (
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {filtersSlot}
                            {actionsSlot}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            {rows.length === 0 ? (
                <SoftEmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
            ) : (
                <div className="-mx-4 overflow-x-auto sm:-mx-5">
                    <table className={cn('w-full text-left text-sm', tableClassName)}>
                        <thead>
                            <tr className="border-border/60 border-b">
                                {columns.map((col) => {
                                    const isSorted = sort?.key === col.key;
                                    const Icon = !col.sortable ? null : isSorted ? (sort?.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                                    return (
                                        <th
                                            key={col.key}
                                            className={cn(
                                                'text-muted-foreground select-none px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em]',
                                                alignClass(col.align),
                                                col.hideOnMobile && 'hidden sm:table-cell',
                                                col.sortable && onSortChange && 'cursor-pointer hover:text-foreground',
                                            )}
                                            style={col.width ? { width: col.width } : undefined}
                                            onClick={() => handleSort(col)}
                                        >
                                            <span className={cn('inline-flex items-center gap-1.5', col.align === 'right' && 'flex-row-reverse')}>
                                                {col.label}
                                                {Icon && <Icon className={cn('size-3', isSorted ? 'text-primary' : 'opacity-60')} />}
                                            </span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr
                                    key={getKey(row, idx)}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                    className={cn(
                                        'border-border/40 hover:bg-muted/40 border-b last:border-0 transition',
                                        onRowClick && 'cursor-pointer',
                                    )}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn(
                                                'px-4 py-3 align-middle',
                                                alignClass(col.align),
                                                col.hideOnMobile && 'hidden sm:table-cell',
                                            )}
                                        >
                                            {col.render(row, idx)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination footer */}
            {paginator && paginator.last_page > 1 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted-foreground text-xs">
                        Showing <span className="text-foreground font-semibold">{paginator.from ?? 0}</span> to <span className="text-foreground font-semibold">{paginator.to ?? 0}</span> of <span className="text-foreground font-semibold">{paginator.total}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {paginator.links.map((link, i) => (
                            <SoftButton key={i} size="sm" variant={link.active ? 'primary' : 'soft'} disabled={!link.url} asChild={!!link.url}>
                                {link.url ? (
                                    <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </SoftButton>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/** Helper for client-side sort on an array of rows. */
export function applyClientSort<T>(rows: T[], sort: SoftDataTableSort | null | undefined, columns: SoftDataTableColumn<T>[]): T[] {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue ?? ((r: T) => (r as Record<string, unknown>)[sort.key] as string | number | Date | null | undefined);
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
    });
}
