import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export default function BranchOrdersOverviewScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { orders, category, color } = route.params || {};

    // Group orders by restaurant
    const branchCounts = orders.reduce((acc, order) => {
        const resId = order.restaurant_id;
        if (!acc[resId]) {
            acc[resId] = {
                id: resId,
                name: order.restaurant?.restaurant_name || 'Unknown Branch',
                address: order.restaurant?.street_address || '',
                logo: order.restaurant?.logo_url,
                count: 0,
                orders: []
            };
        }
        acc[resId].count += 1;
        acc[resId].orders.push(order);
        return acc;
    }, {});

    const sortedBranches = Object.values(branchCounts).sort((a, b) => b.count - a.count);

    const renderBranchItem = ({ item }) => (
        <TouchableOpacity
            style={styles.branchCard}
            onPress={() => {
                // Navigate to the specific order list screen but filtered for this branch
                // For now, let's assume we navigate to IncomingOrders/ActiveOrders with restaurantId filter
                const screenMap = {
                    'To Confirm': 'IncomingOrders',
                    'In Progress': 'ActiveOrders',
                    'Completed Today': 'OrderHistory'
                };
                navigation.navigate(screenMap[category] || 'IncomingOrders', {
                    restaurantId: item.id,
                    branchName: item.name
                });
            }}
            activeOpacity={0.7}
        >
            <View style={styles.branchImageContainer}>
                {item.logo ? (
                    <Image source={{ uri: item.logo }} style={styles.branchLogo} resizeMode="cover" />
                ) : (
                    <View style={[styles.branchIconContainer, { backgroundColor: color + '15' }]}>
                        <Icon source="store" size={28} color={color} />
                    </View>
                )}
            </View>
            <View style={styles.branchInfo}>
                <Text style={styles.branchName}>{item.name}</Text>
                <Text style={styles.branchAddress} numberOfLines={1}>{item.address}</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: color }]}>
                <Text style={styles.countText}>{item.count}</Text>
            </View>
            <Icon source="chevron-right" size={24} color={colors.gray[300]} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon source="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{category}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>Branch breakdown</Text>
                </View>
            </View>

            <FlatList
                data={sortedBranches}
                renderItem={renderBranchItem}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon source="clipboard-text-outline" size={60} color={colors.gray[300]} />
                        <Text style={styles.emptyText}>No orders in this category</Text>
                    </View>
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
        fontSize: 20,
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
        width: 50,
        height: 50,
        borderRadius: 14,
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
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: spacing.xs,
    },
    countText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '800',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '600',
    }
});
