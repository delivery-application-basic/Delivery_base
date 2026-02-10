import apiClient from '../axios';

export const cartService = {
  // Get customer's cart
  async getCart() {
    return apiClient.get('/cart');
  },
  
  // Add item to cart
  async addItem(menuItemId, quantity = 1) {
    return apiClient.post('/cart/items', {
      menu_item_id: menuItemId,
      quantity,
    });
  },
  
  // Update cart item quantity
  async updateItem(cartItemId, quantity) {
    return apiClient.put(`/cart/items/${cartItemId}`, {
      quantity,
    });
  },
  
  // Remove item from cart
  async removeItem(cartItemId) {
    return apiClient.delete(`/cart/items/${cartItemId}`);
  },
  
  // Clear entire cart
  async clearCart() {
    return apiClient.delete('/cart');
  },
};
