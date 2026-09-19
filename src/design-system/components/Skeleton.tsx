import React from 'react';
import { colors, radius } from '../tokens';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
}) => {
  const roundedRadius = radius[rounded];

  return (
    <div
      className={`animate-pulse ${className}`}
      style={{
        backgroundColor: colors.burgundy700,
        borderRadius: roundedRadius,
        width,
        height,
      }}
    />
  );
};
