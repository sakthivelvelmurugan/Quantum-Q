import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, radius, shadows } from '../tokens';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full ${maxWidth} overflow-hidden border`}
        style={{
          backgroundColor: colors.burgundy850,
          borderColor: colors.burgundy600,
          borderRadius: radius.lg,
          boxShadow: shadows.modal,
        }}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-6 py-4 border-b" style={{ borderColor: colors.burgundy600 }}>
            <div>
              {title && <h3 className="text-lg font-semibold tracking-tight" style={{ color: colors.textPrimary }}>{title}</h3>}
              {subtitle && <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md cursor-pointer"
              style={{ color: colors.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 max-h-[calc(85vh-130px)] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t flex items-center justify-end gap-3" style={{ borderColor: colors.burgundy600, backgroundColor: colors.burgundy900 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
