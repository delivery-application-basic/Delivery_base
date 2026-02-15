import apiClient from '../axios';

export const orderService = {
  // Create new order
  async createOrder(orderData) {
    return apiClient.post('/orders', orderData);
  },
  
  // Get user's orders
  async getOrders(filters = {}, page = 1, limit = 20) {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get('/orders', { params });
  },
  
  // Get order by ID
  async getOrderById(orderId) {
    return apiClient.get(`/orders/${orderId}`);
  },
  
  // Get order tracking
  async getOrderTracking(orderId) {
    return apiClient.get(`/orders/${orderId}/tracking`);
  },
  
  // Update order status (restaurant/driver only)
  async updateOrderStatus(orderId, orderStatus) {
    return apiClient.patch(`/orders/${orderId}/status`, { order_status: orderStatus });
  },
  
  // Cancel order
  async cancelOrder(orderId, reason) {
    return apiClient.post(`/orders/${orderId}/cancel`, { reason });
  },
  
  // Get restaurant orders (restaurant owner only)
  async getRestaurantOrders(restaurantId, filters = {}) {
    const params = {
      ...filters,
    };
    return apiClient.get(`/orders/restaurant/${restaurantId}`, { params });
  },
  
  // Get driver orders (driver only)
  async getDriverOrders(driverId, filters = {}) {
    const params = {
      ...filters,
    };
    return apiClient.get(`/orders/driver/${driverId}`, { params });
  },
};
