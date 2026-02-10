/**
 * RegisterScreen - Routes to Customer, Restaurant, or Driver registration by userType.
 * Aligns with plan 11.2 single RegisterScreen entry; actual flows are in *RegisterScreen.js
 */

import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomerRegisterScreen from './CustomerRegisterScreen';
import RestaurantRegisterScreen from './RestaurantRegisterScreen';
import DriverRegisterScreen from './DriverRegisterScreen';
import { USER_TYPES } from '../../utils/constants';

export const RegisterScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const userType = route.params?.userType || USER_TYPES.CUSTOMER;

  switch (userType) {
    case USER_TYPES.RESTAURANT:
      return <RestaurantRegisterScreen />;
    case USER_TYPES.DRIVER:
      return <DriverRegisterScreen />;
    case USER_TYPES.CUSTOMER:
    default:
      return <CustomerRegisterScreen />;
  }
};

export default RegisterScreen;
