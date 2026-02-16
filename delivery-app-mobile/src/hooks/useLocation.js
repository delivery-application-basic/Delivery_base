import { useState, useCallback } from 'react';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { MAP_CONFIG } from '../utils/constants';

const { SimpleLocation } = NativeModules;

const defaultCenter = {
  latitude: MAP_CONFIG.DEFAULT_LATITUDE,
  longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
};

/**
 * useLocation - Custom Native Location hook
 * Uses a project-internal Kotlin module for 100% Bridgeless compatibility in RN 0.83.
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to deliver your food.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  }, []);

  const getCurrentPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await SimpleLocation.getCurrentPosition();
      const coords = {
        latitude: position.latitude,
        longitude: position.longitude,
      };
      setLocation(coords);
      return coords;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocationWithPermission = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      throw new Error('Permission denied');
    }
    return getCurrentPosition();
  }, [requestPermissions, getCurrentPosition]);

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
