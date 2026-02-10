/**
 * useSocket - Socket.io connection and event helpers
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
      initializeSocket().then((socket) => {
        socketRef.current = socket;
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

  const subscribeToOrderTracking = useCallback(
    (orderId, onUpdate) => {
      joinOrderRoom(orderId);
      const s = getSocket();
      if (!s) return () => {};
      const handler = (data) => {
        if (data.order_id === orderId) {
          dispatch(updateOrderStatus({ orderId: data.order_id, status: data.order_status }));
          onUpdate?.(data);
        }
      };
      s.on('order:tracking-update', handler);
      return () => {
        s.off('order:tracking-update', handler);
        leaveOrderRoom(orderId);
      };
    },
    [dispatch, joinOrderRoom, leaveOrderRoom]
  );

  return {
    socket,
    isConnected: !!socket?.connected,
    joinOrderRoom,
    leaveOrderRoom,
    subscribeToOrderTracking,
    ...socketHelpers,
  };
};

export default useSocket;
