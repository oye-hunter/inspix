import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'text'); // Using text color instead of border

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setMessage(null);
    
    if (!email) {
      setMessage({ text: 'Please enter your email address', isError: true });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'inspix://reset-password',
      });
      
      if (error) {
        setMessage({ text: error.message, isError: true });
        return;
      }
      
      setMessage({ 
        text: 'Password reset instructions sent to your email', 
        isError: false 
      });
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', isError: true });
      console.log('Reset password error:', error);
    } finally {
      setIsLoading(false);
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
          
          <ThemedText style={authStyles.title}>Forgot Password</ThemedText>
          
          {message ? (
            <ThemedText style={[
              authStyles.errorText,
              !message.isError && { color: 'green' }
            ]}>
              {message.text}
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
          
          <TouchableOpacity
            style={[
              authStyles.button,
              { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={authStyles.buttonText}>Reset Password</ThemedText>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)}>
            <ThemedText style={authStyles.linkText}>
              Back to Sign In
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
