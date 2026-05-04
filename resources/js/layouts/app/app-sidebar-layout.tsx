import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 flex-1">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="soft-page-padding flex w-full min-w-0 max-w-full flex-col gap-5">{children}</div>
            </AppContent>
        </AppShell>
    );
}
