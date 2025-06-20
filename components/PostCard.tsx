import { useAuth } from '@/context/AuthContext';
import { Comment, Post, usePostsStorage } from '@/hooks/usePostsStorage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';
import { timeSince } from '@/utils/dateUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type PostCardProps = {
  post: Post;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onCommentAdded: (postId: string, comment: Comment) => void;
};

// Create the component without memo first
function PostCardComponent({ post, onLikeToggle, onCommentAdded }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const router = useRouter();
  const { session } = useAuth();
  
  // Get methods directly from the hook - hooks must be at top level
  const { likePost, unlikePost, addComment, getComments } = usePostsStorage();
  
  // Get the signed URL for the image (needed for non-public buckets)
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const getSignedUrl = async () => {
      const { data, error } = await supabase.storage
        .from('posts')
        .createSignedUrl(post.image_path, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error getting signed URL:', error);
        return;
      }
      
      setImageUrl(data.signedUrl);
    };
    
    getSignedUrl();
  }, [post.image_path]);
  
  const handleLikeToggle = useCallback(async () => {
    // Check if the user is authenticated
    if (!session) {
      Alert.alert(
        "Authentication Required", 
        "Please sign in to like posts.", 
        [{ text: "Sign In", onPress: () => router.push('/(auth)/sign-in') }]
      );
      return;
    }
    
    const newIsLiked = !isLiked;
    const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
    
    // Optimistically update UI
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    
    try {
      if (newIsLiked) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }
      
      // Notify parent component
      onLikeToggle(post.id, newIsLiked);
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error);
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
      Alert.alert('Error', 'Failed to update like status');
    }
  }, [isLiked, likesCount, session, router, post.id, likePost, unlikePost, onLikeToggle]);
  
  const handleShowComments = useCallback(async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setIsLoadingComments(true);
    
    try {
      const { data, error } = await getComments(post.id);
      
      if (error) {
        throw new Error('Failed to load comments');
      }
      
      setComments(data);
      setShowComments(true);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  }, [showComments, getComments, post.id]);
  
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return;
    
    setIsAddingComment(true);
    
    try {
      const { data, error } = await addComment(post.id, commentText);
      
      if (error || !data) {
        throw new Error('Failed to add comment');
      }
      
      // Update local comments
      setComments([...comments, data]);
      setCommentText('');
      
      // Notify parent component
      onCommentAdded(post.id, data);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  }, [commentText, addComment, post.id, comments, onCommentAdded]);
  
  const navigateToProfile = useCallback((userId: string) => {
    // This would navigate to the user's profile
    // You can implement this later
    Alert.alert('Navigate to Profile', `Navigate to user: ${userId}`);
  }, []);
  
  return (
    <ThemedView style={styles.card}>
      {/* Post header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigateToProfile(post.user_id)}
          style={styles.userInfo}
        >
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>
              {(post.user_name?.[0] || post.name?.[0] || '?').toUpperCase()}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.username}>@{post.user_name || 'user'}</ThemedText>
          </View>
        </TouchableOpacity>
        
        <ThemedText style={styles.timestamp}>{timeSince(new Date(post.created_at))}</ThemedText>
      </View>
      
      {/* Post image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imageLoading]}>
            <ActivityIndicator size="large" color={tint} />
          </View>
        )}
      </View>
      
      {/* Post actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={handleLikeToggle}
          style={styles.actionButton}
        >
          <MaterialIcons 
            name={isLiked ? "favorite" : "favorite-outline"} 
            size={24} 
            color={isLiked ? '#ff3b30' : textColor} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleShowComments}
          style={styles.actionButton}
        >
          <MaterialIcons name="chat-bubble-outline" size={22} color={textColor} />
        </TouchableOpacity>
      </View>
      
      {/* Post details */}
      <View style={styles.details}>
        <ThemedText style={styles.likesCount}>
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </ThemedText>
        
        {post.caption && (
          <View style={styles.captionContainer}>
            <ThemedText style={styles.captionUsername}>@{post.user_name || 'user'}</ThemedText>
            <ThemedText style={styles.caption}>{post.caption}</ThemedText>
          </View>
        )}
      </View>
      
      {/* Comments section */}
      {isLoadingComments ? (
        <ActivityIndicator style={styles.commentsLoader} />
      ) : showComments && (
        <View style={styles.commentsSection}>
          {comments.length === 0 ? (
            <ThemedText style={styles.noComments}>No comments yet</ThemedText>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <ThemedText style={styles.commentUsername}>@{comment.user_name || 'user'}</ThemedText>
                <ThemedText style={styles.commentContent}>{comment.content}</ThemedText>
              </View>
            ))
          )}
          
          <View style={styles.addCommentContainer}>
            <TextInput
              style={[styles.commentInput, { color: textColor, borderColor: textColor + '50' }]}
              placeholder="Add a comment..."
              placeholderTextColor={textColor + '80'}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity 
              style={[styles.postCommentButton, { backgroundColor: tint }]} 
              onPress={handleAddComment}
              disabled={!commentText.trim() || isAddingComment}
            >
              {isAddingComment ? (
                <ActivityIndicator size="small" color={tint === '#ffffff' || tint === '#fff' ? '#000' : '#fff'} />
              ) : (
                <MaterialIcons name="send" size={24} color={tint === '#ffffff' || tint === '#fff' ? '#000' : '#fff'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

// Export the memoized component
const PostCard = memo(PostCardComponent);
export default PostCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 300,
  },
  imageLoading: {
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionButton: {
    marginRight: 16,
  },
  details: {
    marginBottom: 10,
  },
  likesCount: {
    fontWeight: '600',
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  captionUsername: {
    fontWeight: '600',
    marginRight: 5,
  },
  caption: {
    flex: 1,
  },
  commentsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  commentsLoader: {
    marginTop: 10,
  },
  commentItem: {
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentUsername: {
    fontWeight: '600',
    marginRight: 5,
  },
  commentContent: {
    flex: 1,
  },
  noComments: {
    fontStyle: 'italic',
    opacity: 0.7,
    marginBottom: 10,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  postCommentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
