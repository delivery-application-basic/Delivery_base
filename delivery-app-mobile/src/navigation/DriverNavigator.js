import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';
import { colors } from '../theme/colors';

// Screens
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import AvailableOrdersScreen from '../screens/driver/AvailableOrdersScreen';
import ActiveDeliveryScreen from '../screens/driver/ActiveDeliveryScreen';
import DeliveryHistoryScreen from '../screens/driver/DeliveryHistoryScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';
import ProfileScreen from '../screens/driver/ProfileScreen';
import SettingsScreen from '../screens/driver/SettingsScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadows } from '../theme/shadows';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="DashboardMain" component={DriverDashboardScreen} />
    <Stack.Screen name="AvailableOrders" component={AvailableOrdersScreen} />
    <Stack.Screen name="ActiveDelivery" component={ActiveDeliveryScreen} />
  </Stack.Navigator>
);

// History Stack
const HistoryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} />
    <Stack.Screen name="Earnings" component={EarningsScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Main Driver Tab Navigator
const DriverNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
  const tabBarHeight = 55 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          borderTopWidth: 0,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: tabBarHeight,
          backgroundColor: colors.white,
          ...shadows.medium,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 24,
          zIndex: 999,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-dashboard" size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="history" size={size} color={color} />
          ),
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="account" size={size} color={color} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default DriverNavigator;
