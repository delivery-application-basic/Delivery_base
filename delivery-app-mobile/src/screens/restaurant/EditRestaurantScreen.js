import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { restaurantService } from '../../api/services/restaurantService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { validateRequired, validatePhone } from '../../utils/validators';

export default function EditRestaurantScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user } = useSelector((state) => state.auth);
    const restaurantId = user?.restaurant_id ?? user?.id;

    const [name, setName] = useState(user?.restaurant_name || '');
    const [cuisine, setCuisine] = useState(user?.cuisine_type || '');
    const [phone, setPhone] = useState(user?.phone_number || '');
    const [address, setAddress] = useState(user?.street_address || '');
    const [city, setCity] = useState(user?.city || '');
    const [description, setDescription] = useState(user?.description || '');
    const [logoUri, setLogoUri] = useState(user?.logo_url || null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await restaurantService.getMyProfile();
                const data = res.data?.data ?? res.data;
                if (data) {
                    setName(data.restaurant_name || '');
                    setCuisine(data.cuisine_type || '');
                    setPhone(data.phone_number || '');
                    setAddress(data.street_address || '');
                    setCity(data.city || '');
                    setDescription(data.description || '');
                    setLogoUri(data.logo_url || null);
                }
            } catch (err) {
                console.error('Failed to fetch restaurant profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSelectLogo = async () => {
        const { launchImageLibrary } = require('react-native-image-picker');
        const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
        if (result.assets?.[0]?.uri) {
            const selectedUri = result.assets[0].uri;
            setLogoUri(selectedUri);

            // Upload immediately or wait for save? 
            // Registration uploads after success. Let's upload immediately for better UX
            try {
                await restaurantService.uploadLogo(restaurantId, selectedUri);
                Alert.alert('Success', 'Logo updated successfully');
            } catch (err) {
                Alert.alert('Error', 'Failed to upload logo');
            }
        }
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
            await restaurantService.updateRestaurant(restaurantId, {
                restaurant_name: name,
                cuisine_type: cuisine,
                phone_number: phone,
                street_address: address,
                city: city,
                description: description
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
                <Text>Loading profile...</Text>
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
                <Input label="Street Address" value={address} onChangeText={setAddress} error={errors.address} />
                <Input label="City" value={city} onChangeText={setCity} error={errors.city} />
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
        marginTop: spacing.xl,
        marginBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
