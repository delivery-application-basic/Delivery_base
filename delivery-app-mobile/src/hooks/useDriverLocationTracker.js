import { useEffect, useRef, useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { useLocation } from './useLocation';
import { driverService } from '../api/services/driverService';
import { sendDriverHeartbeat } from '../store/slices/driverSlice';
import { geocodingService } from '../api/services/geocodingService';

// How often to send location updates in each mode
const IDLE_INTERVAL_MS = 3 * 60 * 1000;      // 3 minutes when ACTIVE but waiting for orders
const DELIVERY_INTERVAL_MS = 1 * 60 * 1000;  // 1 minute when actively delivering

/**
 * Simple in-memory cache for geocoding results.
 * Key: 'lat,lng' (e.g., '8.7525,38.9785')
 * Value: place name string or null (if failed)
 */
const geocodingCache = new Map();

/**
 * useDriverLocationTracker
 *
 * Manages the driver's GPS location tracking lifecycle:
 *  - INACTIVE:  No tracking. Saves battery.
 *  - ACTIVE (idle): Sends location every 3 minutes + heartbeat.
 *  - ON DELIVERY: Sends location every 1 minute for customer live map.
 *
 * Handles the case where device GPS is OFF:
 *  - Shows a one-time alert asking the driver to enable location.
 *  - Stops all location attempts until they manually retry.
 *
 * @param {boolean} isAvailable - Whether the driver is ACTIVE
 * @param {boolean} isOnDelivery - Whether the driver has an active delivery
 */
export const useDriverLocationTracker = (isAvailable, isOnDelivery) => {
    const dispatch = useDispatch();
    const { getCurrentPosition, checkLocationService } = useLocation();
    const intervalRef = useRef(null);
    const locationDisabledRef = useRef(false); // Prevents repeated alerts
    const hasShownAlertRef = useRef(false);
    // Last successfully fetched GPS coordinates — exposed to UI for display
    const [lastLocation, setLastLocation] = useState(null);
    const [lastPlaceName, setLastPlaceName] = useState(null);

    /**
     * Show a one-time alert when GPS is detected as OFF.
     * Stops the tracking loop immediately.
     */
    const handleLocationDisabled = useCallback(() => {
        if (hasShownAlertRef.current) return;
        hasShownAlertRef.current = true;

        // Stop the interval immediately so we don't keep trying
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        locationDisabledRef.current = true;

        Alert.alert(
            '📍 Location is Off',
            'Your device location (GPS) is turned off. Please enable it in your device Settings to receive orders and track your delivery.\n\nTracking has been paused.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Reset the flag so if they come back to the screen after enabling GPS, it can retry
                        hasShownAlertRef.current = false;
                    },
                },
            ],
            { cancelable: false }
        );
    }, []);

    /**
     * Fetch current GPS position and send it to the backend.
     * Returns false if GPS is off (so the caller can stop the loop).
     */
    const sendLocationUpdate = useCallback(async () => {
        if (locationDisabledRef.current) return false;

        const coords = await getCurrentPosition();

        if (!coords) {
            // getCurrentPosition returns null when GPS is off (E_LOCATION_NULL)
            handleLocationDisabled();
            return false;
        }

        // Store the coords so the UI can display them
        setLastLocation(coords);

        // Reverse geocode to get place name
        const cacheKey = `${coords.latitude.toFixed(4)},${coords.longitude.toFixed(4)}`;
        if (!geocodingCache.has(cacheKey)) {
          try {
            const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
            const placeName = addressData?.formatted_address || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
            geocodingCache.set(cacheKey, placeName);
            setLastPlaceName(placeName);
          } catch (error) {
            console.warn('[LocationTracker] Geocoding failed:', error.message);
            const fallback = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
            geocodingCache.set(cacheKey, fallback);
            setLastPlaceName(fallback);
          }
        } else {
          setLastPlaceName(geocodingCache.get(cacheKey));
        }
        try {
            await driverService.updateLocation(coords.latitude, coords.longitude);
        } catch (e) {
            // Network errors are non-fatal — we'll retry on the next interval
            console.warn('[LocationTracker] Failed to send location update:', e.message);
        }

        return true;
    }, [getCurrentPosition, handleLocationDisabled]);

    /**
     * Start the tracking interval.
     * Checks GPS is available first before starting the loop.
     */
    const startTracking = useCallback(async (intervalMs) => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Pre-check: is GPS actually on before we start a loop?
        const serviceStatus = await checkLocationService();
        if (serviceStatus === 'disabled') {
            handleLocationDisabled();
            return;
        }
        if (serviceStatus === 'permission_denied') {
            Alert.alert(
                'Location Permission Required',
                'Please allow location access in your app settings to receive orders.',
                [{ text: 'OK' }]
            );
            return;
        }

        // Reset the disabled flag since GPS is now confirmed on
        locationDisabledRef.current = false;
        hasShownAlertRef.current = false;

        // Send immediately on start, then on interval
        sendLocationUpdate();

        intervalRef.current = setInterval(async () => {
            const success = await sendLocationUpdate();
            if (!success) {
                // GPS went off mid-session — interval already cleared inside handleLocationDisabled
                return;
            }
        }, intervalMs);
    }, [checkLocationService, handleLocationDisabled, sendLocationUpdate]);

    /**
     * Stop all tracking and clear the interval.
     */
    const stopTracking = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Main effect: react to state changes
    useEffect(() => {
        if (!isAvailable) {
            // Driver is INACTIVE — stop everything
            stopTracking();
            return;
        }

        if (isOnDelivery) {
            // ON DELIVERY — track every 1 minute for customer live map
            startTracking(DELIVERY_INTERVAL_MS);
        } else {
            // ACTIVE but idle — track every 3 minutes + send heartbeat
            startTracking(IDLE_INTERVAL_MS);
            // Also dispatch the Redux heartbeat so the server knows the driver is alive
            dispatch(sendDriverHeartbeat());
        }

        // Cleanup when effect re-runs or component unmounts
        return () => stopTracking();
    }, [isAvailable, isOnDelivery, startTracking, stopTracking, dispatch]);

    const retryTracking = () => {
        locationDisabledRef.current = false;
        hasShownAlertRef.current = false;
        if (isAvailable) {
            startTracking(isOnDelivery ? DELIVERY_INTERVAL_MS : IDLE_INTERVAL_MS);
        }
    };

    return {
        retryTracking,
        lastLocation,
        lastPlaceName,
    };
};

export default useDriverLocationTracker;
