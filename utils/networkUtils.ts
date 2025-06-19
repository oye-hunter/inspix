import NetInfo from '@react-native-community/netinfo';

/**
 * Checks if the device has an active internet connection
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
export const checkNetworkState = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (error) {
    console.error('Error checking network state:', error);
    return false;
  }
};

/**
 * Checks if a URL is reachable by attempting to fetch it with a HEAD request
 * @param {string} url - The URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} True if reachable, false otherwise
 */
export const isUrlReachable = async (url: string, timeout = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Error checking URL reachability:', error);
    return false;
  }
};
