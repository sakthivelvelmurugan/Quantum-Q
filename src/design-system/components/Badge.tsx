import React from 'react';
import { colors, radius } from '../tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'explicit' | 'inferred' | 'transferable' | 'default' | 'success' | 'warning' | 'danger' | 'burgundy' | 'outline';
  size?: 'sm' | 'md';
  prefixIcon?: React.ReactNode;
  confidence?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  style,
  variant = 'default',
  size = 'md',
  prefixIcon,
  confidence,
  ...props
}) => {
  let bg: string = colors.burgundy700;
  let text: string = colors.textSecondary;
  let border: string = colors.burgundy600;

  if (variant === 'inferred') {
    bg = colors.burgundy700;
    text = colors.textSecondary;
    border = colors.burgundy600;
  } else if (variant === 'transferable') {
    bg = colors.burgundy700;
    text = colors.textPrimary;
    border = colors.burgundy600;
  } else if (variant === 'success') {
    bg = 'transparent';
    text = colors.success;
    border = colors.burgundy600;
  } else if (variant === 'warning') {
    bg = 'transparent';
    text = colors.warning;
    border = colors.burgundy600;
  } else if (variant === 'danger') {
    bg = 'transparent';
    text = colors.danger;
    border = colors.burgundy600;
  } else if (variant === 'burgundy') {
    bg = colors.burgundy500;
    text = '#FFFFFF';
    border = colors.burgundy500;
  } else if (variant === 'outline') {
    bg = 'transparent';
    text = colors.textSecondary;
    border = colors.burgundy600;
  }

  const paddingClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center font-medium leading-none border whitespace-nowrap ${paddingClasses} ${className}`}
      style={{
        backgroundColor: bg,
        color: text,
        borderColor: border,
        borderRadius: radius.sm,
        ...style,
      }}
      {...props}
    >
      {prefixIcon}
      <span>{children}</span>
      {typeof confidence === 'number' && (
        <span className="ml-1.5 opacity-80 text-[10px]" style={{ color: text }}>
          {confidence}%
        </span>
      )}
    </span>
  );
};
