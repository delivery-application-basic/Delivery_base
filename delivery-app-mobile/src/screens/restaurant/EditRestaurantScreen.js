import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { restaurantService } from '../../api/services/restaurantService';
import { geocodingService } from '../../api/services/geocodingService';
import { useLocation } from '../../hooks/useLocation';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { MAP_CONFIG } from '../../utils/constants';
import { validateRequired, validatePhone } from '../../utils/validators';

export default function EditRestaurantScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { user } = useSelector((state) => state.auth);
    const targetRestaurantId = route.params?.restaurantId ?? user?.restaurant_id ?? user?.id;

    const [name, setName] = useState('');
    const [cuisine, setCuisine] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');
    const [logoUri, setLogoUri] = useState(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [errors, setErrors] = useState({});

    const { getLocationWithPermission, checkLocationService } = useLocation();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await restaurantService.getRestaurantById(targetRestaurantId);
                const data = res.data?.data ?? res.data;
                if (data) {
                    setName(data.restaurant_name || '');
                    setCuisine(data.cuisine_type || '');
                    setPhone(data.phone_number || '');
                    setAddress(data.street_address || '');
                    setCity(data.city || '');
                    setDescription(data.description || '');
                    setLogoUri(data.logo_url || null);
                    if (data.latitude) setLatitude(data.latitude.toString());
                    if (data.longitude) setLongitude(data.longitude.toString());
                    if (data.street_address) setSearchQuery(data.street_address);
                }
            } catch (err) {
                console.error('Failed to fetch restaurant profile:', err);
            } finally {
                setLoading(false);
            }
        };
        if (targetRestaurantId) fetchProfile();
    }, [targetRestaurantId]);

    const handleSelectLogo = async () => {
        const { launchImageLibrary } = require('react-native-image-picker');
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
        if (result.assets?.[0]?.uri) {
            const selectedUri = result.assets[0].uri;
            setLogoUri(selectedUri);

            try {
                await restaurantService.uploadLogo(targetRestaurantId, selectedUri);
                Alert.alert('Success', 'Logo updated successfully');
            } catch (err) {
                Alert.alert('Error', 'Failed to upload logo');
            }
        }
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
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);

                // Auto-fill address using reverse geocoding
                const addressData = await geocodingService.reverseGeocode(coords.latitude, coords.longitude);
                if (addressData) {
                    if (addressData.street_address) {
                        setAddress(addressData.street_address);
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
        setAddress(item.street_address);
        setCity(item.city);
        setLatitude(item.latitude.toString());
        setLongitude(item.longitude.toString());
        setSearchQuery(item.formatted_address || item.street_address);
        setSuggestions([]);
    };

    const handleSave = async () => {
        const errs = {};
        if (!validateRequired(name, 'Restaurant name').valid) errs.name = 'Required';
        const phoneCheck = validatePhone(phone);
        if (!phoneCheck.valid) errs.phone = phoneCheck.message;
        if (!validateRequired(address, 'Address').valid) errs.address = 'Required';
        if (!validateRequired(city, 'City').valid) errs.city = 'Required';

        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        try {
            setSaving(true);
            await restaurantService.updateRestaurant(targetRestaurantId, {
                restaurant_name: name,
                cuisine_type: cuisine,
                phone_number: phone,
                street_address: address,
                city: city,
                description: description,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined
            });
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon source="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Restaurant</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.logoContainer} onPress={handleSelectLogo}>
                    {logoUri ? (
                        <Image source={{ uri: logoUri }} style={styles.logo} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Icon source="camera" size={30} color={colors.gray[400]} />
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        <Icon source="pencil" size={14} color={colors.white} />
                    </View>
                </TouchableOpacity>

                <Input label="Restaurant Name" value={name} onChangeText={setName} error={errors.name} />
                <Input label="Cuisine Type" value={cuisine} onChangeText={setCuisine} placeholder="e.g. Pizza, Burgers" />
                <Input label="Phone Number" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" />

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

                <View style={styles.searchContainer}>
                    <Input
                        label="Location"
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        placeholder="Search for your restaurant location..."
                        leftIcon="map-marker"
                        error={errors.address}
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
                    <View style={{ flex: 1 }}>
                        <Input
                            label="Latitude"
                            value={latitude?.toString()}
                            onChangeText={(v) => {
                                setLatitude(v);
                                setAddress(searchQuery); // Ensure current address is kept
                            }}
                            keyboardType="decimal-pad"
                        />
                    </View>
                    <View style={{ width: spacing.md }} />
                    <View style={{ flex: 1 }}>
                        <Input
                            label="Longitude"
                            value={longitude?.toString()}
                            onChangeText={(v) => {
                                setLongitude(v);
                                setAddress(searchQuery);
                            }}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                <Input
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    placeholder="Tell customers about your restaurant..."
                />

                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveBtn}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: layout.screenPadding,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
    },
    backBtn: {
        padding: 4,
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    scrollBody: {
        padding: layout.screenPadding,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.gray[100],
        alignSelf: 'center',
        marginBottom: spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray[200],
        borderStyle: 'dashed',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    saveBtn: {
        marginTop: spacing.md,
        marginBottom: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
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
