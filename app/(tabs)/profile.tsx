import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut, session, userInfo, isLoading } = useAuth();
  const secondaryColor = useThemeColor({}, 'text');
  const router = useRouter();
  
  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    if (!session && !isLoading) {
      router.replace('/(auth)/sign-in');
    }
  }, [session, isLoading, router]);
  
  const handleSignOut = async () => {
    await signOut();
  };

  const handleEditProfile = () => {
    // This would navigate to an edit profile screen that you could create
    // router.push('/(tabs)/edit-profile');
    alert('Edit profile functionality will be added later');
  };
  
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {/* Profile image placeholder - in a real app, you'd use the user's image */}
            <View style={[styles.profileImage, { backgroundColor: secondaryColor + '40' }]}>
              <ThemedText style={styles.profileImageInitial}>
                {(userInfo?.user_name?.[0] || userInfo?.name?.[0] || 'U').toUpperCase()}
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={styles.username}>@{userInfo?.user_name || 'username'}</ThemedText>
          
          {userInfo?.name && (
            <ThemedText style={styles.displayName}>{userInfo.name}</ThemedText>
          )}
          
          {userInfo?.bio && (
            <ThemedText style={styles.bio}>{userInfo.bio}</ThemedText>
          )}
          
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
          >
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Information</ThemedText>
          
          <ThemedView style={styles.infoContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{session?.user?.email}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoContainer}>
            <ThemedText style={styles.label}>Joined</ThemedText>
            <ThemedText style={styles.value}>
              {userInfo?.created_at 
                ? new Date(userInfo.created_at).toLocaleDateString() 
                : 'Recently'}
            </ThemedText>
          </ThemedView>
        </View>
        
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitial: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 8,
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  editButtonText: {
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  signOutButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
