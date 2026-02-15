/**
 * useSocket - Socket.io connection and event helpers (Step 13 real-time)
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeSocket, disconnectSocket, getSocket, socketHelpers } from '../socket/socket';
import { updateOrderStatus } from '../store/slices/orderSlice';

export const useSocket = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      initializeSocket()
        .then((s) => {
          socketRef.current = s;
        })
        .catch(() => {
          socketRef.current = null;
        });
    }
    return () => {
      disconnectSocket();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  const socket = getSocket();

  const joinOrderRoom = useCallback((orderId) => {
    socketHelpers.joinOrderRoom(orderId);
  }, []);

  const leaveOrderRoom = useCallback((orderId) => {
    socketHelpers.leaveOrderRoom(orderId);
  }, []);

  const joinRestaurantRoom = useCallback((restaurantId) => {
    socketHelpers.joinRestaurantRoom(restaurantId);
  }, []);

  const leaveRestaurantRoom = useCallback((restaurantId) => {
    socketHelpers.leaveRestaurantRoom(restaurantId);
  }, []);

  const joinDriverRoom = useCallback((driverId) => {
    socketHelpers.joinDriverRoom(driverId);
  }, []);

  const leaveDriverRoom = useCallback((driverId) => {
    socketHelpers.leaveDriverRoom(driverId);
  }, []);

  const subscribeToOrderTracking = useCallback(
    (orderId, onUpdate) => {
      joinOrderRoom(orderId);
      const s = getSocket();
      if (!s) return () => {};
      const trackingHandler = (data) => {
        if (data.order_id === orderId) {
          if (data.order_status != null) {
            dispatch(updateOrderStatus({ orderId: data.order_id, status: data.order_status }));
          }
          onUpdate?.({ type: 'tracking', ...data });
        }
      };
      const locationHandler = (data) => {
        if (data.order_id === orderId) onUpdate?.({ type: 'location', ...data });
      };
      const statusHandler = (data) => {
        if (data.order_id === orderId) onUpdate?.({ type: 'delivery_status', ...data });
      };
      s.on('order:tracking-update', trackingHandler);
      s.on('delivery:location-update', locationHandler);
      s.on('delivery:status-update', statusHandler);
      return () => {
        s.off('order:tracking-update', trackingHandler);
        s.off('delivery:location-update', locationHandler);
        s.off('delivery:status-update', statusHandler);
        leaveOrderRoom(orderId);
      };
    },
    [dispatch, joinOrderRoom, leaveOrderRoom]
  );

  const subscribeToNewOrders = useCallback((onOrderCreated) => {
    const s = getSocket();
    if (!s) return () => {};
    const handler = (data) => onOrderCreated?.(data);
    s.on('order:created', handler);
    return () => s.off('order:created', handler);
  }, []);

  const subscribeToDriverAssignment = useCallback((onAssignment) => {
    const s = getSocket();
    if (!s) return () => {};
    const handler = (data) => onAssignment?.(data);
    s.on('driver:assignment', handler);
    return () => s.off('driver:assignment', handler);
  }, []);

  const subscribeToOrderTaken = useCallback((onOrderTaken) => {
    const s = getSocket();
    if (!s) return () => {};
    const handler = (data) => onOrderTaken?.(data);
    s.on('order:taken', handler);
    return () => s.off('order:taken', handler);
  }, []);

  const subscribeToOrderAvailable = useCallback((onOrderAvailable) => {
    const s = getSocket();
    if (!s) return () => {};
    const handler = (data) => onOrderAvailable?.(data);
    s.on('order:available', handler);
    return () => s.off('order:available', handler);
  }, []);

  const subscribeToOrderDelivered = useCallback((onOrderDelivered) => {
    const s = getSocket();
    if (!s) return () => {};
    const handler = (data) => {
      if (data?.order_status === 'delivered') {
        dispatch(updateOrderStatus({ orderId: data.order_id, status: 'delivered' }));
      }
      onOrderDelivered?.(data);
    };
    s.on('order:delivered', handler);
    return () => s.off('order:delivered', handler);
  }, [dispatch]);

  return {
    socket,
    isConnected: !!socket?.connected,
    joinOrderRoom,
    leaveOrderRoom,
    joinRestaurantRoom,
    leaveRestaurantRoom,
    joinDriverRoom,
    leaveDriverRoom,
    subscribeToOrderTracking,
    subscribeToNewOrders,
    subscribeToDriverAssignment,
    subscribeToOrderTaken,
    subscribeToOrderAvailable,
    subscribeToOrderDelivered,
    ...socketHelpers,
  };
};

export default useSocket;
