import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="sign-in" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="sign-up" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="profile-setup" 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Prevent going back from profile setup
        }} 
      />
    </Stack>
  );
}
