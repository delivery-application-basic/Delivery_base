import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, View, Modal, Text, StyleSheet } from 'react-native';
import { loadUserFromStorage } from '../store/slices/authSlice';
import { colors } from '../theme/colors';
import { USER_TYPES } from '../utils/constants';
import { sendDriverHeartbeat } from '../store/slices/driverSlice';
import { Button } from '../components/common/Button';
import { useSocket } from '../hooks/useSocket';
import driverService from '../api/services/driverService';

// Navigators
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import RestaurantNavigator from './RestaurantNavigator';
import DriverNavigator from './DriverNavigator';

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, isLoading } = useSelector((state) => state.auth);
  const { isAvailable } = useSelector((state) => state.driver);
  const navigationRef = useNavigationContainerRef();
  const { subscribeToDriverAssignment } = useSocket();

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

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

  const assignmentHandler = useCallback((data) => {
    setAssignmentData(data);
    setShowAssignmentModal(true);
    setTimeLeft(45);
  }, []);

  useEffect(() => {
    if (userType === USER_TYPES.DRIVER && isAuthenticated) {
      const unsubscribe = subscribeToDriverAssignment(assignmentHandler);
      return unsubscribe;
    }
  }, [userType, isAuthenticated, subscribeToDriverAssignment, assignmentHandler]);

  // Countdown timer
  useEffect(() => {
    if (!showAssignmentModal || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [showAssignmentModal, timeLeft]);

  // Handle expiration
  useEffect(() => {
    if (timeLeft === 0 && showAssignmentModal) {
      setShowAssignmentModal(false);
      setAssignmentData(null);
      if (navigationRef.isReady()) {
        navigationRef.navigate('Dashboard', { screen: 'AvailableOrders' });
      }
    }
  }, [timeLeft, showAssignmentModal, navigationRef]);

  const handleAccept = async () => {
    try {
      await driverService.acceptAssignment(assignmentData.order_id);
      setShowAssignmentModal(false);
      setAssignmentData(null);
      // Navigate to active delivery
      if (navigationRef.isReady()) {
        navigationRef.navigate('Dashboard', { screen: 'ActiveDelivery' });
      }
    } catch (e) {
      // Handle error, perhaps show alert
      console.error('Accept assignment failed:', e);
    }
  };

  const handleReject = async () => {
    try {
      await driverService.rejectAssignment(assignmentData.order_id);
      setShowAssignmentModal(false);
      setAssignmentData(null);
    } catch (e) {
      console.error('Reject assignment failed:', e);
    }
  };

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
    <NavigationContainer ref={navigationRef}>
      {getNavigator()}
      <Modal visible={showAssignmentModal} animationType="none" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Order Offer</Text>
            {assignmentData && (
              <>
                <Text style={styles.modalText}>Distance: {assignmentData.distance_km} km</Text>
                <Text style={styles.modalText}>Time left: {timeLeft}s</Text>
                <View style={styles.modalButtons}>
                  <Button title="Accept" onPress={handleAccept} style={styles.modalButton} />
                  <Button title="Reject" onPress={handleReject} style={styles.modalButton} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default AppNavigator;
