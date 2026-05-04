import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { notifications } = usePage<SharedData>().props;
    const unread = notifications?.unread ?? 0;

    return (
        <header className="bg-background/75 border-sidebar-border/60 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-16 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <div className="min-w-0 flex-1 overflow-hidden">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <Link
                href="/budgets/analytics/notifications"
                className="border-border/60 hover:border-primary/40 hover:text-primary relative inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition"
                aria-label="Notifications"
            >
                <Bell className="size-4" strokeWidth={1.75} />
                {unread > 0 && (
                    <span className="bg-destructive text-destructive-foreground absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </Link>
        </header>
    );
}
