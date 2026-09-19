import React from 'react';
import { colors, radius } from '../tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  style,
  icon,
  rightElement,
  ...props
}, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-3 flex items-center pointer-events-none" style={{ color: colors.textMuted }}>
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={`w-full h-10 text-sm outline-none border disabled:opacity-50 disabled:cursor-not-allowed ${
          icon ? 'pl-10' : 'pl-3'
        } ${rightElement ? 'pr-12' : 'pr-3'} ${className}`}
        style={{
          backgroundColor: colors.burgundy900,
          borderColor: colors.burgundy600,
          color: colors.textPrimary,
          borderRadius: radius.md,
          ...style,
        }}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-3 flex items-center">
          {rightElement}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
