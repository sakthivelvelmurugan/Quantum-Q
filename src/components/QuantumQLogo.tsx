import React from 'react';
import { colors } from '../design-system/tokens';

interface QuantumQLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuantumQLogo: React.FC<QuantumQLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`inline-flex items-center space-x-2 font-sans select-none ${className}`}>
      <div
        className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center rounded-md font-semibold`}
        style={{
          backgroundColor: colors.burgundy500,
          color: '#FFFFFF',
        }}
      >
        Q
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-semibold tracking-tight font-sans ${textSizes[size]}`}
            style={{ color: colors.textPrimary }}
          >
            Quantum-Q
          </span>
          <span
            className="text-[10px] mt-0.5"
            style={{ color: colors.textMuted }}
          >
            Talent Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
