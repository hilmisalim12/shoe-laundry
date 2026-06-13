import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useWindowDimensions } from 'react-native';

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
  const { width } = useWindowDimensions();
  const bottomPad = width >= 1024 ? 48 : 96;

  return (
    <ScreenContainer
      scroll
      maxWidth={maxWidth}
      bottomPad={bottomPad}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardAvoid={keyboardAvoid}
    >
      {children}
    </ScreenContainer>
  );
}
