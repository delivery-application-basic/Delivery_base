/**
 * UserTypeSelectScreen - Choose Customer, Restaurant, or Driver then Login or Register
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/common/Button';
import { USER_TYPES } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function UserTypeSelectScreen({ navigation }) {
  const goLogin = (userType) => {
    navigation.navigate('Login', { userType });
  };
  const goRegister = (userType) => {
    if (userType === USER_TYPES.CUSTOMER) navigation.navigate('CustomerRegister');
    else if (userType === USER_TYPES.RESTAURANT) navigation.navigate('RestaurantRegister');
    else navigation.navigate('DriverRegister');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>I am a...</Text>
      <View style={styles.buttons}>
        <Button title="Customer" onPress={() => goLogin(USER_TYPES.CUSTOMER)} mode="contained" style={styles.btn} />
        <Button title="Restaurant owner" onPress={() => goLogin(USER_TYPES.RESTAURANT)} mode="contained" style={styles.btn} />
        <Button title="Driver" onPress={() => goLogin(USER_TYPES.DRIVER)} mode="contained" style={styles.btn} />
      </View>
      <Text style={styles.or}>or</Text>
      <View style={styles.buttons}>
        <Button title="Sign up as Customer" onPress={() => goRegister(USER_TYPES.CUSTOMER)} mode="outlined" style={styles.btn} />
        <Button title="Sign up as Restaurant" onPress={() => goRegister(USER_TYPES.RESTAURANT)} mode="outlined" style={styles.btn} />
        <Button title="Sign up as Driver" onPress={() => goRegister(USER_TYPES.DRIVER)} mode="outlined" style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', backgroundColor: colors.background },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.lg },
  buttons: { gap: spacing.sm, marginBottom: spacing.md },
  btn: { marginBottom: spacing.sm },
  or: { textAlign: 'center', color: colors.textSecondary, marginVertical: spacing.sm },
});
