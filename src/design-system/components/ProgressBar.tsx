import React, { useEffect, useState } from 'react';
import { colors, radius } from '../tokens';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'burgundy' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  variant = 'burgundy',
  className = '',
}) => {
  const [width, setWidth] = useState(0);
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 40);
    return () => clearTimeout(timer);
  }, [percentage]);

  const heightClass = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  }[size];

  let fillColor = colors.burgundy500;
  if (variant === 'success') {
    fillColor = colors.success;
  } else if (variant === 'warning') {
    fillColor = colors.warning;
  } else if (variant === 'danger') {
    fillColor = colors.danger;
  }

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <div
        className={`flex-1 overflow-hidden relative ${heightClass}`}
        style={{
          backgroundColor: colors.burgundy700,
          borderRadius: radius.full,
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-800 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium min-w-[36px] text-right" style={{ color: colors.textMuted }}>
          {percentage}%
        </span>
      )}
    </div>
  );
};
