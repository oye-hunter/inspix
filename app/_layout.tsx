import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

// Auth redirect component
function AuthRedirect() {
  const { session, isLoading, profileComplete, checkProfileComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [checkedProfile, setCheckedProfile] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;

      const inAuthGroup = segments[0] === '(auth)';
      const isProfileSetup = segments[1] === 'profile-setup';
      
      // Check if user has completed profile setup
      let hasCompletedProfile = profileComplete;
      if (session && !checkedProfile) {
        hasCompletedProfile = await checkProfileComplete();
        setCheckedProfile(true);
      }

      if (!session && !inAuthGroup) {
        // Redirect to sign in if not authenticated and not in auth group
        router.replace('/(auth)/sign-in');
      } else if (session && !hasCompletedProfile && !isProfileSetup) {
        // Redirect to profile setup if user hasn't completed profile
        router.replace('/(auth)/profile-setup');
      } else if (session && hasCompletedProfile && inAuthGroup && !isProfileSetup) {
        // Redirect to home if authenticated with complete profile but still in auth group
        router.replace('/(tabs)');
      }
    };

    checkAuth();
  }, [session, segments, isLoading, checkedProfile]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthRedirect />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
