import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SoftUICardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'neumorphic' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const SoftUICard: React.FC<SoftUICardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'neumorphic':
        return 'bg-white shadow-neumorphism';
      case 'glass':
        return 'bg-white/80 backdrop-blur-lg shadow-lg border border-white/20';
      case 'gradient':
        return 'bg-gradient-to-br from-white via-white to-gray-50 shadow-lg';
      default:
        return 'bg-white shadow-lg border border-gray-100';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-4';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const getHoverClass = () => {
    if (!hover && !clickable) return '';
    return 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1';
  };

  const getClickClass = () => {
    if (!clickable) return '';
    return 'cursor-pointer active:scale-98';
  };

  return (
    <div
      className={cn(
        'rounded-2xl',
        getVariantClass(),
        getPaddingClass(),
        getHoverClass(),
        getClickClass(),
        className
      )}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  );
};

interface SoftUICardHeaderProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
}

export const SoftUICardHeader: React.FC<SoftUICardHeaderProps> = ({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-500',
  actions
}) => {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn('p-3 rounded-xl bg-gray-50', iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

interface SoftUICardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const SoftUICardBody: React.FC<SoftUICardBodyProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
};

interface SoftUICardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const SoftUICardFooter: React.FC<SoftUICardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between pt-6 mt-6 border-t border-gray-100',
      className
    )}>
      {children}
    </div>
  );
};

interface SoftUIStatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  loading?: boolean;
}

export const SoftUIStatCard: React.FC<SoftUIStatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-500',
  className,
  loading = false
}) => {
  const getChangeColor = () => {
    switch (change?.type) {
      case 'increase':
        return 'text-green-600 bg-green-50';
      case 'decrease':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeIcon = () => {
    switch (change?.type) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <SoftUICard
      variant="neumorphic"
      hover={true}
      className={cn('relative overflow-hidden', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
          ) : (
            <div className="text-3xl font-bold text-gray-900 leading-tight">
              {value}
            </div>
          )}
          {change && (
            <div className={cn(
              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium mt-3',
              getChangeColor()
            )}>
              <span>{getChangeIcon()}</span>
              <span>{change.value}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl bg-gray-50', iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
    </SoftUICard>
  );
};

interface SoftUIProgressCardProps {
  title: string;
  current: number;
  total: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  className?: string;
}

export const SoftUIProgressCard: React.FC<SoftUIProgressCardProps> = ({
  title,
  current,
  total,
  color = 'primary',
  showPercentage = true,
  className
}) => {
  const percentage = Math.round((current / total) * 100);
  
  const getColorClass = () => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getProgressColor = () => {
    switch (color) {
      case 'success':
        return 'from-green-400 to-green-600';
      case 'warning':
        return 'from-yellow-400 to-yellow-600';
      case 'danger':
        return 'from-red-400 to-red-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <SoftUICard variant="neumorphic" className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">{percentage}%</span>
          )}
        </div>
        
        <div className="relative">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                'bg-gradient-to-r',
                getProgressColor()
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full pointer-events-none" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Current: {current}</span>
          <span className="text-gray-600">Total: {total}</span>
        </div>
      </div>
    </SoftUICard>
  );
};

interface SoftUIFeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
  className?: string;
}

export const SoftUIFeatureCard: React.FC<SoftUIFeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-500',
  onClick,
  className
}) => {
  return (
    <SoftUICard
      variant="glass"
      hover={true}
      clickable={!!onClick}
      onClick={onClick}
      className={cn('text-center group', className)}
    >
      {Icon && (
        <div className={cn(
          'w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100',
          'flex items-center justify-center group-hover:scale-110 transition-transform duration-300',
          iconColor
        )}>
          <Icon className="w-8 h-8" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </SoftUICard>
  );
};
