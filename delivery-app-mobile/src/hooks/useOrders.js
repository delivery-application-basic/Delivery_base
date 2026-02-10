/**
 * useOrders - Order list and actions from Redux
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, fetchOrderById, fetchOrderTracking, cancelOrder } from '../store/slices/orderSlice';

export const useOrders = () => {
  const dispatch = useDispatch();
  const { orders, selectedOrder, orderTracking, isLoading, error } = useSelector((state) => state.order);

  const loadOrders = useCallback((filters, page, limit) => {
    return dispatch(fetchOrders({ filters, page, limit })).unwrap();
  }, [dispatch]);

  const loadOrder = useCallback((orderId) => {
    return dispatch(fetchOrderById(orderId)).unwrap();
  }, [dispatch]);

  const loadTracking = useCallback((orderId) => {
    return dispatch(fetchOrderTracking(orderId)).unwrap();
  }, [dispatch]);

  const cancel = useCallback((orderId, reason) => {
    return dispatch(cancelOrder({ orderId, reason })).unwrap();
  }, [dispatch]);

  return {
    orders,
    selectedOrder,
    orderTracking,
    isLoading,
    error,
    loadOrders,
    loadOrder,
    loadTracking,
    cancel,
  };
};

export default useOrders;
