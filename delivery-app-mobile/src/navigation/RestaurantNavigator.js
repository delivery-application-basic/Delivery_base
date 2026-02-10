import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';
import { colors } from '../theme/colors';

// Screens
import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import IncomingOrdersScreen from '../screens/restaurant/IncomingOrdersScreen';
import ActiveOrdersScreen from '../screens/restaurant/ActiveOrdersScreen';
import OrderDetailsScreen from '../screens/restaurant/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/restaurant/OrderHistoryScreen';
import MenuManagementScreen from '../screens/restaurant/MenuManagementScreen';
import AddMenuItemScreen from '../screens/restaurant/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/restaurant/EditMenuItemScreen';
import RestaurantProfileScreen from '../screens/restaurant/RestaurantProfileScreen';
import OperatingHoursScreen from '../screens/restaurant/OperatingHoursScreen';
import SettingsScreen from '../screens/restaurant/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="DashboardMain" component={RestaurantDashboardScreen} />
    <Stack.Screen name="IncomingOrders" component={IncomingOrdersScreen} />
    <Stack.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
  </Stack.Navigator>
);

// Menu Stack
const MenuStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MenuManagement" component={MenuManagementScreen} />
    <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
    <Stack.Screen name="EditMenuItem" component={EditMenuItemScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain" component={RestaurantProfileScreen} />
    <Stack.Screen name="OperatingHours" component={OperatingHoursScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Main Restaurant Tab Navigator
const RestaurantNavigator = () => {
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
        name="Menu"
        component={MenuStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="food" size={size} color={color} />
          ),
          tabBarLabel: 'Menu',
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

export default RestaurantNavigator;
