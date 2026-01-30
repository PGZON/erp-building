/**
 * Professional Construction Management Theme
 * Palette: Deep Navy & Slate with Clean Whites
 */


const palette = {
  primary: '#0F172A', // Slate 900 - Deep, professional
  primaryLight: '#334155', // Slate 700
  accent: '#2563EB', // Royal Blue - Actionable
  success: '#10B981', // Emerald - Positive values
  warning: '#F59E0B', // Amber - Alerts
  danger: '#EF4444', // Red - Expenses/Delete

  background: '#F8FAFC', // Slate 50 - Very subtle off-white
  surface: '#FFFFFF',
  surfaceHighlight: '#F1F5F9', // Slate 100

  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textTertiary: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  border: '#E2E8F0', // Slate 200
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
