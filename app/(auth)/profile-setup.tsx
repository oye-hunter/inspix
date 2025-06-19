import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';

export default function ProfileSetupScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  const [userName, setUserName] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'text');
  
  // If not authenticated, redirect to sign in
  if (!userId) {
    router.replace('/(auth)/sign-in');
    return null;
  }

  const handleComplete = async () => {
    Keyboard.dismiss();
    
    if (!userName.trim()) {
      setErrorMessage('Username is required');
      return;
    }
    
    // Check if username contains only allowed characters
    if (!/^[a-zA-Z0-9_\.]+$/.test(userName)) {
      setErrorMessage('Username can only contain letters, numbers, periods and underscores');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Check if username is unique
      const { data: existingUsers, error: checkError } = await supabase
        .from('user_info')
        .select('id')
        .eq('user_name', userName.toLowerCase())
        .maybeSingle();
      
      if (checkError) {
        throw checkError;
      }
      
      if (existingUsers) {
        setErrorMessage('This username is already taken');
        setIsLoading(false);
        return;
      }
      
      // Insert user info
      const { error: insertError } = await supabase
        .from('user_info')
        .insert({
          user_id: userId,
          user_name: userName.toLowerCase(),
          name: name || null,
          bio: bio || null
        });
      
      if (insertError) {
        throw insertError;
      }
      
      // Success, navigate to home screen
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('Error setting up profile:', error);
      setErrorMessage(error.message || 'Failed to set up profile. Please try again.');
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
        <ScrollView>
          <ThemedView style={styles.container}>
            <Image 
              source={require('@/assets/images/react-logo.png')} 
              style={styles.logo} 
            />
            
            <ThemedText style={styles.title}>Set Up Your Profile</ThemedText>
            <ThemedText style={styles.subtitle}>Tell us a little about yourself</ThemedText>
            
            {errorMessage ? (
              <ThemedText style={styles.errorText}>
                {errorMessage}
              </ThemedText>
            ) : null}
            
            <ThemedText style={styles.label}>Username (required)</ThemedText>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor, 
                  color: textColor, 
                  borderColor 
                }
              ]}
              placeholder="username"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={userName}
              onChangeText={setUserName}
            />
            
            <ThemedText style={styles.label}>Display Name</ThemedText>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor, 
                  color: textColor, 
                  borderColor 
                }
              ]}
              placeholder="Your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            
            <ThemedText style={styles.label}>Bio</ThemedText>
            <TextInput
              style={[
                styles.textArea, 
                { 
                  backgroundColor, 
                  color: textColor, 
                  borderColor 
                }
              ]}
              placeholder="Tell us about yourself"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={bio}
              onChangeText={setBio}
            />
            
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: primaryColor, opacity: isLoading ? 0.7 : 1 }
              ]}
              onPress={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Complete Setup</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
});
