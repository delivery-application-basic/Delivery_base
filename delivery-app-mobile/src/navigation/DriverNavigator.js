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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
