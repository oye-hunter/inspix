import PostCard from '@/components/PostCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { Comment, Post, usePostsStorage } from '@/hooks/usePostsStorage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { session } = useAuth();
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
      
      // For the explore tab, we could implement different sorting or filtering
      // For now, just use the same posts but sorted by likes
      const sortedPosts = [...data].sort((a, b) => 
        (b.likes_count || 0) - (a.likes_count || 0)
      );
      
      setPosts(sortedPosts);
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
          <ThemedText type="title" style={styles.headerTitle}>
            Trending
          </ThemedText>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>No trending posts yet</ThemedText>
            <ThemedText style={styles.emptyStateSubText}>Popular posts will appear here</ThemedText>
          </ThemedView>
        }
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 50, // Space for status bar
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
  emptyStateSubText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});