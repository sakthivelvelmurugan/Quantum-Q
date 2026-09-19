import React, { useState } from 'react';
import { colors, radius } from '../tokens';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 pointer-events-none px-2.5 py-1.5 text-xs font-normal border max-w-[240px] whitespace-normal animate-in fade-in duration-150 shadow-lg ${positionClasses}`}
          style={{
            backgroundColor: colors.burgundy950,
            borderColor: colors.burgundy600,
            color: colors.textPrimary,
            borderRadius: radius.md,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
