import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { authService } from '../../api/services/authService';
import { geocodingService } from '../../api/services/geocodingService';
import { useLocation } from '../../hooks/useLocation';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';
import { MAP_CONFIG } from '../../utils/constants';
import { validateRequired, validateLatitude, validateLongitude } from '../../utils/validators';

const FOCUS_SCROLL_OFFSET = 100;
const SCROLL_DELAY_MS = 150;

export default function RegisterBranchScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user } = useSelector((state) => state.auth);

    const [restaurant_name, setRestaurantName] = useState('');
    const [street_address, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [cuisine_type, setCuisineType] = useState('');
    const [password, setPassword] = useState('');
    const [logoUri, setLogoUri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [errors, setErrors] = useState({});

    const { getLocationWithPermission, checkLocationService } = useLocation();

    const scrollRef = useRef(null);
    const fieldLayouts = useRef({});

    const handleFieldLayout = (key) => (e) => {
        const { y, height } = e.nativeEvent.layout;
        fieldLayouts.current[key] = { y, height };
    };

    const scrollToFocusedInput = (key) => () => {
        setTimeout(() => {
            const layout = fieldLayouts.current[key];
            if (scrollRef.current && layout != null) {
                const scrollY = Math.max(0, layout.y - FOCUS_SCROLL_OFFSET);
                scrollRef.current.scrollTo({ y: scrollY, animated: true });
            }
        }, SCROLL_DELAY_MS);
    };

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

                const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
                if (addressData) {
                    if (addressData.street_address) {
                        setStreetAddress(addressData.street_address);
                        setSearchQuery(addressData.street_address);
                    }
                    if (addressData.city) setCity(addressData.city);
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
        const phone = user?.phone_number;
        if (!phone) {
            Alert.alert('Error', 'Could not detect your phone number. Please log out and log in again.');
            return;
        }

        const errs = {};
        if (!validateRequired(restaurant_name, 'Branch name').valid) errs.restaurant_name = 'Branch name is required';
        if (!validateRequired(street_address, 'Street address').valid) errs.street_address = 'Street address is required';
        if (!validateRequired(city, 'City').valid) errs.city = 'City is required';
        if (!validateRequired(password, 'Password').valid) errs.password = 'Existing account password is required';

        const latCheck = validateLatitude(latitude);
        if (!latCheck.valid) errs.latitude = latCheck.message;
        const lngCheck = validateLongitude(longitude);
        if (!lngCheck.valid) errs.longitude = lngCheck.message;

        setErrors(errs);
        if (Object.keys(errs).length) return;

        setIsLoading(true);
        try {
            const registrationData = {
                restaurant_name: restaurant_name.trim(),
                phone_number: phone,
                password: password,
                street_address: street_address.trim(),
                city: city.trim(),
                latitude: latitude ? Number(latitude) : undefined,
                longitude: longitude ? Number(longitude) : undefined,
                cuisine_type: cuisine_type.trim() || undefined,
                email: user?.email || undefined
            };

            const response = await authService.registerRestaurant(registrationData);
            const newRes = response.data;
            const newRestaurantId = newRes.user?.id || newRes.user?.restaurant_id;

            if (newRestaurantId && logoUri) {
                try {
                    const { restaurantService } = require('../../api/services/restaurantService');
                    await restaurantService.uploadLogo(newRestaurantId, logoUri);
                } catch (logoErr) {
                    console.error('Logo upload failed:', logoErr);
                }
            }

            Alert.alert('Success', 'New branch registered successfully!');
            navigation.goBack();
        } catch (e) {
            const msg = e.response?.data?.message || e.response?.data?.errors?.[0]?.msg || 'Failed to register branch';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
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
        >
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon source="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Add New Branch</Text>
                    <Text style={styles.headerSubtitle}>Expanding your business</Text>
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity style={styles.logoPicker} onPress={handleSelectLogo}>
                    {logoUri ? (
                        <Image source={{ uri: logoUri }} style={styles.logoPreview} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Icon source="camera-plus" size={32} color={colors.primary} />
                            <Text style={styles.logoText}>Branch Logo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formCard}>
                    <Input
                        label="Branch Name"
                        value={restaurant_name}
                        onChangeText={setRestaurantName}
                        error={errors.restaurant_name}
                        placeholder="e.g. Piassa Branch"
                    />

                    <Input
                        label="Cuisine Type"
                        value={cuisine_type}
                        onChangeText={setCuisineType}
                        placeholder="e.g. Pizza, Burgers"
                    />

                    <View style={styles.infoRow}>
                        <Icon source="information-outline" size={20} color={colors.primary} />
                        <Text style={styles.infoLabel}>Using phone: {user?.phone_number}</Text>
                    </View>

                    <View style={styles.locationHeader}>
                        <Text style={styles.sectionTitleLabel}>Location Details</Text>
                        <TouchableOpacity style={styles.detectBtn} onPress={handleDetectLocation} disabled={isDetecting}>
                            {isDetecting ? <ActivityIndicator size={12} color={colors.primary} /> : <Icon source="target" size={16} color={colors.primary} />}
                            <Text style={styles.detectText}>Detect Location</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Input
                            label="Location"
                            value={searchQuery}
                            onChangeText={handleSearchChange}
                            placeholder="Search for branch location..."
                            leftIcon="map-marker"
                            onFocus={scrollToFocusedInput('search')}
                            onLayout={handleFieldLayout('search')}
                            error={errors.street_address}
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
                        <View style={{ flex: 1 }} onLayout={handleFieldLayout('latitude')}>
                            <Input
                                label="Latitude"
                                value={latitude.toString()}
                                onChangeText={setLatitude}
                                error={errors.latitude}
                                placeholder="8.7525"
                                keyboardType="decimal-pad"
                                onFocus={scrollToFocusedInput('latitude')}
                            />
                        </View>
                        <View style={{ width: spacing.md }} />
                        <View style={{ flex: 1 }} onLayout={handleFieldLayout('longitude')}>
                            <Input
                                label="Longitude"
                                value={longitude.toString()}
                                onChangeText={setLongitude}
                                error={errors.longitude}
                                placeholder="38.9785"
                                keyboardType="decimal-pad"
                                onFocus={scrollToFocusedInput('longitude')}
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View onLayout={handleFieldLayout('password')} collapsable={false}>
                        <Input
                            label="Confirm Account Password"
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                            secureTextEntry
                            onFocus={scrollToFocusedInput('password')}
                            placeholder="To verify you own this number"
                        />
                    </View>
                </View>

                <Button
                    title="Register Branch"
                    onPress={handleRegister}
                    loading={isLoading}
                    style={styles.btn}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.lg,
        backgroundColor: colors.white,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...shadows.medium,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.gray[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        padding: layout.screenPadding,
        paddingBottom: 120,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.lg,
        ...shadows.small,
        marginBottom: spacing.xl,
    },
    logoPicker: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: colors.white,
        alignSelf: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xl,
        overflow: 'hidden',
        ...shadows.small,
        borderWidth: 1,
        borderColor: colors.gray[100],
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
        fontSize: 11,
        color: colors.primary,
        fontWeight: '700',
        marginTop: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '10',
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
        gap: 8,
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    row: {
        flexDirection: 'row',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray[100],
        marginVertical: spacing.lg,
    },
    btn: {
        backgroundColor: colors.primary,
        ...shadows.medium,
        marginTop: spacing.md,
        marginBottom: 80,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    sectionTitleLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
    },
    detectBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '10',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    detectText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
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
    coordRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: -spacing.xs,
        marginBottom: spacing.md,
    },
    coordPill: {
        flexDirection: 'row',
        backgroundColor: colors.gray[50],
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[100],
    },
    coordLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    coordValue: {
        fontSize: 10,
        color: colors.text,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    }
});
