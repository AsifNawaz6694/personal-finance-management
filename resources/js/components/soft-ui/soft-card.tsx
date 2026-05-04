import * as React from 'react';
import { cn } from '@/lib/utils';

type SoftCardVariant = 'default' | 'flat' | 'inset' | 'gradient';
type SoftCardPadding = 'none' | 'sm' | 'md' | 'lg';

const variantClass: Record<SoftCardVariant, string> = {
    default: 'soft-card',
    flat: 'soft-card-flat',
    inset: 'soft-card-inset',
    gradient: 'soft-card-gradient',
};

const paddingClass: Record<SoftCardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
};

export interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: SoftCardVariant;
    padding?: SoftCardPadding;
    interactive?: boolean;
    asChild?: false;
}

export const SoftCard = React.forwardRef<HTMLDivElement, SoftCardProps>(function SoftCard(
    { variant = 'default', padding = 'md', interactive, className, ...rest },
    ref,
) {
    return (
        <div
            ref={ref}
            className={cn(
                variantClass[variant],
                paddingClass[padding],
                interactive && 'soft-card-hover cursor-pointer',
                className,
            )}
            {...rest}
        />
    );
});

export function SoftCardHeader({
    title,
    subtitle,
    actions,
    className,
    children,
    ...rest
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <div
            className={cn('mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}
            {...rest}
        >
            <div className="min-w-0">
                {title && <h3 className="text-base font-semibold leading-tight sm:text-lg">{title}</h3>}
                {subtitle && <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{subtitle}</p>}
                {children}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function SoftCardBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-4', className)} {...rest} />;
}

export function SoftCardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'border-border/60 mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
            {...rest}
        />
    );
}
