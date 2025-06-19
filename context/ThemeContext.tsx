import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

// Define the possible theme values
export type ThemeType = 'light' | 'dark' | 'system';

// Context to store and provide theme information
interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: 'light' | 'dark'; // The actual applied theme (after system resolution)
  setTheme: (theme: ThemeType) => void;
}

// Create the context
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

// Custom hook to use the theme
export const useThemeContext = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>('system');
  const systemTheme = useSystemColorScheme() || 'light';
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(systemTheme as 'light' | 'dark');

  // Load the saved theme on startup
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme', error);
      }
    };

    loadTheme();
  }, []);

  // Update the resolved theme when the theme or system theme changes
  useEffect(() => {
    if (theme === 'system') {
      setResolvedTheme(systemTheme as 'light' | 'dark');
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, systemTheme]);

  // Function to change the theme
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('user-theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
