import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from 'react-native-paper';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/customer/HomeScreen';
import RestaurantListScreen from '../screens/customer/RestaurantListScreen';
import RestaurantDetailScreen from '../screens/customer/RestaurantDetailScreen';
import MenuScreen from '../screens/customer/MenuScreen';
import MenuItemDetailScreen from '../screens/customer/MenuItemDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import SelectAddressScreen from '../screens/customer/SelectAddressScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import TrackOrderScreen from '../screens/customer/TrackOrderScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import AddressManagementScreen from '../screens/customer/AddressManagementScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
    <Stack.Screen name="Menu" component={MenuScreen} />
    <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="SelectAddress" component={SelectAddressScreen} />
  </Stack.Navigator>
);

// Orders Stack Navigator
const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Main Customer Tab Navigator
const CustomerNavigator = () => {
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
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="home" size={size} color={color} />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon source="clipboard-list" size={size} color={color} />
          ),
          tabBarLabel: 'Orders',
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

export default CustomerNavigator;
