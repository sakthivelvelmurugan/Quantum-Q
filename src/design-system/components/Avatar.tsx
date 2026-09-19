import React from 'react';
import { colors, radius } from '../tokens';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  status?: 'online' | 'synced' | 'busy' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  ring = true,
  status,
  className = '',
}) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  }[size];

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const statusColor = {
    online: colors.success,
    synced: colors.success,
    busy: colors.warning,
    offline: colors.neutral,
  }[status || 'online'];

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-medium ${sizeClass} ${
          ring ? 'ring-2 ring-[#800F2F]' : ''
        }`}
        style={{
          backgroundColor: colors.burgundy700,
          color: colors.textPrimary,
        }}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1A080D]"
          style={{ backgroundColor: statusColor }}
        />
      )}
    </div>
  );
};
