import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import storage from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

let socket = null;

export const initializeSocket = async () => {
  try {
    const token = await storage.getAuthToken();
    
    if (!token) {
      console.warn('No auth token available for socket connection');
      return null;
    }

    // Close existing connection if any
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection
    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    return socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
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
