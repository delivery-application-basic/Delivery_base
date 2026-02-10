/**
 * API Endpoints - Aligned with delivery-backend routes
 * Base URL is set in axios.js (API_BASE_URL = /api/v1)
 */

// Auth - backend: /auth
export const AUTH = {
  REGISTER_CUSTOMER: '/auth/register/customer',
  REGISTER_RESTAURANT: '/auth/register/restaurant',
  REGISTER_DRIVER: '/auth/register/driver',
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

// Customers - backend: /customers
export const CUSTOMERS = {
  PROFILE: '/customers/profile',
  ADDRESSES: '/customers/addresses',
  ADDRESS_BY_ID: (id) => `/customers/addresses/${id}`,
  FAVORITES: '/customers/favorites',
  FAVORITE_BY_ID: (id) => `/customers/favorites/${id}`,
};

// Restaurants - backend: /restaurants
export const RESTAURANTS = {
  LIST: '/restaurants',
  SEARCH: '/restaurants/search',
  BY_ID: (id) => `/restaurants/${id}`,
  MENU: (id) => `/restaurants/${id}/menu`,
  UPDATE: (id) => `/restaurants/${id}`,
  HOURS: (id) => `/restaurants/${id}/hours`,
};

// Menu - backend: /menu
export const MENU = {
  BY_RESTAURANT: (restaurantId) => `/menu/restaurant/${restaurantId}`,
  ITEM_BY_ID: (id) => `/menu/items/${id}`,
  ITEMS: '/menu/items',
  ITEM_UPDATE: (id) => `/menu/items/${id}`,
  ITEM_AVAILABILITY: (id) => `/menu/items/${id}/availability`,
};

// Cart - backend: /cart (customer only)
export const CART = {
  ROOT: '/cart',
  ITEMS: '/cart/items',
  ITEM_BY_ID: (id) => `/cart/items/${id}`,
};

// Orders - backend: /orders
export const ORDERS = {
  ROOT: '/orders',
  BY_ID: (id) => `/orders/${id}`,
  TRACKING: (id) => `/orders/${id}/tracking`,
  STATUS: (id) => `/orders/${id}/status`,
  CANCEL: (id) => `/orders/${id}/cancel`,
  RESTAURANT: (restaurantId) => `/orders/restaurant/${restaurantId}`,
  DRIVER: (driverId) => `/orders/driver/${driverId}`,
};

// Deliveries - backend: /deliveries
export const DELIVERIES = {
  BY_ORDER_ID: (orderId) => `/deliveries/${orderId}`,
  LOCATION: (orderId) => `/deliveries/${orderId}/location`,
  STATUS: (orderId) => `/deliveries/${orderId}/status`,
  VERIFY: (orderId) => `/deliveries/${orderId}/verify`,
  VERIFICATION_CODE: (orderId) => `/deliveries/${orderId}/verification-code`,
  REGENERATE_CODE: (orderId) => `/deliveries/${orderId}/regenerate-code`,
  PROOF: (orderId) => `/deliveries/${orderId}/proof`,
};

// Drivers - backend: /drivers
export const DRIVERS = {
  ASSIGN: '/drivers/assign',
  ASSIGN_MANUAL: '/drivers/assign/manual',
  ACCEPT: (orderId) => `/drivers/accept/${orderId}`,
  REJECT: (orderId) => `/drivers/reject/${orderId}`,
  AVAILABILITY: '/drivers/availability',
  AVAILABLE: '/drivers/available',
  PENDING_ASSIGNMENTS: '/drivers/assignments/pending',
  ASSIGNMENT_HISTORY: '/drivers/assignments/history',
};

export default {
  AUTH,
  CUSTOMERS,
  RESTAURANTS,
  MENU,
  CART,
  ORDERS,
  DELIVERIES,
  DRIVERS,
};
