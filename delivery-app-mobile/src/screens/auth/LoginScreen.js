/**
 * LoginScreen - Phone + password, user_type from route or default customer. Backend: POST /auth/login
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Sign in as {userType}</Text>
        </View>
        <View style={styles.form}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: { 
    flexGrow: 1,
    padding: spacing.xl, 
    paddingTop: 24,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: { 
    ...typography.h2, 
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: { 
    ...typography.bodySmall, 
    color: colors.textSecondary,
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  formError: { 
    color: colors.error, 
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
    marginTop: -spacing.sm,
  },
  btn: { 
    marginTop: spacing.md, 
    marginBottom: spacing.sm,
  },
});
