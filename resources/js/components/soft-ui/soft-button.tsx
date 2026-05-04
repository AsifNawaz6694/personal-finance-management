import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const softButton = cva(
    [
        'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium',
        'transition-[transform,box-shadow,background,color] duration-200 ease-out',
        'rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:translate-y-px',
    ].join(' '),
    {
        variants: {
            variant: {
                primary: 'soft-gradient-bar text-white tracking-wide uppercase text-xs shadow-[0_4px_14px_-4px_color-mix(in_srgb,hsl(258_75%_56%)_55%,transparent)] hover:-translate-y-px hover:shadow-[0_6px_20px_-6px_color-mix(in_srgb,hsl(258_75%_56%)_60%,transparent)]',
                success: 'soft-gradient-success text-white tracking-wide uppercase text-xs shadow-[0_4px_14px_-4px_color-mix(in_srgb,hsl(152_70%_40%)_55%,transparent)] hover:-translate-y-px',
                warning: 'soft-gradient-warning text-white tracking-wide uppercase text-xs shadow-[0_4px_14px_-4px_color-mix(in_srgb,hsl(38_95%_55%)_55%,transparent)] hover:-translate-y-px',
                info: 'soft-gradient-info text-white tracking-wide uppercase text-xs shadow-[0_4px_14px_-4px_color-mix(in_srgb,hsl(204_95%_50%)_55%,transparent)] hover:-translate-y-px',
                danger: 'soft-gradient-danger text-white tracking-wide uppercase text-xs shadow-[0_4px_14px_-4px_color-mix(in_srgb,hsl(0_75%_55%)_55%,transparent)] hover:-translate-y-px',
                soft: 'bg-card text-foreground tracking-wide uppercase text-xs border border-border/50 shadow-soft-sm hover:shadow-soft hover:-translate-y-px',
                outline: 'bg-transparent text-foreground tracking-wide uppercase text-xs border border-border hover:bg-muted',
                ghost: 'bg-transparent text-foreground hover:bg-muted',
                inset: 'soft-card-inset text-foreground hover:text-primary',
            },
            size: {
                sm: 'h-9 px-3 text-sm [&>svg]:size-4',
                md: 'h-10 px-4 text-sm [&>svg]:size-4',
                lg: 'h-12 px-6 text-base [&>svg]:size-5',
                icon: 'size-10 [&>svg]:size-5',
                'icon-sm': 'size-9 [&>svg]:size-4',
                'icon-lg': 'size-12 [&>svg]:size-5',
            },
            full: { true: 'w-full', false: '' },
        },
        defaultVariants: { variant: 'primary', size: 'md', full: false },
    },
);

export interface SoftButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof softButton> {
    asChild?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
}

export const SoftButton = React.forwardRef<HTMLButtonElement, SoftButtonProps>(function SoftButton(
    { className, variant, size, full, asChild, loading, icon: Icon, iconPosition = 'left', children, disabled, ...rest },
    ref,
) {
    const isDisabled = disabled || loading;
    const mergedClass = cn(softButton({ variant, size, full }), className);

    const renderInner = (innerChildren: React.ReactNode) => (
        <>
            {loading && <LoaderCircle className="animate-spin" aria-hidden />}
            {!loading && Icon && iconPosition === 'left' && <Icon aria-hidden />}
            {innerChildren}
            {!loading && Icon && iconPosition === 'right' && <Icon aria-hidden />}
        </>
    );

    if (asChild) {
        // Slot needs a single element child. Clone the child so the icon/spinner
        // are injected inside its own children — never as siblings of the slot.
        const child = React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>;
        const cloned = React.cloneElement(child, {
            children: renderInner(child.props.children),
        });
        return (
            <Slot ref={ref as React.Ref<HTMLButtonElement>} className={mergedClass} {...rest}>
                {cloned}
            </Slot>
        );
    }

    return (
        <button ref={ref} className={mergedClass} disabled={isDisabled} {...rest}>
            {renderInner(children)}
        </button>
    );
});

export { softButton };
