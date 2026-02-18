import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { loadUserFromStorage } from '../store/slices/authSlice';
import { colors } from '../theme/colors';
import { USER_TYPES } from '../utils/constants';
import { sendDriverHeartbeat } from '../store/slices/driverSlice';

// Navigators
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import RestaurantNavigator from './RestaurantNavigator';
import DriverNavigator from './DriverNavigator';

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, isLoading } = useSelector((state) => state.auth);
  const { isAvailable } = useSelector((state) => state.driver);

  useEffect(() => {
    // Load user data from storage on app start
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated || userType !== USER_TYPES.DRIVER || !isAvailable) return;

    // Send immediately once, then every 3 minutes
    dispatch(sendDriverHeartbeat());
    const intervalId = setInterval(() => {
      dispatch(sendDriverHeartbeat());
    }, 180000);

    return () => clearInterval(intervalId);
  }, [dispatch, isAuthenticated, userType, isAvailable]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Determine which navigator to show based on auth state and user type
  const getNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (userType) {
      case USER_TYPES.CUSTOMER:
        return <CustomerNavigator />;
      case USER_TYPES.RESTAURANT:
        return <RestaurantNavigator />;
      case USER_TYPES.DRIVER:
        return <DriverNavigator />;
      default:
        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
};

export default AppNavigator;
