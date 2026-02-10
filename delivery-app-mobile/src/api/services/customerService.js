import apiClient from '../axios';

export const customerService = {
  // Get customer profile
  async getCustomerProfile() {
    return apiClient.get('/customers/profile');
  },
  
  // Update customer profile
  async updateCustomerProfile(data) {
    return apiClient.put('/customers/profile', data);
  },
  
  // Get customer addresses
  async getAddresses() {
    return apiClient.get('/customers/addresses');
  },
  
  // Add address
  async addAddress(addressData) {
    return apiClient.post('/customers/addresses', addressData);
  },
  
  // Update address
  async updateAddress(addressId, addressData) {
    return apiClient.put(`/customers/addresses/${addressId}`, addressData);
  },
  
  // Delete address
  async deleteAddress(addressId) {
    return apiClient.delete(`/customers/addresses/${addressId}`);
  },
  
  // Set default address
  async setDefaultAddress(addressId) {
    return apiClient.patch(`/customers/addresses/${addressId}/default`);
  },
  
  // Get favorites
  async getFavorites() {
    return apiClient.get('/customers/favorites');
  },
  
  // Add to favorites
  async addFavorite(restaurantId) {
    return apiClient.post('/customers/favorites', {
      restaurant_id: restaurantId,
    });
  },
  
  // Remove from favorites
  async removeFavorite(restaurantId) {
    return apiClient.delete(`/customers/favorites/${restaurantId}`);
  },
};
