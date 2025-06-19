import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { authStyles } from '@/styles/authStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { signIn, isLoading } = useAuth();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'text'); // Using text color instead of border

  const handleSignIn = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      // Successful login will navigate to the home screen through the AuthProvider
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      console.log('Sign in error:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ThemedView style={authStyles.container}>
          <Image 
            source={require('@/assets/images/react-logo.png')} 
            style={authStyles.logo} 
          />
          
          <ThemedText style={authStyles.title}>Welcome Back</ThemedText>
          
          {errorMessage ? (
            <ThemedText style={authStyles.errorText}>{errorMessage}</ThemedText>
          ) : null}
          
          <TextInput
            style={[
              authStyles.input, 
              { 
                backgroundColor, 
                color: textColor, 
                borderColor 
              }
            ]}
            placeholder="Email"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          
          <TextInput
            style={[
              authStyles.input, 
              { 
                backgroundColor, 
                color: textColor, 
                borderColor 
              }
            ]}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}>
            <ThemedText style={authStyles.forgotPassword}>
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              authStyles.button,
              { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }
            ]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={authStyles.buttonText}>Sign In</ThemedText>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up' as any)}>
            <ThemedText style={authStyles.linkText}>
              Don't have an account? Sign Up
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
