import React from 'react';
import { colors, radius, transitions } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  style,
  variant = 'primary',
  size = 'md',
  glow: _glow = false,
  isLoading = false,
  disabled,
  ...props
}, ref) => {
  const sizeClass = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-3.5 text-sm',
    lg: 'h-11 px-5 text-sm',
  }[size];

  let variantStyle: React.CSSProperties = {};

  if (variant === 'primary') {
    variantStyle = {
      backgroundColor: colors.burgundy500,
      color: '#FFFFFF',
    };
  } else if (variant === 'secondary') {
    variantStyle = {
      backgroundColor: colors.burgundy800,
      color: colors.textPrimary,
      border: `1px solid ${colors.burgundy600}`,
    };
  } else if (variant === 'ghost') {
    variantStyle = {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
    };
  } else if (variant === 'danger') {
    variantStyle = {
      backgroundColor: 'transparent',
      color: colors.danger,
      border: `1px solid ${colors.burgundy600}`,
    };
  } else if (variant === 'icon') {
    variantStyle = {
      backgroundColor: colors.burgundy800,
      color: colors.textSecondary,
      border: `1px solid ${colors.burgundy600}`,
      width: '32px',
      height: '32px',
      padding: '0',
    };
  }

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-medium select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:opacity-90 ${
        variant !== 'icon' ? sizeClass : 'inline-flex items-center justify-center'
      } ${className}`}
      style={{
        borderRadius: radius.md,
        transition: transitions.fast,
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
