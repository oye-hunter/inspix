import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const { session } = useAuth();
  const user = session?.user;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          Welcome{user?.email ? ', ' + user.email.split('@')[0] : ''}!
        </ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Your Dashboard</ThemedText>
        <ThemedText>
          This is your main dashboard. Here you can see all your important information at a glance.
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Recent Activity</ThemedText>
        <ThemedView style={styles.activity}>
          <ThemedText>No recent activity to show</ThemedText>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Quick Actions</ThemedText>
        <ThemedView style={styles.quickActions}>
          <ThemedView style={styles.actionItem}>
            <ThemedText>View Profile</ThemedText>
          </ThemedView>
          <ThemedView style={styles.actionItem}>
            <ThemedText>Explore Content</ThemedText>
          </ThemedView>
          <ThemedView style={styles.actionItem}>
            <ThemedText>Settings</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  card: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    gap: 8,
  },
  activity: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionItem: {
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
    marginVertical: 5,
  },
});
