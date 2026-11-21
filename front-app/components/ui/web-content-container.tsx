import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

type WebContentContainerProps = {
  children: ReactNode;
  maxWidth: number;
  style?: StyleProp<ViewStyle>;
};

export const getWebContentContainerStyle = (maxWidth: number): ViewStyle =>
  Platform.OS === 'web'
    ? {
        alignSelf: 'center',
        maxWidth,
        width: '100%',
      }
    : styles.nativeContent;

export function WebContentContainer({ children, maxWidth, style }: WebContentContainerProps) {
  return <View style={[getWebContentContainerStyle(maxWidth), style]}>{children}</View>;
}

const styles = StyleSheet.create({
  nativeContent: { width: '100%' },
});
