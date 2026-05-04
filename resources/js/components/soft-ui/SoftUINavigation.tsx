import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { LucideIcon, Menu, X, ChevronDown, User, Settings, LogOut, Bell, Search } from 'lucide-react';

interface SoftUINavigationProps {
  children: React.ReactNode;
  className?: string;
}

export const SoftUINavigation: React.FC<SoftUINavigationProps> = ({
  children,
  className
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const { auth } = usePage().props as any;
  const user = auth?.user;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav className={cn(
      'sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50',
      'shadow-sm transition-all duration-300',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">PFM</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Personal Finance Management
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/budgets" label="Budgets" />
              <NavLink href="/budgets/analytics" label="Analytics" />
              <NavLink href="/budgets/debts" label="Debts" />
              <NavLink href="/budgets/recurring-transactions" label="Recurring" />
            </div>
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Notifications */}
            <NotificationDropdown
              isOpen={isNotificationDropdownOpen}
              onToggle={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
            />

            {/* Profile Dropdown */}
            <ProfileDropdown
              user={user}
              isOpen={isProfileDropdownOpen}
              onToggle={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon, badge }) => {
  const { url } = usePage();
  const isActive = url === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
        'hover:bg-gray-100 hover:text-gray-900',
        isActive
          ? 'bg-blue-50 text-blue-600 shadow-sm'
          : 'text-gray-600'
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = "Search..."
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn(
      'relative transition-all duration-300',
      isFocused ? 'w-80' : 'w-64',
      className
    )}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        className={cn(
          'w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200',
          'bg-white/50 backdrop-blur-sm text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
          'transition-all duration-200',
          isFocused ? 'shadow-lg' : 'shadow-sm'
        )}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onToggle
}) => {
  const notifications = [
    { id: 1, title: "Budget exceeded", message: "Food budget exceeded by 20%", time: "2h ago", unread: true },
    { id: 2, title: "Recurring payment", message: "Rent payment due tomorrow", time: "1d ago", unread: true },
    { id: 3, title: "Insight available", message: "New spending insights generated", time: "3d ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="relative">
      <button
        type="button"
        className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} unread notifications
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                    notification.unread && 'bg-blue-50/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2',
                      notification.unread ? 'bg-blue-500' : 'bg-transparent'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface ProfileDropdownProps {
  user: any;
  isOpen: boolean;
  onToggle: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  isOpen,
  onToggle
}) => {
  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
            
            <div className="py-2">
              <DropdownItem href="/profile" icon={User} label="Profile" />
              <DropdownItem href="/settings" icon={Settings} label="Settings" />
            </div>

            <div className="py-2 border-t border-gray-200">
              <DropdownItem href="/logout" icon={LogOut} label="Log out" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface DropdownItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ href, icon: Icon, label }) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { url } = usePage();

  const mobileNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/budgets', label: 'Budgets', icon: '💰' },
    { href: '/budgets/analytics', label: 'Analytics', icon: '📈' },
    { href: '/budgets/debts', label: 'Debts', icon: '💳' },
    { href: '/budgets/recurring-transactions', label: 'Recurring', icon: '🔄' },
    { href: '/budgets/tags', label: 'Tags', icon: '🏷️' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">PFM</span>
            </div>
            <span className="text-lg font-bold text-gray-900">PFM</span>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                'hover:bg-gray-100 hover:text-gray-900',
                url === item.href
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-600'
              )}
              onClick={onClose}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

interface SoftUIBreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

export const SoftUIBreadcrumb: React.FC<SoftUIBreadcrumbProps> = ({
  items,
  className
}) => {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400">/</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface SoftUITabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    badge?: string | number;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export const SoftUITabNavigation: React.FC<SoftUITabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'default'
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'pills':
        return 'gap-2';
      case 'underline':
        return 'border-b border-gray-200';
      default:
        return 'border-b border-gray-200';
    }
  };

  const getTabClass = (isActive: boolean) => {
    const baseClass = 'flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 cursor-pointer';
    
    switch (variant) {
      case 'pills':
        return cn(
          baseClass,
          'rounded-xl border-2',
          isActive
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
        );
      case 'underline':
        return cn(
          baseClass,
          'border-b-2 -mb-px',
          isActive
            ? 'text-blue-600 border-blue-600'
            : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
        );
      default:
        return cn(
          baseClass,
          isActive
            ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
            : 'text-gray-600 hover:text-gray-900'
        );
    }
  };

  return (
    <div className={cn('flex', getVariantClass(), className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        
        return (
          <button
            key={tab.id}
            type="button"
            className={getTabClass(isActive)}
            onClick={() => onChange(tab.id)}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
