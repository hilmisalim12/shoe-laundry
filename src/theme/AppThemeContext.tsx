import { createContext, useContext, useMemo } from 'react';

import { customerColors, customerFonts, customerRadius, customerShadows, customerTypography } from '@/src/theme/customerTheme';
import { colors, radius, shadows, spacing, typography } from '@/src/theme/tokens';

type ThemeColors = { [K in keyof typeof colors]: string } & Partial<
  Pick<typeof customerColors, 'primaryContainer' | 'surfaceContainer' | 'surfaceContainerLow'>
>;

type ThemeRadius = {
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly full: number;
};

type TypographyToken = {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700';
  lineHeight: number;
  letterSpacing?: number;
  color: string;
  fontFamily?: string;
};

type ThemeTypography = {
  h1: TypographyToken;
  h2: TypographyToken;
  h3: TypographyToken;
  body: TypographyToken;
  bodySm: TypographyToken;
  label: TypographyToken;
  caption: TypographyToken;
  display?: TypographyToken;
};

export type AppTheme = {
  isCustomer: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  radius: ThemeRadius;
  shadows: typeof shadows | typeof customerShadows;
  spacing: typeof spacing;
  fonts: { headline: string; body: string };
};

const defaultTheme: AppTheme = {
  isCustomer: false,
  colors,
  typography,
  radius,
  shadows,
  spacing,
  fonts: { headline: 'System', body: 'System' },
};

const customerThemeValue: AppTheme = {
  isCustomer: true,
  colors: { ...colors, ...customerColors },
  typography: { ...typography, ...customerTypography },
  radius: { ...radius, ...customerRadius },
  shadows: customerShadows,
  spacing,
  fonts: customerFonts,
};

const AppThemeContext = createContext<AppTheme>(defaultTheme);

export function CustomerThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => customerThemeValue, []);
  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
