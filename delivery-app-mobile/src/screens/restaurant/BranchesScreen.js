import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Loader } from '../../components/common/Loader';
import { colors } from '../../theme/colors';

/**
 * BranchesScreen — Single-restaurant mode.
 * Immediately navigates to MenuManagement for the logged-in restaurant.
 */
export default function BranchesScreen() {
    const navigation = useNavigation();
    const { user } = useSelector((state) => state.auth);
    const restaurantId = user?.restaurant_id ?? user?.id;
    const restaurantName = user?.restaurant_name ?? user?.name ?? 'My Restaurant';

    useEffect(() => {
        if (restaurantId) {
            // Navigate directly to menu management for the single restaurant
            navigation.navigate('MenuManagement', {
                restaurantId,
                restaurantName,
            });
        }
    }, [restaurantId]);

    return (
        <View style={styles.container}>
            <Loader fullScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
});
