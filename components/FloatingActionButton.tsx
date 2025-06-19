import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

type FloatingActionButtonProps = {
  onPress: () => void;
  iconName: string;
  color?: string;
  requiresAuth?: boolean;
};

export default function FloatingActionButton({ 
  onPress, 
  iconName, 
  color = '#007AFF',
  requiresAuth = false
}: FloatingActionButtonProps) {
  const { session } = useAuth();
  const router = useRouter();
  
  // Map the icon names to MaterialIcons names
  const getIconName = (name: string) => {
    const iconMap: Record<string, any> = {
      'plus': 'add',
      'heart': 'favorite-outline',
      'heart.fill': 'favorite',
      'text.bubble': 'chat-bubble-outline',
      'xmark.circle.fill': 'cancel',
      'camera': 'camera-alt',
      'photo': 'photo-library',
      'arrow.up.circle.fill': 'send'
    };
    
    return iconMap[name] || 'add';
  };

  const handlePress = () => {
    if (requiresAuth && !session) {
      Alert.alert(
        "Authentication Required", 
        "Please sign in to access this feature.", 
        [{ text: "Sign In", onPress: () => router.replace('/(auth)/sign-in') }]
      );
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={getIconName(iconName) as any} size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
