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
  
  // Accept order
  async acceptOrder(orderId) {
    return apiClient.post(`/drivers/accept/${orderId}`);
  },
  
  // Reject order
  async rejectOrder(orderId) {
    return apiClient.post(`/drivers/reject/${orderId}`);
  },
  
  // Update driver availability
  async updateAvailability(isAvailable) {
    return apiClient.patch('/drivers/availability', {
      is_available: isAvailable,
    });
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
};
