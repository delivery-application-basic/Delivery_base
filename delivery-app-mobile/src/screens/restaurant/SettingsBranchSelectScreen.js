import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../api/services/authService';
import { Text } from '../../components/common/Text';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function SettingsBranchSelectScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { targetScreen, title } = route.params || {};

    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBranches = async () => {
        try {
            const res = await authService.getMyBranches();
            setBranches(res.data.data);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBranches();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBranches();
    };

    const renderBranchItem = ({ item }) => (
        <TouchableOpacity
            style={styles.branchCard}
            onPress={() => navigation.navigate(targetScreen, {
                restaurantId: item.restaurant_id,
                restaurantName: item.restaurant_name
            })}
            activeOpacity={0.7}
        >
            <View style={styles.branchImageContainer}>
                {item.logo_url ? (
                    <Image source={{ uri: item.logo_url }} style={styles.branchLogo} resizeMode="cover" />
                ) : (
                    <View style={styles.branchIconContainer}>
                        <Icon source="store" size={28} color={colors.primary} />
                    </View>
                )}
            </View>
            <View style={styles.branchInfo}>
                <Text style={styles.branchName}>{item.restaurant_name}</Text>
                <Text style={styles.branchAddress} numberOfLines={1}>
                    {item.street_address}, {item.city}
                </Text>
            </View>
            <Icon source="chevron-right" size={24} color={colors.gray[300]} />
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return <Loader fullScreen />;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon source="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{title || 'Select Branch'}</Text>
                    <Text style={styles.headerSubtitle}>Choose which restaurant to configure</Text>
                </View>
            </View>

            <FlatList
                data={branches}
                renderItem={renderBranchItem}
                keyExtractor={(item) => String(item.restaurant_id)}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.lg,
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
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    listContent: {
        padding: spacing.md,
    },
    branchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.small,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    branchImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: spacing.md,
        backgroundColor: colors.gray[50],
    },
    branchLogo: {
        width: '100%',
        height: '100%',
    },
    branchIconContainer: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: colors.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    branchInfo: {
        flex: 1,
    },
    branchName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },
    branchAddress: {
        fontSize: 11,
        color: colors.textLight,
        marginTop: 2,
    },
});
