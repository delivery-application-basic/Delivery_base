import { useState, useCallback } from 'react';
import { NativeModules, PermissionsAndroid, Platform, Alert } from 'react-native';
import { MAP_CONFIG } from '../utils/constants';

const { SimpleLocation } = NativeModules;

const defaultCenter = {
  latitude: MAP_CONFIG.DEFAULT_LATITUDE,
  longitude: MAP_CONFIG.DEFAULT_LONGITUDE,
};

/**
 * useLocation - Custom Native Location hook
 * Uses a project-internal Kotlin module for 100% Bridgeless compatibility in RN 0.83.
 *
 * Error codes from the native module:
 *   E_PERMISSION_DENIED - App doesn't have location permission
 *   E_LOCATION_NULL     - Device GPS/Location service is turned OFF
 *   E_LOCATION_ERROR    - Other native error
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // True when the device's location service (GPS) is confirmed OFF
  const [locationServiceDisabled, setLocationServiceDisabled] = useState(false);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to find nearby orders and track your delivery.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true; // iOS handles permissions differently
  }, []);

  /**
   * Check if the device's location service is enabled.
   * We do this by attempting a position fix and checking for E_LOCATION_NULL.
   * Returns: 'enabled' | 'disabled' | 'permission_denied' | 'error'
   */
  const checkLocationService = useCallback(async () => {
    try {
      await SimpleLocation.getCurrentPosition();
      setLocationServiceDisabled(false);
      return 'enabled';
    } catch (err) {
      const code = err?.code || '';
      if (code === 'E_LOCATION_NULL') {
        setLocationServiceDisabled(true);
        return 'disabled';
      }
      if (code === 'E_PERMISSION_DENIED') {
        return 'permission_denied';
      }
      return 'error';
    }
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
      setLocationServiceDisabled(false);
      return coords;
    } catch (err) {
      const code = err?.code || '';
      if (code === 'E_LOCATION_NULL') {
        // Device GPS is OFF — set the flag so callers can stop looping
        setLocationServiceDisabled(true);
        setError('Location service is disabled');
      } else {
        setError(err.message);
      }
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
    hasRealLocation: !!location,
    loading,
    error,
    locationServiceDisabled,
    getCurrentPosition,
    getLocationWithPermission,
    checkLocationService,
    requestPermissions,
    defaultCenter,
  };
};

export default useLocation;
