import { Alert, Platform } from 'react-native';

/** Cross-platform alert — Alert.alert is a no-op on web. */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
