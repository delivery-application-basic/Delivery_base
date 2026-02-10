/**
 * DeliveryMap - Map view for delivery tracking
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MAP_CONFIG } from '../../utils/constants';
import { colors } from '../../theme/colors';

export const DeliveryMap = ({
  restaurantLocation,
  deliveryLocation,
  driverLocation,
  style,
}) => {
  const region = {
    latitude: deliveryLocation?.latitude ?? restaurantLocation?.latitude ?? MAP_CONFIG.DEFAULT_LATITUDE,
    longitude: deliveryLocation?.longitude ?? restaurantLocation?.longitude ?? MAP_CONFIG.DEFAULT_LONGITUDE,
    latitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
    longitudeDelta: MAP_CONFIG.DEFAULT_DELTA,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {restaurantLocation && (
          <Marker
            coordinate={restaurantLocation}
            title="Restaurant"
            pinColor={colors.primary}
          />
        )}
        {deliveryLocation && (
          <Marker
            coordinate={deliveryLocation}
            title="Delivery address"
            pinColor="#28A745"
          />
        )}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            pinColor="#004E89"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default DeliveryMap;
