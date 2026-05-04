import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';

interface SimpleHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function SimpleHeader({ breadcrumbs = [] }: SimpleHeaderProps) {
    return (
        <>
            <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-6 transition-[width,height] ease-linear md:px-4">
                <div className="flex items-center gap-2 flex-1">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </header>
        </>
    );
}
