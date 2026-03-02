/**
 * RestaurantRegisterScreen - Backend: POST /auth/register/restaurant
 * Body: restaurant_name, email (optional), phone_number, password, street_address, city, latitude, longitude
 * Latitude/longitude: copy from Google Maps (long-press on map → coordinates) for delivery fee calculation.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-paper';
import { register, clearError } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { USER_TYPES } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { geocodingService } from '../../api/services/geocodingService';
import { useLocation } from '../../hooks/useLocation';
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
  const [cuisine_type, setCuisineType] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const scrollRef = useRef(null);
  const fieldLayouts = useRef({});
  const { getLocationWithPermission, checkLocationService } = useLocation();

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

  const handleDetectLocation = async () => {
    try {
      setIsDetecting(true);
      const serviceStatus = await checkLocationService();
      if (serviceStatus !== 'enabled') {
        Alert.alert('Location Disabled', 'Please enable GPS/Location services on your device.');
        return;
      }

      const coords = await getLocationWithPermission();
      if (coords) {
        setLatitude(coords.latitude.toString());
        setLongitude(coords.longitude.toString());

        // Auto-fill address using reverse geocoding
        const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
        if (addressData) {
          if (addressData.street_address) {
            setStreetAddress(addressData.street_address);
            setSearchQuery(addressData.street_address);
          }
          if (addressData.city) setCity(addressData.city);
          setSuggestions([]); // Clear suggestions list
          Alert.alert('Location Detected', 'Coordinates and address have been updated.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Could not detect your current location.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSearchChange = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      const results = await geocodingService.autocomplete(text);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (item) => {
    setStreetAddress(item.street_address);
    setCity(item.city);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setSearchQuery(item.formatted_address || item.street_address);
    setSuggestions([]);
  };

  const handleRegister = async () => {
    const errs = {};
    if (!validateRequired(restaurant_name, 'Restaurant name').valid) errs.restaurant_name = 'Restaurant name is required';
    const phoneCheck = validatePhone(phone_number);
    if (!phoneCheck.valid) errs.phone_number = phoneCheck.message;
    if (email && !validateEmail(email).valid) errs.email = 'Invalid email';
    if (!validateRequired(street_address, 'Location').valid) errs.street_address = 'Location is required';
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
      const result = await dispatch(register({
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
          cuisine_type,
        },
      })).unwrap();

      // If registration success and we have a logo, upload it
      const restaurantId = result.user?.id;
      if (restaurantId && logoUri) {
        try {
          const { restaurantService } = require('../../api/services/restaurantService');
          await restaurantService.uploadLogo(restaurantId, logoUri);
        } catch (uploadErr) {
          console.error('Logo upload failed:', uploadErr);
          // Just alert, don't fail registration
          Alert.alert('Registration Success', 'Your account was created but logo upload failed. You can update it in profile settings.');
        }
      }
    } catch (e) {
      setErrors({ form: e || 'Registration failed' });
    }
  };

  const handleSelectLogo = async () => {
    const { launchImageLibrary } = require('react-native-image-picker');
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (result.assets?.[0]?.uri) {
      setLogoUri(result.assets[0].uri);
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
        <TouchableOpacity style={styles.logoPicker} onPress={handleSelectLogo}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon source="camera-plus" size={32} color={colors.primary} />
              <Text style={styles.logoText}>Add Logo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label="Restaurant name" value={restaurant_name} onChangeText={setRestaurantName} error={errors.restaurant_name} />
        <Input label="Cuisine Type" value={cuisine_type} onChangeText={setCuisineType} placeholder="e.g. Pizza, Ethiopian, Burgers" />
        <Input label="Phone number" value={phone_number} onChangeText={setPhone} error={errors.phone_number} placeholder="+251911234567" keyboardType="phone-pad" />
        <Input label="Email (optional)" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />

        <View style={styles.sectionDivider} />

        <View style={styles.locationHeader}>
          <Text style={styles.label}>Location Details</Text>
          <TouchableOpacity
            style={styles.detectBtn}
            onPress={handleDetectLocation}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <ActivityIndicator size={14} color={colors.primary} />
            ) : (
              <Icon source="target" size={16} color={colors.primary} />
            )}
            <Text style={styles.detectText}>Detect Current</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer} onLayout={handleFieldLayout('location')} collapsable={false}>
          <Input
            label="Location"
            value={searchQuery}
            onChangeText={(text) => {
              handleSearchChange(text);
              setStreetAddress(text);
            }}
            placeholder="Search for your restaurant location..."
            leftIcon="map-marker"
            error={errors.street_address}
            onFocus={scrollToFocusedInput('location')}
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Icon source="map-marker-outline" size={20} color={colors.primary} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>{item.street_address}</Text>
                    <Text style={styles.suggestionSub} numberOfLines={1}>{item.city}{item.sub_city ? `, ${item.sub_city}` : ''}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }} onLayout={handleFieldLayout('latitude')} collapsable={false}>
            <Input
              label="Latitude"
              value={latitude?.toString()}
              onChangeText={(v) => {
                setLatitude(v);
                setStreetAddress(searchQuery);
              }}
              error={errors.latitude}
              keyboardType="decimal-pad"
              onFocus={scrollToFocusedInput('latitude')}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={{ flex: 1 }} onLayout={handleFieldLayout('longitude')} collapsable={false}>
            <Input
              label="Longitude"
              value={longitude?.toString()}
              onChangeText={(v) => {
                setLongitude(v);
                setStreetAddress(searchQuery);
              }}
              error={errors.longitude}
              keyboardType="decimal-pad"
              onFocus={scrollToFocusedInput('longitude')}
            />
          </View>
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
  logoPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[100],
    alignSelf: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  logoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  hint: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  formError: { color: colors.error, fontSize: 12, marginBottom: spacing.sm },
  btn: { marginTop: spacing.sm },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  detectText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.md,
    zIndex: 10,
  },
  suggestionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: -spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 250,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  suggestionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
