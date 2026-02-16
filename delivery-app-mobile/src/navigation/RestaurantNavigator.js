import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';
import { colors } from '../theme/colors';

// Screens
import RestaurantDashboardScreen from '../screens/restaurant/RestaurantDashboardScreen';
import IncomingOrdersScreen from '../screens/restaurant/IncomingOrdersScreen';
import BranchOrdersOverviewScreen from '../screens/restaurant/BranchOrdersOverviewScreen';
import ActiveOrdersScreen from '../screens/restaurant/ActiveOrdersScreen';
import OrderDetailsScreen from '../screens/restaurant/OrderDetailsScreen';
import OrderHistoryScreen from '../screens/restaurant/OrderHistoryScreen';
import MenuManagementScreen from '../screens/restaurant/MenuManagementScreen';
import AddMenuItemScreen from '../screens/restaurant/AddMenuItemScreen';
import EditMenuItemScreen from '../screens/restaurant/EditMenuItemScreen';
import RestaurantProfileScreen from '../screens/restaurant/RestaurantProfileScreen';
import OperatingHoursScreen from '../screens/restaurant/OperatingHoursScreen';
import EditRestaurantScreen from '../screens/restaurant/EditRestaurantScreen';
import SettingsScreen from '../screens/restaurant/SettingsScreen';
import BranchesScreen from '../screens/restaurant/BranchesScreen';
import RegisterBranchScreen from '../screens/restaurant/RegisterBranchScreen';
import SettingsBranchSelectScreen from '../screens/restaurant/SettingsBranchSelectScreen';

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
    <Stack.Screen name="DashboardMain" component={RestaurantDashboardScreen} />
    <Stack.Screen name="BranchOrdersOverview" component={BranchOrdersOverviewScreen} />
    <Stack.Screen name="IncomingOrders" component={IncomingOrdersScreen} />
    <Stack.Screen name="ActiveOrders" component={ActiveOrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
  </Stack.Navigator>
);

// Branches/Menu Stack
const BranchesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="BranchesMain" component={BranchesScreen} />
    <Stack.Screen name="RegisterBranch" component={RegisterBranchScreen} />
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
    <Stack.Screen name="SettingsBranchSelect" component={SettingsBranchSelectScreen} />
    <Stack.Screen name="OperatingHours" component={OperatingHoursScreen} />
    <Stack.Screen name="EditRestaurant" component={EditRestaurantScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Main Restaurant Tab Navigator
const RestaurantNavigator = () => {
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
        name="Restaurants"
        component={BranchesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="storefront" size={size} color={color} />
          ),
          tabBarLabel: 'Restaurants',
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
