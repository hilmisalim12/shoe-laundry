import { ScreenContainer } from '@/src/components/ui/ScreenContainer';

type Props = {
  children: React.ReactNode;
  maxWidth?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAvoid?: boolean;
};

/** Unified admin page shell — scroll + safe area + optional refresh */
export function AdminScrollPage({
  children,
  maxWidth = 1200,
  refreshing,
  onRefresh,
  keyboardAvoid,
}: Props) {
  return (
    <ScreenContainer
      scroll
      maxWidth={maxWidth}
      bottomPad={48}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardAvoid={keyboardAvoid}
    >
      {children}
    </ScreenContainer>
  );
}
