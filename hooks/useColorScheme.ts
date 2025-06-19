// Modified to use our custom theme context
import { useThemeContext } from '@/context/ThemeContext';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  try {
    const { resolvedTheme } = useThemeContext();
    // If the theme context is available, use it, otherwise fall back to the system theme
    return resolvedTheme || useSystemColorScheme() || 'light';
  } catch (error) {
    // If the theme context is not available (e.g., during SSR), fall back to system theme
    return useSystemColorScheme() || 'light';
  }
}
