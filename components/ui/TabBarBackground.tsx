// This is for web and Android where the tab bar is generally opaque
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { backgroundColor: Colors[colorScheme].background }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
