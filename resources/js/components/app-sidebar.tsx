import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { hasPermission } from '@/lib/can';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Activity, CreditCard, DollarSign, LayoutGrid, RefreshCw, Share2, Shield, Tags, TrendingUp, Users } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const mainNavItems: NavItem[] = [
        // Finance-first home
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
        { title: 'Budgets', url: '/budgets', icon: DollarSign },
        { title: 'Debts', url: '/budgets/debts', icon: CreditCard },
        { title: 'Recurring', url: '/budgets/recurring-transactions', icon: RefreshCw },
        { title: 'Transaction Tags', url: '/budgets/tags', icon: Tags },
        { title: 'Shared with me', url: '/budgets/shares', icon: Share2 },
        { title: 'Analytics & Insights', url: '/budgets/analytics', icon: TrendingUp },
        // Workspace
        { title: 'Activity', url: '/activity', icon: Activity },
    ];

    if (hasPermission(user, 'pfm.identity.users.view')) {
        mainNavItems.push({ title: 'Users', url: '/users', icon: Users });
    }
    if (hasPermission(user, 'pfm.security.roles.view')) {
        mainNavItems.push({ title: 'Roles & permissions', url: '/roles', icon: Shield });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
