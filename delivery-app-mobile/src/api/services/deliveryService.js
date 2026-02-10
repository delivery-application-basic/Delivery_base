import apiClient from '../axios';

export const deliveryService = {
  // Get delivery details
  async getDelivery(orderId) {
    return apiClient.get(`/deliveries/${orderId}`);
  },
  
  // Update delivery status
  async updateDeliveryStatus(orderId, status) {
    return apiClient.patch(`/deliveries/${orderId}/status`, { status });
  },
  
  // Update driver location
  async updateLocation(orderId, latitude, longitude) {
    return apiClient.patch(`/deliveries/${orderId}/location`, {
      latitude,
      longitude,
    });
  },
  
  // Verify delivery code
  async verifyDeliveryCode(orderId, verificationCode) {
    return apiClient.post(`/deliveries/${orderId}/verify`, {
      verification_code: verificationCode,
    });
  },
  
  // Get verification code
  async getVerificationCode(orderId) {
    return apiClient.get(`/deliveries/${orderId}/verification-code`);
  },
  
  // Regenerate verification code
  async regenerateVerificationCode(orderId) {
    return apiClient.post(`/deliveries/${orderId}/regenerate-code`);
  },
  
  // Upload delivery proof
  async uploadDeliveryProof(orderId, imageUri) {
    const formData = new FormData();
    formData.append('proof_image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'delivery_proof.jpg',
    });
    
    return apiClient.post(`/deliveries/${orderId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
