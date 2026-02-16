import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Icon, FAB } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../api/services/authService';
import { Text } from '../../components/common/Text';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function BranchesScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user } = useSelector((state) => state.auth);
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
            onPress={() => navigation.navigate('MenuManagement', {
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
                <View style={styles.branchStatus}>
                    <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#4CAF50' : '#FF5252' }]} />
                    <Text style={styles.statusText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
                </View>
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
                <Text style={styles.headerTitle}>My Restaurants</Text>
                <Text style={styles.headerSubtitle}>Manage menus for your branches</Text>
            </View>

            <FlatList
                data={branches}
                renderItem={renderBranchItem}
                keyExtractor={(item) => String(item.restaurant_id)}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon source="store-off-outline" size={60} color={colors.gray[200]} />
                        <Text style={styles.emptyTitle}>No Branches Found</Text>
                        <Text style={styles.emptySubtitle}>Tap the + button to register a new branch.</Text>
                    </View>
                }
            />

            <FAB
                icon="plus"
                style={[styles.fab, { bottom: insets.bottom + 80 }]}
                color={colors.white}
                onPress={() => {
                    // Navigate to a simplified branch creation or just use registration logic
                    // For now, let's navigate to a "Register Branch" variant of EditRestaurant or similar
                    navigation.navigate('RegisterBranch');
                }}
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
        backgroundColor: colors.white,
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        ...shadows.medium,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
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
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    branchAddress: {
        fontSize: 12,
        color: colors.textLight,
        marginVertical: 2,
    },
    branchStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        right: spacing.lg,
        backgroundColor: colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textSecondary,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textLight,
        textAlign: 'center',
        marginHorizontal: 40,
        marginTop: 8,
    }
});
