import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';

interface FullPageLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function FullPageLayout({ children, breadcrumbs = [], title }: FullPageLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="flex-1 p-6">
                    {title && (
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        </div>
                    )}
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
