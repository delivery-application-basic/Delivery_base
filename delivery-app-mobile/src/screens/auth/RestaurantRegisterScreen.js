/**
 * RestaurantRegisterScreen - Backend: POST /auth/register/restaurant
 * Body: restaurant_name, email (optional), phone_number, password, street_address, city, latitude, longitude
 * Latitude/longitude: copy from Google Maps (long-press on map → coordinates) for delivery fee calculation.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { USER_TYPES } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { validateRequired, validatePhone, validatePassword, validateEmail, validateLatitude, validateLongitude } from '../../utils/validators';

const FOCUS_SCROLL_OFFSET = 100;
const SCROLL_DELAY_MS = 150;

export default function RestaurantRegisterScreen() {
  const dispatch = useDispatch();
  const [restaurant_name, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [street_address, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [errors, setErrors] = useState({});
  const scrollRef = useRef(null);
  const fieldLayouts = useRef({});

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleFieldLayout = useCallback((key) => (e) => {
    const { y, height } = e.nativeEvent.layout;
    fieldLayouts.current[key] = { y, height };
  }, []);

  const scrollToFocusedInput = useCallback((key) => () => {
    setTimeout(() => {
      const layout = fieldLayouts.current[key];
      if (scrollRef.current && layout != null) {
        const scrollY = Math.max(0, layout.y - FOCUS_SCROLL_OFFSET);
        scrollRef.current.scrollTo({ y: scrollY, animated: true });
      } else {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    }, SCROLL_DELAY_MS);
  }, []);

  const handleRegister = async () => {
    const errs = {};
    if (!validateRequired(restaurant_name, 'Restaurant name').valid) errs.restaurant_name = 'Restaurant name is required';
    const phoneCheck = validatePhone(phone_number);
    if (!phoneCheck.valid) errs.phone_number = phoneCheck.message;
    if (email && !validateEmail(email).valid) errs.email = 'Invalid email';
    if (!validateRequired(street_address, 'Street address').valid) errs.street_address = 'Street address is required';
    if (!validateRequired(city, 'City').valid) errs.city = 'City is required';
    const latCheck = validateLatitude(latitude);
    if (!latCheck.valid) errs.latitude = latCheck.message;
    const lngCheck = validateLongitude(longitude);
    if (!lngCheck.valid) errs.longitude = lngCheck.message;
    const passCheck = validatePassword(password);
    if (!passCheck.valid) errs.password = passCheck.message;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    dispatch(clearError());
    try {
      await dispatch(register({
        userType: USER_TYPES.RESTAURANT,
        registrationData: {
          restaurant_name,
          email: email || undefined,
          phone_number,
          password,
          street_address,
          city,
          latitude: Number(String(latitude).trim()),
          longitude: Number(String(longitude).trim()),
        },
      })).unwrap();
    } catch (e) {
      setErrors({ form: e || 'Registration failed' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>Restaurant sign up</Text>
        <Input label="Restaurant name" value={restaurant_name} onChangeText={setRestaurantName} error={errors.restaurant_name} />
        <Input label="Phone number" value={phone_number} onChangeText={setPhone} error={errors.phone_number} placeholder="+251911234567" keyboardType="phone-pad" />
        <Input label="Email (optional)" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />
        <Input label="Street address" value={street_address} onChangeText={setStreetAddress} error={errors.street_address} />
        <View onLayout={handleFieldLayout('city')} collapsable={false}>
          <Input label="City" value={city} onChangeText={setCity} error={errors.city} onFocus={scrollToFocusedInput('city')} />
        </View>
        <Text style={styles.hint}>Get coordinates from Google Maps: long-press your location → tap the coordinates to copy.</Text>
        <View onLayout={handleFieldLayout('latitude')} collapsable={false}>
          <Input
            label="Latitude"
            value={latitude}
            onChangeText={setLatitude}
            error={errors.latitude}
            placeholder="e.g. 8.7525"
            keyboardType="decimal-pad"
            onFocus={scrollToFocusedInput('latitude')}
          />
        </View>
        <View onLayout={handleFieldLayout('longitude')} collapsable={false}>
          <Input
            label="Longitude"
            value={longitude}
            onChangeText={setLongitude}
            error={errors.longitude}
            placeholder="e.g. 38.9785"
            keyboardType="decimal-pad"
            onFocus={scrollToFocusedInput('longitude')}
          />
        </View>
        <View onLayout={handleFieldLayout('password')} collapsable={false}>
          <Input label="Password" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry onFocus={scrollToFocusedInput('password')} />
        </View>
        {errors.form && <Text style={styles.formError}>{errors.form}</Text>}
        {error && <Text style={styles.formError}>{error}</Text>}
        <Button title="Sign up" onPress={handleRegister} loading={isLoading} style={styles.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: spacing.xl,
    paddingTop: 48,
    paddingBottom: 120,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  title: { fontSize: 18, marginBottom: 16 },
  hint: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  formError: { color: colors.error, fontSize: 12, marginBottom: spacing.sm },
  btn: { marginTop: spacing.sm },
});
