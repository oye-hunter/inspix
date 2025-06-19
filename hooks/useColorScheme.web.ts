import { useThemeContext } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  let resolvedTheme: string | null | undefined = 'light';
  
  try {
    // Try to get theme from context, but it might not be available during SSR
    ({ resolvedTheme } = useThemeContext());
  } catch (error) {
    // If the theme context is not available, we'll use system theme
  }

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemColorScheme = useRNColorScheme();

  if (hasHydrated) {
    // Use the theme from context if available, otherwise use system theme
    return resolvedTheme || systemColorScheme || 'light';
  }

  return 'light';
}
