/**
 * LoginScreen - Phone + password, user_type from route or default customer. Backend: POST /auth/login
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { login, clearError } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { USER_TYPES } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validatePhone, validatePassword } from '../../utils/validators';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const userType = route.params?.userType ?? USER_TYPES.CUSTOMER;

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = async () => {
    const errs = {};
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) errs.phone = phoneCheck.message;
    const passCheck = validatePassword(password);
    if (!passCheck.valid) errs.password = passCheck.message;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    dispatch(clearError());
    try {
      await dispatch(login({ phone, password, userType })).unwrap();
      // AppNavigator will switch to main app
    } catch (e) {
      setErrors({ form: e || 'Login failed' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Sign in as {userType}</Text>
      <Input
        label="Phone number"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        placeholder="+251911234567"
        keyboardType="phone-pad"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        placeholder="••••••••"
      />
      {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <Button title="Sign in" onPress={handleLogin} loading={isLoading} style={styles.btn} />
      <Button
        title="Forgot password?"
        onPress={() => navigation.navigate('ForgotPassword', { userType })}
        mode="text"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: 48, backgroundColor: colors.background },
  title: { ...typography.h2, marginBottom: 4 },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  formError: { color: colors.error, marginBottom: spacing.sm },
  btn: { marginTop: spacing.sm, marginBottom: spacing.sm },
});
