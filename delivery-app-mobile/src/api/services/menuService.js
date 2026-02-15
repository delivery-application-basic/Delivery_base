import apiClient from '../axios';

export const menuService = {
  // Get menu by restaurant ID
  async getMenuByRestaurant(restaurantId) {
    return apiClient.get(`/menu/restaurant/${restaurantId}`);
  },
  
  // Get menu item by ID
  async getMenuItemById(menuItemId) {
    return apiClient.get(`/menu/items/${menuItemId}`);
  },
  
  // Create menu item (restaurant owner only)
  async createMenuItem(data) {
    return apiClient.post('/menu/items', data);
  },
  
  // Update menu item (restaurant owner only)
  async updateMenuItem(menuItemId, data) {
    return apiClient.put(`/menu/items/${menuItemId}`, data);
  },
  
  // Delete menu item (restaurant owner only)
  async deleteMenuItem(menuItemId) {
    return apiClient.delete(`/menu/items/${menuItemId}`);
  },
  
  // Toggle menu item availability (restaurant owner only)
  async toggleAvailability(menuItemId) {
    return apiClient.patch(`/menu/items/${menuItemId}/availability`);
  },

  // Upload menu item picture (restaurant owner only). Pass uri and mimeType from image picker.
  async uploadMenuItemPicture(menuItemId, imageUri, mimeType = 'image/jpeg') {
    const ext = mimeType?.includes('png') ? 'png' : 'jpg';
    const formData = new FormData();
    formData.append('picture', {
      uri: imageUri,
      type: mimeType || 'image/jpeg',
      name: `item-${menuItemId}.${ext}`,
    });
    return apiClient.post(`/menu/items/${menuItemId}/picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
};
