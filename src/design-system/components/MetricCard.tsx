import React from 'react';
import { colors, radius, transitions } from '../tokens';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  accent?: 'burgundy' | 'success' | 'warning' | 'danger';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`border p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: colors.burgundy800,
        borderColor: colors.burgundy600,
        borderRadius: radius.lg,
        transition: transitions.fast,
      }}
    >
      <p className="text-xs font-medium" style={{ color: colors.textMuted }}>{label}</p>
      <p className="text-2xl font-semibold tracking-tight mt-1" style={{ color: colors.textPrimary }}>{value}</p>
      {subtext && (
        <p className="text-[11px] font-normal mt-1" style={{ color: colors.textMuted }}>{subtext}</p>
      )}
      {trend && (
        <div className="flex items-center space-x-1 mt-1 text-[11px] font-medium">
          <span style={{ color: trend.isPositive ? colors.success : colors.danger }}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span style={{ color: colors.textMuted }}>vs last cycle</span>
        </div>
      )}
    </div>
  );
};
