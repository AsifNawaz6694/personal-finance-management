import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SoftComboboxOption {
    value: string;
    label: string;
    description?: string;
    /** Free-form group label that renders as a section heading. */
    group?: string;
}

interface SoftComboboxBaseProps {
    options: SoftComboboxOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
    /** Disable the built-in search input. */
    searchable?: boolean;
}

export interface SoftSingleComboboxProps extends SoftComboboxBaseProps {
    multiple?: false;
    value: string | null;
    onChange: (value: string) => void;
    /** Show a small × button inside the trigger to clear the value. */
    clearable?: boolean;
}

export interface SoftMultiComboboxProps extends SoftComboboxBaseProps {
    multiple: true;
    value: string[];
    onChange: (value: string[]) => void;
    /** Maximum number of selections; ignored if not provided. */
    max?: number;
}

export type SoftComboboxProps = SoftSingleComboboxProps | SoftMultiComboboxProps;

export function SoftCombobox(props: SoftComboboxProps) {
    const { options, placeholder = 'Select…', searchPlaceholder = 'Search…', emptyText = 'No matches.', disabled, className, id, searchable = true } = props;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [activeIdx, setActiveIdx] = React.useState(0);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter(
            (o) => o.label.toLowerCase().includes(q) || (o.description ?? '').toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
        );
    }, [options, query]);

    // Click-outside to close
    React.useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    // Reset query and focus search on open
    React.useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIdx(0);
            requestAnimationFrame(() => searchRef.current?.focus());
        }
    }, [open]);

    React.useEffect(() => {
        setActiveIdx(0);
    }, [query]);

    const isSelected = (v: string): boolean => (props.multiple ? props.value.includes(v) : props.value === v);

    const select = (opt: SoftComboboxOption) => {
        if (props.multiple) {
            const next = isSelected(opt.value) ? props.value.filter((v) => v !== opt.value) : [...props.value, opt.value];
            if (props.max && next.length > props.max) return;
            props.onChange(next);
            // Keep open for multi
        } else {
            props.onChange(opt.value);
            setOpen(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const opt = filtered[activeIdx];
            if (opt) select(opt);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const clear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (props.multiple) props.onChange([]);
        else (props as SoftSingleComboboxProps).onChange('');
    };

    // Render selected display
    const selectedLabels = React.useMemo(() => {
        if (props.multiple) {
            return options.filter((o) => props.value.includes(o.value));
        }
        const found = options.find((o) => o.value === props.value);
        return found ? [found] : [];
    }, [options, props]);

    const showClear =
        !disabled &&
        (props.multiple ? props.value.length > 0 : !!(props.value && (props as SoftSingleComboboxProps).clearable));

    // Group options
    const groupedFiltered = React.useMemo(() => {
        const groups = new Map<string | null, SoftComboboxOption[]>();
        for (const opt of filtered) {
            const k = opt.group ?? null;
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k)!.push(opt);
        }
        return Array.from(groups.entries());
    }, [filtered]);

    return (
        <div ref={rootRef} className={cn('relative w-full', className)}>
            <button
                id={id}
                type="button"
                onClick={() => !disabled && setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
                className={cn(
                    'soft-input flex items-center justify-between gap-2 text-left',
                    open && 'border-primary/50',
                    'min-h-11 h-auto py-1.5',
                )}
            >
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                    {selectedLabels.length === 0 ? (
                        <span className="text-muted-foreground truncate text-sm">{placeholder}</span>
                    ) : props.multiple ? (
                        selectedLabels.map((o) => (
                            <span
                                key={o.value}
                                className="bg-primary/15 text-primary inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold"
                            >
                                {o.label}
                                <span
                                    role="button"
                                    tabIndex={-1}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const next = (props.value as string[]).filter((v) => v !== o.value);
                                        props.onChange(next);
                                    }}
                                    className="hover:text-destructive"
                                    aria-label={`Remove ${o.label}`}
                                >
                                    <X className="size-3" />
                                </span>
                            </span>
                        ))
                    ) : (
                        <span className="truncate text-sm">{selectedLabels[0].label}</span>
                    )}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                    {showClear && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={clear}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Clear selection"
                        >
                            <X className="size-4" />
                        </span>
                    )}
                    <ChevronDown className={cn('text-muted-foreground size-4 transition-transform', open && 'rotate-180')} />
                </span>
            </button>

            {open && (
                <div
                    role="listbox"
                    onKeyDown={onKeyDown}
                    className="bg-popover border-border/60 shadow-soft-lg absolute z-50 mt-1.5 w-full rounded-xl border outline-none"
                    style={{ boxShadow: 'var(--shadow-soft-lg)' }}
                >
                    {searchable && (
                        <div className="border-border/60 flex items-center gap-2 border-b px-3 py-2">
                            <Search className="text-muted-foreground size-4 shrink-0" />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder={searchPlaceholder}
                                className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
                            />
                            {query && (
                                <button type="button" onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search">
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="max-h-64 overflow-auto p-1">
                        {filtered.length === 0 ? (
                            <div className="text-muted-foreground px-3 py-6 text-center text-sm">{emptyText}</div>
                        ) : (
                            groupedFiltered.map(([group, opts], gi) => (
                                <div key={group ?? `group-${gi}`}>
                                    {group && <div className="text-muted-foreground px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.12em]">{group}</div>}
                                    {opts.map((opt) => {
                                        const idx = filtered.indexOf(opt);
                                        const active = idx === activeIdx;
                                        const selected = isSelected(opt.value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => select(opt)}
                                                onMouseEnter={() => setActiveIdx(idx)}
                                                className={cn(
                                                    'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition',
                                                    active && 'bg-muted',
                                                    selected && 'text-primary font-semibold',
                                                )}
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate">{opt.label}</span>
                                                    {opt.description && <span className="text-muted-foreground block truncate text-xs font-normal">{opt.description}</span>}
                                                </span>
                                                {props.multiple ? (
                                                    <span
                                                        className={cn(
                                                            'flex size-4 shrink-0 items-center justify-center rounded border',
                                                            selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border',
                                                        )}
                                                    >
                                                        {selected && <Check className="size-3" />}
                                                    </span>
                                                ) : (
                                                    selected && <Check className="text-primary size-4 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
