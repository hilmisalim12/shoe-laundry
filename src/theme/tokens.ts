/** Shadcn-inspired design tokens (zinc palette + brand accent) */
export const colors = {
  white: '#FFFFFF',
  background: '#FFFFFF',
  foreground: '#09090B',
  muted: '#F4F4F5',
  mutedForeground: '#71717A',
  border: '#E4E4E7',
  input: '#E4E4E7',
  ring: '#0D9488',
  primary: '#0D9488',
  primaryForeground: '#FFFFFF',
  primaryDark: '#0F766E',
  primaryLight: '#F0FDFA',
  secondary: '#F4F4F5',
  secondaryForeground: '#18181B',
  destructive: '#EF4444',
  destructiveForeground: '#FFFFFF',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successForeground: '#166534',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningForeground: '#92400E',
  info: '#0D9488',
  infoBg: '#F0FDFA',
  infoForeground: '#115E59',
  card: '#FFFFFF',
  cardForeground: '#09090B',
  adminSidebar: '#18181B',
  adminSidebarForeground: '#A1A1AA',
  adminSidebarActive: '#27272A',
  cardShadow: 'rgba(9, 9, 11, 0.08)',
  overlay: 'rgba(9, 9, 11, 0.5)',
  // Legacy aliases
  text: '#09090B',
  textSecondary: '#71717A',
  textMuted: '#A1A1AA',
  borderLight: '#F4F4F5',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

/** shadcn default --radius: 0.5rem */
export const radius = { sm: 6, md: 8, lg: 12, xl: 16, full: 9999 } as const;

export const typography = {
  h1: { fontSize: 30, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5, color: colors.foreground },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: -0.4, color: colors.foreground },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 28, color: colors.foreground },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: colors.foreground },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, color: colors.mutedForeground },
  label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, color: colors.foreground },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, color: colors.mutedForeground },
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;
