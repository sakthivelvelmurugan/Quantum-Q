/**
 * Quantum-Q Design System Tokens
 * Theme: Burgundy / Premium Dark (Apple-inspired Hardware & Software Visual Language + Linear SaaS Polish)
 * 
 * Every component must import colors and design tokens from this file.
 * No hardcoded hex colors elsewhere in the codebase.
 */

export const darkColors = {
  burgundy950: '#120609', // Deepest background
  burgundy900: '#1A080D', // Main page background
  burgundy850: '#240B12', // Sidebar background
  burgundy800: '#310D17', // Card / input background
  burgundy700: '#481321', // Elevated surface / hover background
  burgundy600: '#641A2D', // Borders / dividers
  burgundy500: '#800F2F', // Primary CTA / main brand color
  burgundy400: '#9F1D3B', // Primary hover state
  burgundy300: '#C43A58', // Links / secondary highlights
  burgundy200: '#E08A9D', // Muted light text
  burgundy100: '#F5CBD5', // Bright labels / light text

  // Premium Burgundy Accents:
  accentBurgundy: '#8B1538',
  accentRose: '#C94B6A',
  accentPink: '#E58CA2',

  // Semantic Colors:
  success: '#34D399', // Strong fit / verified / successful states
  warning: '#FBBF24', // Partial match / warning / gap delta
  danger: '#F87171',  // Missing skill / critical deficit / destructive action
  neutral: '#94A3B8', // Disabled / muted / inactive

  // Text:
  textPrimary: '#FFF5F7',
  textSecondary: '#C9A8B0',
  textMuted: '#795C65',
} as const;

export const lightColors = {
  burgundy950: '#FAF4F6', // Porcelain soft canvas background
  burgundy900: '#FFFFFF', // Pure clean white page surface
  burgundy850: '#F7EFF2', // Soft tinted sidebar
  burgundy800: '#FFFFFF', // Clean white card surface
  burgundy700: '#F0E2E7', // Elevated surface / hover
  burgundy600: '#E8CCD4', // Crisp light wine border
  burgundy500: '#800F2F', // Deep rich burgundy brand CTA (>7.5:1 contrast)
  burgundy400: '#640A23', // Primary hover
  burgundy300: '#9F1D3B', // Links / secondary highlights
  burgundy200: '#7A0B2C', // Prominent wine label
  burgundy100: '#52061A', // Deep wine text

  // Premium Burgundy Accents:
  accentBurgundy: '#800F2F',
  accentRose: '#9F1D3B',
  accentPink: '#8B1538',

  // Semantic Colors (WCAG AA Compliant on Light Background):
  success: '#047857', // Accessible emerald (>4.6:1 contrast)
  warning: '#B45309', // Accessible amber (>4.8:1 contrast)
  danger: '#B91C1C',  // Accessible ruby red (>5.0:1 contrast)
  neutral: '#64748B',

  // Text (WCAG AAA Compliant on Light Background):
  textPrimary: '#1E080E', // High-contrast wine black (>15:1 contrast)
  textSecondary: '#562B37', // Readable dark wine text (>7.4:1 contrast)
  textMuted: '#704854', // Accessible muted text (>4.8:1 contrast)
} as const;

export const colors = {
  // Primary Burgundy Colors backed by CSS variables with dark defaults:
  burgundy950: 'var(--color-burgundy-950, #120609)',
  burgundy900: 'var(--color-burgundy-900, #1A080D)',
  burgundy850: 'var(--color-burgundy-850, #240B12)',
  burgundy800: 'var(--color-burgundy-800, #310D17)',
  burgundy700: 'var(--color-burgundy-700, #481321)',
  burgundy600: 'var(--color-burgundy-600, #641A2D)',
  burgundy500: 'var(--color-burgundy-500, #800F2F)',
  burgundy400: 'var(--color-burgundy-400, #9F1D3B)',
  burgundy300: 'var(--color-burgundy-300, #C43A58)',
  burgundy200: 'var(--color-burgundy-200, #E08A9D)',
  burgundy100: 'var(--color-burgundy-100, #F5CBD5)',

  // Premium Burgundy Accents:
  accentBurgundy: 'var(--color-accent-burgundy, #8B1538)',
  accentRose: 'var(--color-accent-rose, #C94B6A)',
  accentPink: 'var(--color-accent-pink, #E58CA2)',

  // Semantic Colors:
  success: 'var(--color-success, #34D399)',
  warning: 'var(--color-warning, #FBBF24)',
  danger: 'var(--color-danger, #F87171)',
  neutral: 'var(--color-neutral, #94A3B8)',

  // Text:
  textPrimary: 'var(--color-text-primary, #FFF5F7)',
  textSecondary: 'var(--color-text-secondary, #C9A8B0)',
  textMuted: 'var(--color-text-muted, #795C65)',
} as const;

export const glows = {
  burgundy: 'none',
  rose: 'none',
} as const;

export const typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  scale: {
    xs: { fontSize: '11px', fontWeight: '500' },
    sm: { fontSize: '13px', fontWeight: '400' },
    base: { fontSize: '15px', fontWeight: '400' },
    md: { fontSize: '16px', fontWeight: '500' },
    lg: { fontSize: '20px', fontWeight: '600' },
    xl: { fontSize: '24px', fontWeight: '700' },
    '2xl': { fontSize: '32px', fontWeight: '700' },
    '3xl': { fontSize: '40px', fontWeight: '800' },
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '9999px',
} as const;

export const shadows = {
  card: 'none',
  raised: 'none',
  modal: '0 16px 40px rgba(0,0,0,0.35)',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  smooth: '250ms cubic-bezier(0.16, 1, 0.3, 1)',
  progress: '800ms ease-out',
} as const;

export default {
  colors,
  glows,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
};
