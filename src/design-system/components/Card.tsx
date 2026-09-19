import React from 'react';
import { colors, radius, transitions } from '../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  hoverable = false,
  padding = 'lg',
  variant = 'default',
  ...props
}) => {
  const paddingClass = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }[padding];

  const variantStyle = {
    default: {
      backgroundColor: colors.burgundy800,
      borderColor: colors.burgundy600,
    },
    elevated: {
      backgroundColor: colors.burgundy800,
      borderColor: colors.burgundy600,
    },
    glass: {
      backgroundColor: colors.burgundy800,
      borderColor: colors.burgundy600,
    },
  }[variant];

  return (
    <div
      className={`border ${paddingClass} ${hoverable ? 'cursor-pointer' : ''} ${className}`}
      style={{
        ...variantStyle,
        borderRadius: radius.lg,
        transition: transitions.fast,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
