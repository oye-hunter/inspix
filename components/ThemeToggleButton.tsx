import { useThemeContext } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

// Theme toggle button component
const ThemeToggleButton = () => {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  // Use the tint color from the current theme
  const buttonBackgroundColor = tint;
  // Determine if we need light or dark icon color based on background brightness
  const iconColor = resolvedTheme === 'dark' ? '#000' : '#fff';
  
  const toggleTheme = () => {
    // Cycle through themes: light -> dark -> system -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  // Choose the appropriate icon based on the current theme
  const getIconName = () => {
    switch (theme) {
      case 'light':
        return 'light-mode';
      case 'dark':
        return 'dark-mode';
      case 'system':
        return 'settings-suggest';
      default:
        return 'light-mode';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: buttonBackgroundColor }]} 
      onPress={toggleTheme} 
      activeOpacity={0.7}
    >
      <MaterialIcons name={getIconName()} size={24} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default ThemeToggleButton;
