import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import storage from '../utils/storage';

let socket = null;

// Log socket issues without triggering React Native error overlay (use warn in dev only)
const socketLog = (message, err) => {
  if (__DEV__) {
    if (err) console.warn(message, err?.message || err);
    else console.warn(message);
  }
};

export const initializeSocket = async () => {
  try {
    const token = await storage.getAuthToken();

    if (!token) {
      if (__DEV__) console.warn('No auth token available for socket connection');
      return null;
    }

    // Close existing connection if any
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }

    // Try polling first for better compatibility (e.g. networks that block websocket)
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      if (__DEV__) console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      if (__DEV__) console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      socketLog('Socket connection error (real-time updates may be delayed).', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      if (__DEV__) console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      socketLog('Socket reconnection error.', error);
    });

    socket.on('reconnect_failed', () => {
      socketLog('Socket reconnection failed. Pull to refresh for latest data.');
    });

    return socket;
  } catch (error) {
    socketLog('Error initializing socket.', error);
    socket = null;
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

// Socket event helpers
export const socketHelpers = {
  // Join order room
  joinOrderRoom: (orderId) => {
    if (socket) {
      socket.emit('join:order', { orderId });
    }
  },

  // Leave order room
  leaveOrderRoom: (orderId) => {
    if (socket) {
      socket.emit('leave:order', { orderId });
    }
  },

  // Join user room
  joinUserRoom: (userId) => {
    if (socket) {
      socket.emit('join:user', { userId });
    }
  },

  // Leave user room
  leaveUserRoom: (userId) => {
    if (socket) {
      socket.emit('leave:user', { userId });
    }
  },

  // Join restaurant room (receive order:created)
  joinRestaurantRoom: (restaurantId) => {
    if (socket && restaurantId != null) {
      socket.emit('join:restaurant', { restaurantId });
    }
  },

  // Leave restaurant room
  leaveRestaurantRoom: (restaurantId) => {
    if (socket && restaurantId != null) {
      socket.emit('leave:restaurant', { restaurantId });
    }
  },

  // Join driver room (receive driver:assignment)
  joinDriverRoom: (driverId) => {
    if (socket && driverId != null) {
      socket.emit('join:driver', { driverId });
    }
  },

  // Leave driver room
  leaveDriverRoom: (driverId) => {
    if (socket && driverId != null) {
      socket.emit('leave:driver', { driverId });
    }
  },

  // Update driver location (for drivers)
  updateDriverLocation: (orderId, latitude, longitude) => {
    if (socket) {
      socket.emit('driver:location-update', {
        orderId,
        latitude,
        longitude,
      });
    }
  },

  // Update driver status (for drivers) — backend expects orderId and status
  updateDriverStatus: (orderId, status) => {
    if (socket) {
      socket.emit('driver:status-update', { orderId, status });
    }
  },
};

export default socket;
