// API Configuration
// IMPORTANT: For physical devices, use your PC's Wi-Fi IPv4 address (run: ipconfig / Windows, ifconfig / Mac)
// Your current Wi-Fi IP: 192.168.43.135 - update if your network changes!
export const API_BASE_URL = __DEV__
  ? 'http://192.168.43.135:5000/api/v1' // Development - use your local IP for physical devices
  : 'https://your-production-api.com/api/v1'; // Production

// For physical devices, replace with your computer's IP. Phone and PC must be on same Wi-Fi.
export const SOCKET_URL = __DEV__
  ? 'http://192.168.43.135:5000' // Development
  : 'https://your-production-api.com'; // Production

// App Constants
export const APP_NAME = 'Delivery App';
export const CURRENCY = 'ETB';
export const CURRENCY_SYMBOL = 'Br';

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  TELEBIRR: 'telebirr',
};

// User Types
export const USER_TYPES = {
  CUSTOMER: 'customer',
  RESTAURANT: 'restaurant',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

// Tracking Stages
export const TRACKING_STAGES = {
  ORDER_ISSUED: 'order_issued',
  PAYMENT_VERIFIED: 'payment_verified',
  PROCESSING_FOOD: 'processing_food',
  DELIVERY_ON_THE_WAY: 'delivery_on_the_way',
  DELIVERED: 'delivered',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@delivery_app:auth_token',
  REFRESH_TOKEN: '@delivery_app:refresh_token',
  USER_DATA: '@delivery_app:user_data',
  USER_TYPE: '@delivery_app:user_type',
  ONBOARDING_COMPLETE: '@delivery_app:onboarding_complete',
};

// Validation
export const VALIDATION = {
  PHONE_REGEX: /^\+251[79]\d{8}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
};

// Ethiopian Phone Number Format
export const PHONE_FORMAT = {
  COUNTRY_CODE: '+251',
  LENGTH: 13, // +251XXXXXXXXX
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 9.145, // Addis Ababa
  DEFAULT_LONGITUDE: 38.7614,
  DEFAULT_DELTA: 0.05,
};

// Delivery Constants
export const DELIVERY = {
  DEFAULT_RADIUS_KM: 10,
  ESTIMATED_TIME_MINUTES: 25,
  VERIFICATION_CODE_LENGTH: 6,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
};

// Image Upload
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  QUALITY: 0.8,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  ORDER_PLACED: 'Order placed successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  PAYMENT_SUCCESS: 'Payment successful',
};
