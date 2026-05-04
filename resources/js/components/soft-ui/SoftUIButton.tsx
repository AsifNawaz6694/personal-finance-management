import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LoaderCircle } from 'lucide-react';

interface SoftUIButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
}

export const SoftUIButton: React.FC<SoftUIButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  onClick,
  type = 'button',
  href,
  target
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-200';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100';
      case 'outline':
        return 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'xl':
        return 'px-10 py-5 text-xl';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const getDisabledClass = () => {
    if (!disabled && !loading) return '';
    return 'opacity-50 cursor-not-allowed pointer-events-none';
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-7 h-7';
      default:
        return 'w-5 h-5';
    }
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-300',
    'relative overflow-hidden group',
    'shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    'focus:outline-none focus:ring-4 focus:ring-blue-500/20',
    getVariantClass(),
    getSizeClass(),
    getDisabledClass(),
    fullWidth && 'w-full',
    rounded ? 'rounded-full' : 'rounded-xl',
    className
  );

  const renderContent = () => (
    <>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Loading spinner */}
      {loading && (
        <LoaderCircle className={cn('animate-spin', getIconSize())} />
      )}
      
      {/* Icon */}
      {Icon && !loading && (
        <Icon className={cn('flex-shrink-0', getIconSize())} />
      )}
      
      {/* Button text */}
      {children && (
        <span className={cn(
          Icon && !loading && iconPosition === 'left' && 'ml-2',
          Icon && !loading && iconPosition === 'right' && 'mr-2',
          loading && 'ml-2'
        )}>
          {children}
        </span>
      )}
    </>
  );

  const buttonContent = (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {renderContent()}
    </button>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={baseClasses}
        onClick={onClick}
      >
        {renderContent()}
      </a>
    );
  }

  return buttonContent;
};

interface SoftUIIconButtonProps {
  icon: LucideIcon;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const SoftUIIconButton: React.FC<SoftUIIconButtonProps> = ({
  icon: Icon,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  tooltip,
  onClick,
  type = 'button'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'p-2';
      case 'lg':
        return 'p-4';
      default:
        return 'p-3';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100';
      case 'outline':
        return 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700';
    }
  };

  const button = (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300',
        'rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/20',
        getSizeClass(),
        getVariantClass(),
        (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
    >
      {loading ? (
        <LoaderCircle className={cn('animate-spin', getIconSize())} />
      ) : (
        <Icon className={cn('flex-shrink-0', getIconSize())} />
      )}
    </button>
  );

  return button;
};

interface SoftUIFloatingButtonProps {
  icon: LucideIcon;
  className?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onClick?: () => void;
  tooltip?: string;
}

export const SoftUIFloatingButton: React.FC<SoftUIFloatingButtonProps> = ({
  icon: Icon,
  className,
  variant = 'primary',
  position = 'bottom-right',
  onClick,
  tooltip
}) => {
  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'top-left':
        return 'top-8 left-8';
      default:
        return 'bottom-8 right-8';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-300';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-yellow-300';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-300';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-300';
    }
  };

  return (
    <button
      className={cn(
        'fixed z-50 w-14 h-14 rounded-full shadow-2xl',
        'flex items-center justify-center transition-all duration-300',
        'hover:scale-110 hover:shadow-3xl active:scale-95',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/20',
        getPositionClass(),
        getVariantClass(),
        className
      )}
      onClick={onClick}
      title={tooltip}
    >
      <Icon className="w-6 h-6" />
      
      {/* Pulse animation */}
      <div className={cn(
        'absolute inset-0 rounded-full animate-ping',
        getVariantClass().replace('text-white', 'text-white/20')
      )} />
    </button>
  );
};

interface SoftUIToggleButtonProps {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children?: React.ReactNode;
  icon?: LucideIcon;
}

export const SoftUIToggleButton: React.FC<SoftUIToggleButtonProps> = ({
  pressed,
  onChange,
  className,
  size = 'md',
  disabled = false,
  children,
  icon: Icon
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300',
        'rounded-xl border-2',
        getSizeClass(),
        pressed
          ? 'bg-blue-500 text-white border-blue-500 shadow-blue-200'
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      onClick={() => !disabled && onChange(!pressed)}
      disabled={disabled}
    >
      {Icon && (
        <Icon className={cn('flex-shrink-0', children && 'mr-2', getIconSize())} />
      )}
      {children}
    </button>
  );
};

interface SoftUIGroupButtonProps {
  options: Array<{
    value: string;
    label: string;
    icon?: LucideIcon;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills';
}

export const SoftUIGroupButton: React.FC<SoftUIGroupButtonProps> = ({
  options,
  value,
  onChange,
  className,
  size = 'md',
  variant = 'default'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-3 py-1.5';
      case 'lg':
        return 'text-lg px-6 py-3';
      default:
        return 'text-base px-4 py-2';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'pills':
        return 'gap-2';
      default:
        return 'divide-x divide-gray-200 rounded-xl overflow-hidden shadow-lg';
    }
  };

  const getButtonClass = (isActive: boolean, isFirst: boolean, isLast: boolean) => {
    const baseClass = 'flex items-center justify-center font-medium transition-all duration-300';
    const sizeClass = getSizeClass();
    
    if (variant === 'pills') {
      return cn(
        baseClass,
        sizeClass,
        'rounded-full border-2',
        isActive
          ? 'bg-blue-500 text-white border-blue-500'
          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
      );
    }
    
    return cn(
      baseClass,
      sizeClass,
      'flex-1',
      isFirst && 'rounded-l-xl',
      isLast && 'rounded-r-xl',
      isActive
        ? 'bg-blue-500 text-white'
        : 'bg-white text-gray-700 hover:bg-gray-50'
    );
  };

  return (
    <div className={cn('inline-flex', getVariantClass(), className)}>
      {options.map((option, index) => {
        const Icon = option.icon;
        const isActive = option.value === value;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        
        return (
          <button
            key={option.value}
            type="button"
            className={getButtonClass(isActive, isFirst, isLast)}
            onClick={() => onChange(option.value)}
          >
            {Icon && (
              <Icon className={cn(
                'flex-shrink-0',
                option.label && 'mr-2',
                size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
