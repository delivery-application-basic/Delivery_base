import apiClient from '../axios';

export const restaurantService = {
  // Get all restaurants
  async getRestaurants(filters = {}, page = 1, limit = 20) {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get('/restaurants', { params });
  },
  
  // Get restaurant by ID
  async getRestaurantById(restaurantId) {
    return apiClient.get(`/restaurants/${restaurantId}`);
  },
  
  // Search restaurants
  async searchRestaurants(query, filters = {}) {
    const params = {
      q: query,
      ...filters,
    };
    return apiClient.get('/restaurants/search', { params });
  },
  
  // Get restaurant menu
  async getRestaurantMenu(restaurantId) {
    return apiClient.get(`/restaurants/${restaurantId}/menu`);
  },
  
  // Update restaurant profile (restaurant owner only)
  async updateRestaurant(restaurantId, data) {
    return apiClient.put(`/restaurants/${restaurantId}`, data);
  },
  
  // Update restaurant operating hours
  async updateOperatingHours(restaurantId, hours) {
    return apiClient.put(`/restaurants/${restaurantId}/hours`, { hours });
  },

  // Get own restaurant profile (for settings; includes when inactive)
  async getMyProfile() {
    return apiClient.get('/restaurants/me/profile');
  },

  // Deactivate or reactivate restaurant
  async updateStatus(restaurantId, isActive) {
    return apiClient.patch(`/restaurants/${restaurantId}/status`, { is_active: isActive });
  },
};
