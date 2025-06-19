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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { signUp, isLoading } = useAuth();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'text'); // Using text color instead of border

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);
    
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      // Notify the user to check their email
      // For Supabase, by default, email confirmation is enabled
      setErrorMessage('Check your email for a confirmation link');
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      console.log('Sign up error:', error);
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
          
          <ThemedText style={authStyles.title}>Create Account</ThemedText>
          
          {errorMessage ? (
            <ThemedText style={[
              authStyles.errorText,
              errorMessage.includes('Check your email') && { color: 'green' }
            ]}>
              {errorMessage}
            </ThemedText>
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
          
          <TextInput
            style={[
              authStyles.input, 
              { 
                backgroundColor, 
                color: textColor, 
                borderColor 
              }
            ]}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          
          <TouchableOpacity
            style={[
              authStyles.button,
              { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={authStyles.buttonText}>Sign Up</ThemedText>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
            <ThemedText style={authStyles.linkText}>
              Already have an account? Sign In
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
