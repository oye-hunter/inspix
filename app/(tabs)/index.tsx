import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import FloatingActionButton from '@/components/FloatingActionButton';
import PostCard from '@/components/PostCard';
import PostCreationModal from '@/components/PostCreationModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Comment, Post, usePostsStorage } from '@/hooks/usePostsStorage';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { session, userInfo } = useAuth();
  const { fetchPosts } = usePostsStorage();
  const tint = useThemeColor({}, 'tint');
  const router = useRouter();
  
  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    if (!session) {
      router.replace('/(auth)/sign-in');
    }
  }, [session, router]);
  
  const loadPosts = async () => {
    try {
      const { data, error } = await fetchPosts();
      
      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }
      
      setPosts(data);
    } catch (error) {
      console.error('Error in loadPosts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    loadPosts();
  }, []);
  
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPosts();
  }, []);
  
  const handlePostCreated = useCallback(() => {
    loadPosts();
  }, []);
  
  const handleLikeToggle = useCallback((postId: string, isLiked: boolean) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              has_liked: isLiked, 
              likes_count: isLiked ? (post.likes_count || 0) + 1 : (post.likes_count || 1) - 1 
            }
          : post
      )
    );
  }, []);
  
  const handleCommentAdded = useCallback((postId: string, comment: Comment) => {
    // We don't need to update the posts state here since we don't show comment counts
    // But we could if we wanted to track comment counts in the UI
  }, []);
  
  const renderPostCard = ({ item }: { item: Post }) => (
    <PostCard 
      post={item} 
      onLikeToggle={handleLikeToggle}
      onCommentAdded={handleCommentAdded}
    />
  );
  
  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={tint}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              Inspix Feed
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>No posts yet</ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Create the first post by tapping the plus button!
            </ThemedText>
          </ThemedView>
        }
      />
      
      <FloatingActionButton 
        onPress={() => setModalVisible(true)}
        iconName="plus"
        color={tint}
        requiresAuth={true}
      />
      
      <PostCreationModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onPostCreated={handlePostCreated}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  header: {
    marginBottom: 16,
    paddingTop: 50, // Space for status bar
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
