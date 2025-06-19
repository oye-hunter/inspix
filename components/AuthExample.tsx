import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, TextInput, View } from 'react-native';

export default function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, signOut, session, isLoading } = useAuth();

  const handleSignIn = async () => {
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
  };

  const handleSignUp = async () => {
    setError(null);
    const { error } = await signUp(email, password);
    if (error) setError(error.message);
  };

  const handleSignOut = async () => {
    setError(null);
    const { error } = await signOut();
    if (error) setError(error.message);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {session ? (
        <>
          <ThemedText style={styles.title}>Welcome, {session.user.email}!</ThemedText>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <>
          <ThemedText style={styles.title}>Authentication</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.buttonContainer}>
            <Button title="Sign In" onPress={handleSignIn} />
            <Button title="Sign Up" onPress={handleSignUp} />
          </View>
        </>
      )}
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
});
