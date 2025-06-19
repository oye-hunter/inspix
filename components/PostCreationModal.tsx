import { useAuth } from '@/context/AuthContext';
import { usePostsStorage } from '@/hooks/usePostsStorage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { checkNetworkState } from '@/utils/networkUtils';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type PostCreationModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
};

export default function PostCreationModal({ isVisible, onClose, onPostCreated }: PostCreationModalProps) {
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const router = useRouter();
  const { session } = useAuth();
  
  const { pickImage, takePhoto, createPost, isUploading } = usePostsStorage();
  
  // Check authentication status
  useEffect(() => {
    if (isVisible && !session) {
      Alert.alert(
        "Authentication Required", 
        "Please sign in to create posts.", 
        [{ text: "Sign In", onPress: () => {
          onClose();
          router.push('/(auth)/sign-in');
        }}]
      );
    }
  }, [isVisible, session, router]);
  
  const resetState = () => {
    setCaption('');
    setImageUri(null);
    setIsLoading(false);
    setUploadError(null);
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setImageUri(uri);
    }
  };
  
  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) {
      setImageUri(uri);
    }
  };
  
  const handleCreatePost = async () => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select an image for your post');
      return;
    }
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Already processing, ignoring duplicate submit');
      return;
    }
    
    setIsLoading(true);
    setUploadError(null);
    
    try {
      // Check internet connection before proceeding
      const netState = await checkNetworkState();
      if (!netState) {
        setUploadError('No internet connection. Please check your network and try again.');
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      console.log('Creating post with image:', imageUri.substring(0, 30) + '...');
      
      // Compress the image before upload
      let finalUri = imageUri;
      
      // Validate the image is accessible before attempting to upload
      try {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (!fileInfo.exists || fileInfo.size === 0) {
          setUploadError('Image file is inaccessible. Please select another image.');
          throw new Error('Image file is inaccessible');
        }
        
        if (fileInfo.size > 5 * 1024 * 1024) { // If larger than 5MB
          setUploadError('Image is too large. Please select a smaller image.');
          throw new Error('Image file is too large');
        }
      } catch (fileError) {
        console.error('Error validating file:', fileError);
        setUploadError('Could not validate the selected image. Please try again with a different image.');
        throw new Error('File validation error');
      }
      
      // Attempt the post creation
      const { data, error } = await createPost(finalUri, caption);
      
      if (error || !data) {
        const errorMsg = typeof error === 'string' 
          ? error 
          : error instanceof Error 
            ? error.message 
            : 'Failed to create post';
        setUploadError(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Post was created successfully
      console.log('Post created successfully');
      resetState();
      onClose();
      onPostCreated();
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.message?.includes('Network request failed') || 
          error.message?.includes('network') ||
          error.message?.includes('connection')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message?.includes('image')) {
        errorMessage = 'There was a problem with your image. Please try a different image or take a new photo.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller image or check your connection.';
      }
      
      setUploadError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <ThemedView style={styles.modalView}>
          <View style={styles.header}>
            <ThemedText style={styles.headerText}>Create New Post</ThemedText>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="cancel" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.changeImageButton} 
                  onPress={handlePickImage}
                >
                  <ThemedText style={styles.changeImageText}>Change Image</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.imageButton, { borderColor: tint }]} 
                  onPress={handlePickImage}
                >
                  <MaterialIcons name="photo-library" size={24} color={tint} />
                  <ThemedText style={styles.imageButtonText}>Choose from Gallery</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.imageButton, { borderColor: tint }]} 
                  onPress={handleTakePhoto}
                >
                  <MaterialIcons name="camera-alt" size={24} color={tint} />
                  <ThemedText style={styles.imageButtonText}>Take a Photo</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.captionSection}>
            <ThemedText style={styles.label}>Caption</ThemedText>
            <TextInput
              style={[styles.captionInput, { color: textColor, borderColor: textColor + '50' }]}
              placeholder="Write a caption..."
              placeholderTextColor={textColor + '80'}
              multiline
              value={caption}
              onChangeText={setCaption}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            {uploadError && (
              <ThemedText style={styles.errorText}>
                {uploadError}
              </ThemedText>
            )}
            
            <TouchableOpacity 
              style={[
                styles.postButton, 
                { backgroundColor: tint },
                (!imageUri || isLoading) && styles.disabledButton
              ]} 
              onPress={handleCreatePost}
              disabled={!imageUri || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.postButtonText}>Post</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageSection: {
    marginBottom: 20,
  },
  imageButtonsContainer: {
    gap: 10,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
    gap: 10,
  },
  imageButtonText: {
    fontWeight: '500',
  },
  selectedImageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  changeImageButton: {
    padding: 8,
  },
  changeImageText: {
    fontWeight: '500',
  },
  captionSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  postButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
