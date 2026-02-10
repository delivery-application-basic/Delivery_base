/**
 * useLocation - Get current position and handle permissions
 * Uses expo-location for Expo Go compatibility; works in bare React Native with expo-location installed.
 */

import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { MAP_CONFIG } from '../utils/constants';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermissions = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }, []);

  const getCurrentPosition = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        ...options,
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setLocation(coords);
      setLoading(false);
      return coords;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setLocation(null);
      throw err;
    }
  }, []);

  const getLocationWithPermission = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      const err = new Error('Location permission denied');
      setError(err.message);
      throw err;
    }
    return getCurrentPosition();
  }, [requestPermissions, getCurrentPosition]);

  const defaultCenter = {
    latitude: MAP_CONFIG.DEFAULT_LATITUDE,
    longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
  };

  return {
    location: location || defaultCenter,
    loading,
    error,
    getCurrentPosition,
    getLocationWithPermission,
    requestPermissions,
    defaultCenter,
  };
};

export default useLocation;
