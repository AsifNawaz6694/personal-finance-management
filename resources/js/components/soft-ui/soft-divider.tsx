import * as React from 'react';
import { cn } from '@/lib/utils';

export function SoftDivider({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
    return <div role="separator" aria-orientation="horizontal" className={cn('soft-divider my-6', className)} {...rest} />;
}
