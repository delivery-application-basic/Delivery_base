/**
 * useLocation - Get current position and handle permissions
 */

import { useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { MAP_CONFIG } from '../utils/constants';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for delivery and nearby restaurants.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  }, []);

  const getCurrentPosition = useCallback(
    (options = {}) => {
      return new Promise((resolve, reject) => {
        setLoading(true);
        setError(null);
        Geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(coords);
            setLoading(false);
            resolve(coords);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
            setLocation(null);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
            ...options,
          }
        );
      });
    },
    []
  );

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
