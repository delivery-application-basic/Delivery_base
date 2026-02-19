import apiClient from '../axios';

export const driverService = {
  // Get available drivers (Admin/Restaurant) - not for driver
  async getAvailableDrivers(params) {
    return apiClient.get('/drivers/available', { params });
  },
  // Get driver's pending assignment offers (orders offered to this driver)
  async getPendingAssignments() {
    return apiClient.get('/drivers/assignments/pending');
  },

  // Get pool of available orders (ready, no driver) for drivers to accept
  async getAvailableOrders() {
    return apiClient.get('/drivers/orders/available');
  },

  // Accept order (from offer or from pool)
  async acceptOrder(orderId) {
    return apiClient.post(`/drivers/accept/${orderId}`);
  },
  
  // Reject order
  async rejectOrder(orderId) {
    return apiClient.post(`/drivers/reject/${orderId}`);
  },

  // Release order (unassign) – order goes back to pool for other drivers
  async releaseOrder(orderId) {
    return apiClient.post(`/drivers/release/${orderId}`);
  },
  
  // Update driver availability
  async updateAvailability(isAvailable) {
    return apiClient.patch('/drivers/availability', {
      is_available: isAvailable,
    });
  },

  // Heartbeat (update last seen)
  async heartbeat() {
    return apiClient.post('/drivers/heartbeat');
  },
  
  // Get driver earnings
  async getEarnings(startDate, endDate) {
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    return apiClient.get('/drivers/earnings', { params });
  },
  
  // Update driver location
  async updateLocation(latitude, longitude) {
    return apiClient.patch('/drivers/location', {
      latitude,
      longitude,
    });
  },
  
  // Get driver profile
  async getDriverProfile() {
    return apiClient.get('/drivers/profile');
  },
  
  // Update driver profile
  async updateDriverProfile(data) {
    return apiClient.put('/drivers/profile', data);
  },

  // Upload profile picture
  async uploadProfilePicture(imageUri, mimeType = 'image/jpeg') {
    const ext = mimeType?.includes('png') ? 'png' : 'jpg';
    const formData = new FormData();
    formData.append('picture', {
      uri: imageUri,
      type: mimeType || 'image/jpeg',
      name: `profile.${ext}`,
    });
    return apiClient.post('/drivers/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Accept assignment
  async acceptAssignment(orderId) {
    return apiClient.post(`/drivers/assignments/${orderId}/accept`);
  },

  // Reject assignment
  async rejectAssignment(orderId) {
    return apiClient.post(`/drivers/assignments/${orderId}/reject`);
  },
};
