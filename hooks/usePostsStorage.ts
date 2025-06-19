import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { checkNetworkState } from '@/utils/networkUtils';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform } from 'react-native';

// Types for our posts data
export type Post = {
  id: string;
  user_id: string;
  image_path: string;
  caption: string;
  created_at: string;
  user_name?: string;
  name?: string;
  likes_count?: number;
  has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  name?: string;
};

export const usePostsStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { session, userInfo } = useAuth();
  const userId = session?.user?.id;

  // Get posts with likes count and whether the current user has liked them
  const fetchPosts = async () => {
    if (!userId || !session) return { data: [], error: 'User not authenticated' };
  
    try {
      console.log('Fetching posts...');
      
      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }
      
      if (!postsData || postsData.length === 0) {
        console.log('No posts found');
        return { data: [], error: null };
      }
      
      console.log(`Found ${postsData.length} posts`);
      
      // Then get user info separately for each post
      const postsWithUserInfo = await Promise.all(
        postsData.map(async (post) => {
          // Get user info
          const { data: userData } = await supabase
            .from('user_info')
            .select('user_name, name')
            .eq('user_id', post.user_id)
            .maybeSingle();
            
          return {
            ...post,
            user_name: userData?.user_name || null,
            name: userData?.name || null
          };
        })
      );
      
      // Then get likes information separately
      const likes = await Promise.all(
        postsWithUserInfo.map(async (post) => {
          try {
            // Get total likes count
            const { count, error: countError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            if (countError) {
              console.warn('Error getting likes count:', countError);
              return { postId: post.id, count: 0, hasLiked: false };
            }
              
            // Check if current user has liked this post
            const { data: userLike, error: likeError } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (likeError) {
              console.warn('Error checking if user liked post:', likeError);
            }
              
            return { 
              postId: post.id, 
              count: count || 0, 
              hasLiked: !!userLike
            };
          } catch (err) {
            console.error('Error processing likes for post:', err);
            return { postId: post.id, count: 0, hasLiked: false };
          }
        })
      );

      // Process the data to include likes_count and has_liked
      const processedData = postsWithUserInfo.map((post) => {
        const postLikes = likes.find((like) => like.postId === post.id);
        return {
          ...post,
          likes_count: postLikes?.count || 0,
          has_liked: postLikes?.hasLiked || false
        };
      });

      console.log(`Successfully processed ${processedData.length} posts with user info and likes`);
      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { data: [], error };
    }
  };

  // Upload a post image to Supabase Storage - using post_id in path
  const uploadPostImage = async (imageUri: string, postId: string) => {
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    // First check network connection
    const isConnected = await checkNetworkState();
    if (!isConnected) {
      return { data: null, error: 'No internet connection', filePath: null };
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      console.log('Starting image upload process from: ', imageUri);
      console.log('Using post ID for filepath:', postId);
      
      // Make sure we have a valid file extension
      let fileExt = imageUri.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        fileExt = 'jpeg'; // Default to jpeg if extension is missing or invalid
      }

      // Use the postId for the filename to ensure a clean structure
      const fileName = `${postId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Platform-specific URI handling
      const finalUri = Platform.OS === 'ios' && imageUri.startsWith('file://') 
        ? imageUri.replace('file://', '')
        : imageUri;
      
      console.log('Using URI:', finalUri);
      
      // Get image data as base64 string - most reliable cross-platform approach
      let base64Data: string;
      
      try {
        console.log('Reading image as base64...');
        base64Data = await FileSystem.readAsStringAsync(finalUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (!base64Data) {
          throw new Error('Failed to read image data as base64');
        }
        
        console.log(`Successfully read base64 data, length: ${base64Data.length}`);
      } catch (err) {
        console.error('Error reading image file:', err);
        throw new Error('Could not read the selected image. Please try another image.');
      }
      
      // Convert base64 to ArrayBuffer for Supabase upload
      const arrayBuffer = decode(base64Data);
      if (!arrayBuffer) {
        throw new Error('Failed to decode base64 data');
      }
      
      console.log('Successfully decoded base64 to array buffer');

      // Try to upload with simple direct approach
      console.log('Uploading to Supabase Storage...');
      
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true
        });
        
      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from upload');
      }
      
      console.log('Upload successful for path:', filePath);

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      setIsUploading(false);
      setUploadProgress(100);
      
      return { data: publicUrlData.publicUrl, error: null, filePath };
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      setUploadError('Failed to upload image');
      return { data: null, error, filePath: null };
    }
  };

  // Create a new post - creating post first, then uploading image with post ID
  const createPost = async (imageUri: string, caption: string) => {
    if (!userId || !userInfo) {
      console.log('User not authenticated for post creation');
      return { data: null, error: 'User not authenticated' };
    }

    try {
      // Validate input
      if (!imageUri) {
        console.error('No image URI provided');
        return { data: null, error: 'No image provided' };
      }
      
      // First create the post record with a temporary image path
      // We'll update this path after successful image upload
      console.log('Creating post record in database first...');
      
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          image_path: 'pending_upload', // Temporary, will be updated after upload
          caption
        })
        .select('*')
        .single();
      
      if (postError || !postData) {
        console.error('Database error creating post:', postError);
        return { data: null, error: `Database error: ${postError?.message || 'Failed to create post'}` };
      }
      
      console.log('Post record created with ID:', postData.id);
      
      // Now upload the image using the post ID
      console.log('Uploading image for post ID:', postData.id);
      
      const { data: imageUrl, error: uploadError, filePath } = await uploadPostImage(imageUri, postData.id);
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        
        // If image upload fails, clean up the post record
        try {
          await supabase
            .from('posts')
            .delete()
            .eq('id', postData.id);
          console.log('Cleaned up post record after failed image upload');
        } catch (cleanupError) {
          console.warn('Failed to clean up post record:', cleanupError);
        }
        
        return { 
          data: null, 
          error: typeof uploadError === 'string' 
            ? `Image upload failed: ${uploadError}` 
            : 'Failed to upload image'
        };
      }
      
      if (!imageUrl || !filePath) {
        console.error('Missing image URL or file path after upload');
        
        // Clean up the post record
        try {
          await supabase
            .from('posts')
            .delete()
            .eq('id', postData.id);
          console.log('Cleaned up post record after failed image upload');
        } catch (cleanupError) {
          console.warn('Failed to clean up post record:', cleanupError);
        }
        
        return { data: null, error: 'Failed to get image URL after upload' };
      }
      
      console.log('Image uploaded successfully. File path:', filePath);
      console.log('Public URL:', imageUrl);
      
      // Update the post record with the actual image path
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update({ image_path: filePath })
        .eq('id', postData.id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('Error updating post with image path:', updateError);
        // Continue anyway since the image is uploaded and basic post created
        return {
          data: {
            ...postData,
            image_path: filePath,
            user_name: userInfo.user_name,
            name: userInfo.name,
            likes_count: 0,
            has_liked: false
          },
          error: null
        };
      }
      
      const data = updatedPost || postData;

      console.log('Post created successfully with ID:', data.id);

      // Return the created post with user info
      return { 
        data: {
          ...data,
          user_name: userInfo.user_name,
          name: userInfo.name,
          likes_count: 0,
          has_liked: false
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return { data: null, error };
    }
  };

  // Like a post
  const likePost = async (postId: string) => {
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error liking post:', error);
      return { data: null, error };
    }
  };

  // Unlike a post
  const unlikePost = async (postId: string) => {
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .delete()
        .match({ post_id: postId, user_id: userId })
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error unliking post:', error);
      return { data: null, error };
    }
  };

  // Add a comment to a post
  const addComment = async (postId: string, content: string) => {
    if (!userId || !userInfo) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Return the comment with user info
      return { 
        data: {
          ...data,
          user_name: userInfo.user_name,
          name: userInfo.name
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { data: null, error };
    }
  };

  // Get comments for a post
  const getComments = async (postId: string) => {
    try {
      // First get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      if (!commentsData || commentsData.length === 0) {
        return { data: [], error: null };
      }
      
      // Then get user info for each comment
      const commentsWithUserInfo = await Promise.all(
        commentsData.map(async (comment) => {
          // Get user info
          const { data: userData } = await supabase
            .from('user_info')
            .select('user_name, name')
            .eq('user_id', comment.user_id)
            .maybeSingle();
            
          return {
            ...comment,
            user_name: userData?.user_name || null,
            name: userData?.name || null
          };
        })
      );

      return { data: commentsWithUserInfo, error: null };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { data: [], error };
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return null;
    }
    
    // Pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return null;
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    
    if (!result.canceled) {
      return result.assets[0].uri;
    }
    
    return null;
  };

  // Get posts by a specific user
  const fetchUserPosts = async (targetUserId?: string) => {
    const userIdToFetch = targetUserId || userId;
    
    if (!session) return { data: [], error: 'User not authenticated' };
    if (!userIdToFetch) return { data: [], error: 'No user ID provided' };
  
    try {
      console.log('Fetching posts for user:', userIdToFetch);
      
      // Get posts for the specific user
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userIdToFetch)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        throw postsError;
      }
      
      if (!postsData || postsData.length === 0) {
        console.log('No posts found for this user');
        return { data: [], error: null };
      }
      
      console.log(`Found ${postsData.length} posts for user ${userIdToFetch}`);
      
      // Get user info once for all posts since they're from the same user
      const { data: userData } = await supabase
        .from('user_info')
        .select('user_name, name')
        .eq('user_id', userIdToFetch)
        .maybeSingle();
        
      // Add user info to all posts
      const postsWithUserInfo = postsData.map(post => ({
        ...post,
        user_name: userData?.user_name || null,
        name: userData?.name || null
      }));
      
      // Then get likes information separately
      const likes = await Promise.all(
        postsWithUserInfo.map(async (post) => {
          try {
            // Get total likes count
            const { count, error: countError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);
              
            if (countError) {
              console.warn('Error getting likes count:', countError);
              return { postId: post.id, count: 0, hasLiked: false };
            }
              
            // Check if current user has liked this post
            const { data: userLike, error: likeError } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (likeError) {
              console.warn('Error checking if user liked post:', likeError);
            }
              
            return { 
              postId: post.id, 
              count: count || 0, 
              hasLiked: !!userLike
            };
          } catch (err) {
            console.error('Error processing likes for post:', err);
            return { postId: post.id, count: 0, hasLiked: false };
          }
        })
      );

      // Process the data to include likes_count and has_liked
      const processedData = postsWithUserInfo.map((post) => {
        const postLikes = likes.find((like) => like.postId === post.id);
        return {
          ...post,
          likes_count: postLikes?.count || 0,
          has_liked: postLikes?.hasLiked || false
        };
      });

      return { data: processedData, error: null };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return { data: [], error };
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadError,
    fetchPosts,
    createPost,
    pickImage,
    takePhoto,
    likePost,
    unlikePost,
    addComment,
    getComments,
    fetchUserPosts
  };
};
