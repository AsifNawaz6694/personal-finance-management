import React from 'react';
import { cn } from '@/lib/utils';

interface SoftUILayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'fluid' | 'narrow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const SoftUILayout: React.FC<SoftUILayoutProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md'
}) => {
  const getContainerClass = () => {
    switch (variant) {
      case 'fluid':
        return 'w-full';
      case 'narrow':
        return 'max-w-4xl mx-auto w-full';
      default:
        return 'max-w-7xl mx-auto w-full';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'px-4 py-6 sm:px-6 lg:px-8';
      case 'lg':
        return 'px-6 py-8 sm:px-8 lg:px-12';
      default:
        return 'px-4 py-8 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50',
      className
    )}>
      <div className={cn(
        getContainerClass(),
        getPaddingClass()
      )}>
        {children}
      </div>
    </div>
  );
};

interface SoftUISectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'gradient' | 'card';
}

export const SoftUISection: React.FC<SoftUISectionProps> = ({
  children,
  className,
  spacing = 'md',
  background = 'default'
}) => {
  const getSpacingClass = () => {
    switch (spacing) {
      case 'sm':
        return 'py-6';
      case 'lg':
        return 'py-12';
      case 'xl':
        return 'py-16';
      default:
        return 'py-8';
    }
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'muted':
        return 'bg-gray-50';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
      case 'card':
        return 'bg-white shadow-lg';
      default:
        return '';
    }
  };

  return (
    <section className={cn(
      getSpacingClass(),
      getBackgroundClass(),
      'transition-all duration-300',
      className
    )}>
      {children}
    </section>
  );
};

interface SoftUIGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const SoftUIGrid: React.FC<SoftUIGridProps> = ({
  children,
  className,
  cols = 1,
  gap = 'md',
  responsive = true
}) => {
  const getColsClass = () => {
    const baseCols = `grid-cols-${cols}`;
    if (!responsive) return baseCols;
    
    return `${baseCols} sm:grid-cols-${Math.min(cols, 2)} md:grid-cols-${Math.min(cols, 3)} lg:grid-cols-${cols}`;
  };

  const getGapClass = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4';
      case 'lg':
        return 'gap-8';
      case 'xl':
        return 'gap-12';
      default:
        return 'gap-6';
    }
  };

  return (
    <div className={cn(
      'grid',
      getColsClass(),
      getGapClass(),
      className
    )}>
      {children}
    </div>
  );
};

interface SoftUIFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

export const SoftUIFlex: React.FC<SoftUIFlexProps> = ({
  children,
  className,
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 'md'
}) => {
  const getDirectionClass = () => {
    return direction === 'col' ? 'flex-col' : 'flex-row';
  };

  const getAlignClass = () => {
    switch (align) {
      case 'start':
        return 'items-start';
      case 'end':
        return 'items-end';
      case 'stretch':
        return 'items-stretch';
      default:
        return 'items-center';
    }
  };

  const getJustifyClass = () => {
    switch (justify) {
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'between':
        return 'justify-between';
      case 'around':
        return 'justify-around';
      default:
        return 'justify-start';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 'sm':
        return 'gap-2';
      case 'lg':
        return 'gap-6';
      default:
        return 'gap-4';
    }
  };

  return (
    <div className={cn(
      'flex',
      getDirectionClass(),
      getAlignClass(),
      getJustifyClass(),
      wrap ? 'flex-wrap' : 'flex-nowrap',
      getGapClass(),
      className
    )}>
      {children}
    </div>
  );
};

interface SoftUIContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
}

export const SoftUIContainer: React.FC<SoftUIContainerProps> = ({
  children,
  className,
  size = 'lg',
  centered = true
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-6xl';
    }
  };

  return (
    <div className={cn(
      getSizeClass(),
      centered && 'mx-auto',
      'w-full px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
};

interface SoftUISpacerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  vertical?: boolean;
}

export const SoftUISpacer: React.FC<SoftUISpacerProps> = ({
  size = 'md',
  vertical = false
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return vertical ? 'h-2' : 'w-2';
      case 'lg':
        return vertical ? 'h-8' : 'w-8';
      case 'xl':
        return vertical ? 'h-12' : 'w-12';
      default:
        return vertical ? 'h-4' : 'w-4';
    }
  };

  return <div className={getSizeClass()} />;
};

interface SoftUIDividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: 'default' | 'muted' | 'primary';
}

export const SoftUIDivider: React.FC<SoftUIDividerProps> = ({
  className,
  orientation = 'horizontal',
  thickness = 'thin',
  color = 'default'
}) => {
  const getOrientationClass = () => {
    return orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full';
  };

  const getThicknessClass = () => {
    switch (thickness) {
      case 'medium':
        return orientation === 'vertical' ? 'w-0.5' : 'h-0.5';
      case 'thick':
        return orientation === 'vertical' ? 'w-1' : 'h-1';
      default:
        return orientation === 'vertical' ? 'w-px' : 'h-px';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'muted':
        return 'bg-gray-200';
      case 'primary':
        return 'bg-blue-200';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className={cn(
      getOrientationClass(),
      getThicknessClass(),
      getColorClass(),
      'my-4',
      className
    )} />
  );
};
