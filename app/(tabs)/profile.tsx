import PostCard from '@/components/PostCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { Comment, Post, usePostsStorage } from '@/hooks/usePostsStorage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { signOut, session, userInfo, isLoading } = useAuth();
  const secondaryColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const router = useRouter();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  
  // Get methods from usePostsStorage - hooks must be at top level
  const postStorage = usePostsStorage();
  
  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    if (!session && !isLoading) {
      router.replace('/(auth)/sign-in');
    }
  }, [session, isLoading, router]);
  
  // A stable reference to the user ID we're fetching for
  const userId = session?.user?.id;

  // Function to fetch posts - stabilized with useCallback and explicit dependencies
  const fetchUserPostsData = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log('Fetching user posts...');
      const { data, error } = await postStorage.fetchUserPosts();
      
      if (error) {
        console.error('Error fetching user posts:', error);
      } else {
        console.log('Posts loaded:', data.length);
        setUserPosts(data);
      }
    } catch (error) {
      console.error('Error loading user posts:', error);
    }
  }, [userId, postStorage.fetchUserPosts]);

  // Separate loading state management with stable references
  const loadPosts = useCallback(async () => {
    if (!userId) return;
    
    setIsLoadingPosts(true);
    await fetchUserPostsData();
    setIsLoadingPosts(false);
    setIsRefreshing(false);
  }, [userId, fetchUserPostsData]);

  // Effect that only runs on mount and when the fetchTrigger changes
  useEffect(() => {
    // Only fetch if we have a user ID
    if (!userId) return;
    
    let isMounted = true;
    
    const fetchData = async () => {
      if (isMounted) {
        await loadPosts();
      }
    };
    
    console.log('Running effect to fetch posts, trigger:', fetchTrigger);
    fetchData();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [fetchTrigger, userId]); // Only depend on fetchTrigger and userId, not on loadPosts
  
  // Handle pull-to-refresh with a new fetch trigger
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setFetchTrigger(prev => prev + 1);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleEditProfile = useCallback(() => {
    // This would navigate to an edit profile screen that you could create
    // router.push('/(tabs)/edit-profile');
    alert('Edit profile functionality will be added later');
  }, []);
  
  // Optimized like toggle handler - stable reference with memoization
  const handleLikeToggle = useCallback((postId: string, isLiked: boolean) => {
    setUserPosts(currentPosts => 
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
    
    // Call the appropriate API function without updating trigger
    if (isLiked) {
      postStorage.likePost(postId).catch(err => console.error('Error liking post:', err));
    } else {
      postStorage.unlikePost(postId).catch(err => console.error('Error unliking post:', err));
    }
  }, [postStorage]);
  
  const handleCommentAdded = useCallback((postId: string, comment: Comment) => {
    // We don't need to update the posts state here since we don't show comment counts
  }, []);
  
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  // Function to render a post using the PostCard component - memoized with proper dependencies
  const renderPostCard = useMemo(() => {
    return ({ item }: { item: Post }) => (
      <PostCard 
        post={item} 
        onLikeToggle={handleLikeToggle}
        onCommentAdded={handleCommentAdded}
      />
    );
  }, [handleLikeToggle, handleCommentAdded]);

  // Memoize ListHeaderComponent to prevent unnecessary re-renders
  // Only depend on things that would actually change the header's appearance
  const postCount = userPosts.length;
  const userName = userInfo?.user_name;
  const name = userInfo?.name;
  const bio = userInfo?.bio;
  const userInitial = (userName?.[0] || name?.[0] || 'U').toUpperCase();
  
  const ListHeaderComponent = useMemo(() => (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {/* Profile image placeholder - in a real app, you'd use the user's image */}
          <View style={[styles.profileImage, { backgroundColor: secondaryColor + '40' }]}>
            <ThemedText style={styles.profileImageInitial}>
              {userInitial}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.username}>@{userName || 'username'}</ThemedText>
        
        {name && (
          <ThemedText style={styles.displayName}>{name}</ThemedText>
        )}
        
        {bio && (
          <ThemedText style={styles.bio}>{bio}</ThemedText>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{postCount}</ThemedText>
            <ThemedText style={styles.statLabel}>Posts</ThemedText>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEditProfile}
        >
          <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
        >
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
      
      {postCount > 0 && (
        <View style={styles.postsSectionHeader}>
          <ThemedText style={styles.sectionTitle}>My Posts</ThemedText>
        </View>
      )}
    </ThemedView>
  ), [userName, name, bio, userInitial, secondaryColor, postCount, handleEditProfile, handleSignOut]);

  // Memoize ListEmptyComponent to prevent unnecessary re-renders
  const ListEmptyComponent = useMemo(() => (
    !isLoadingPosts ? (
      <ThemedView style={styles.emptyState}>
        <ThemedText style={styles.emptyStateText}>No posts yet</ThemedText>
        <ThemedText style={styles.emptyStateSubText}>Your posts will appear here</ThemedText>
      </ThemedView>
    ) : (
      <ActivityIndicator style={styles.postsLoader} size="large" color={tint} />
    )
  ), [isLoadingPosts, tint]);

  // Memoize key extractor to prevent recreating on every render
  const keyExtractor = useCallback((item: Post) => item.id, []);

  // Add a key to the FlatList to force remounting when user changes
  // This prevents stale closures and references
  const flatListKey = `profile-posts-${userId || 'no-user'}`; 

  return (
    <FlatList
      key={flatListKey}
      data={userPosts}
      keyExtractor={keyExtractor}
      renderItem={renderPostCard}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={handleRefresh}
          tintColor={tint}
        />
      }
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      // Enable performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
      initialNumToRender={5}
      // Avoid excessive fetches during momentum scrolling
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60,
  },
  listContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  editButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  editButtonText: {
    fontWeight: '500',
  },
  postsSectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
  postsLoader: {
    marginTop: 40,
  },
  footer: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  signOutButton: {
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
