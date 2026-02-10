/**
 * RoutePolyline - Route line between coordinates
 */

import React from 'react';
import MapView from 'react-native-maps';
import { colors } from '../../theme/colors';

export const RoutePolyline = ({ coordinates, ...rest }) =>
  coordinates?.length > 1 ? (
    <MapView.Polyline coordinates={coordinates} strokeColor={colors.primary} strokeWidth={3} {...rest} />
  ) : null;

export default RoutePolyline;
