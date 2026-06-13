/** Stitch "Lather & Sole" design system — customer-facing only */

/** Max content width for customer-facing mobile-style layout on desktop */
export const CUSTOMER_MAX_WIDTH = 430;

/** Outer background when customer app is centered on wide screens */
export const CUSTOMER_SHELL_BACKGROUND = '#dad9df';

export const customerColors = {
  white: '#FFFFFF',
  background: '#faf9fe',
  foreground: '#1a1b1f',
  muted: '#f4f3f8',
  mutedForeground: '#414755',
  border: '#c1c6d7',
  input: '#c1c6d7',
  ring: '#0058bc',
  primary: '#0058bc',
  primaryForeground: '#ffffff',
  primaryDark: '#004493',
  primaryLight: '#d8e2ff',
  primaryContainer: '#0070eb',
  secondary: '#dfdfe4',
  secondaryForeground: '#1a1b1f',
  destructive: '#ba1a1a',
  destructiveForeground: '#ffffff',
  success: '#008733',
  successBg: '#f7fff2',
  successForeground: '#006b27',
  warning: '#d97706',
  warningBg: '#fffbec',
  warningForeground: '#92400e',
  info: '#0058bc',
  infoBg: '#d8e2ff',
  infoForeground: '#004493',
  card: '#ffffff',
  cardForeground: '#1a1b1f',
  surfaceContainer: '#eeedf3',
  surfaceContainerLow: '#f4f3f8',
  adminSidebar: '#18181B',
  adminSidebarForeground: '#A1A1AA',
  adminSidebarActive: '#27272A',
  cardShadow: 'rgba(26, 27, 31, 0.08)',
  overlay: 'rgba(26, 27, 31, 0.45)',
  text: '#1a1b1f',
  textSecondary: '#414755',
  textMuted: '#717786',
  borderLight: '#e3e2e7',
  danger: '#ba1a1a',
  dangerBg: '#ffdad6',
} as const;

export const customerFonts = {
  headline: 'Plus Jakarta Sans',
  body: 'Inter',
} as const;

export const customerRadius = { sm: 6, md: 8, lg: 16, xl: 24, full: 9999 } as const;

export const customerTypography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
    color: customerColors.foreground,
    fontFamily: customerFonts.headline,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.2,
    color: customerColors.foreground,
    fontFamily: customerFonts.headline,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: customerColors.foreground,
    fontFamily: customerFonts.headline,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: customerColors.foreground,
    fontFamily: customerFonts.body,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: customerColors.mutedForeground,
    fontFamily: customerFonts.body,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: customerColors.foreground,
    fontFamily: customerFonts.body,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: customerColors.textMuted,
    fontFamily: customerFonts.body,
  },
  display: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: customerColors.foreground,
    fontFamily: customerFonts.headline,
  },
} as const;

export const customerShadows = {
  sm: {
    shadowColor: customerColors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: customerColors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
} as const;
