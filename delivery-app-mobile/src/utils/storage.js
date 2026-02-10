import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// Token management
export const storage = {
  // Auth tokens
  async setAuthToken(token) {
    return AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  async getAuthToken() {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  async setRefreshToken(token) {
    return AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },
  
  async getRefreshToken() {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  
  // User data
  async setUserData(userData) {
    return AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },
  
  async getUserData() {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },
  
  async setUserType(userType) {
    return AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);
  },
  
  async getUserType() {
    return AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE);
  },
  
  // Onboarding
  async setOnboardingComplete(value = true) {
    return AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(value));
  },
  
  async getOnboardingComplete() {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value ? JSON.parse(value) : false;
  },
  
  // Clear all auth data
  async clearAuthData() {
    return AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.USER_TYPE,
    ]);
  },
  
  // Generic storage methods
  async setItem(key, value) {
    return AsyncStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  },
  
  async getItem(key) {
    const value = await AsyncStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  },
  
  async removeItem(key) {
    return AsyncStorage.removeItem(key);
  },
  
  async clear() {
    return AsyncStorage.clear();
  },
};

export default storage;
