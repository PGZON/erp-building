/**
 * Professional Construction Management Theme
 * Palette: Deep Navy & Slate with Clean Whites
 */


const palette = {
  // Brand Colors - Royal Violet "Premium" feel
  primary: '#7C3AED', // Violet 600 - Rich, creative, premium
  primaryDark: '#5B21B6', // Violet 800
  primaryLight: '#F5F3FF', // Violet 50

  // Secondary / Accents
  accent: '#D97706', // Amber 600 - Gold/Premium accent
  secondary: '#10B981', // Emerald 500 - Growth/Money

  // Functional Colors
  success: '#10B981', // Emerald 500
  warning: '#F59E0B', // Amber 500
  danger: '#EF4444', // Red 500
  info: '#3B82F6',   // Blue 500

  // Neutrals - Clean & Crisp
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  surfaceHighlight: '#F1F5F9', // Slate 100

  // Text
  textPrimary: '#1E293B', // Slate 800
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  border: '#E2E8F0', // Slate 200

  // Category Specific Colors
  categories: {
    material: '#7C3AED', // Violet (Primary)
    labor: '#D97706',    // Amber (Gold)
    transport: '#0EA5E9',// Sky
    other: '#64748B',    // Slate
  }
};

export const Colors = {
  light: {
    text: palette.textPrimary,
    textSecondary: palette.textSecondary,
    background: palette.background,
    surface: palette.surface,
    tint: palette.accent,
    icon: palette.textSecondary,
    tabIconDefault: palette.textTertiary,
    tabIconSelected: palette.primary,
    border: palette.border,
    error: palette.danger,
    primary: palette.primary,
  },
  dark: {
    // For now, mapping dark directly to light or defining properly if user wants dark mode
    // The prompt asked for "Professional Clean", often implies a high-contrast light theme for business apps.
    // I will keep a safe dark fallback but focus on the light theme primarily as requested "clean elegant"
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    tint: '#38BDF8',
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: '#F8FAFC',
    border: '#334155',
    error: '#F87171',
    primary: '#F8FAFC',
  },
  palette,
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  pill: 999,
};

export const Shadows = {
  soft: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};
