/**
 * EmptyCart - Shown when cart has no items
 */

import React from 'react';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';

export const EmptyCart = ({ onBrowseRestaurants }) => (
  <EmptyState
    message="Your cart is empty"
    icon="cart-outline"
    action={onBrowseRestaurants && <Button title="Browse restaurants" onPress={onBrowseRestaurants} />}
  />
);

export default EmptyCart;
