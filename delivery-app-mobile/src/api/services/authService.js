import apiClient from '../axios';
import { USER_TYPES } from '../../utils/constants';

export const authService = {
  // Login
  async login(phone, email, password, userType) {
    const payload = {
      password,
      user_type: userType,
    };
    
    if (phone) {
      payload.phone_number = phone;
    }
    if (email) {
      payload.email = email;
    }
    
    return apiClient.post('/auth/login', payload);
  },
  
  // Register - Customer
  async registerCustomer(data) {
    return apiClient.post('/auth/register/customer', data);
  },
  
  // Register - Restaurant
  async registerRestaurant(data) {
    return apiClient.post('/auth/register/restaurant', data);
  },
  
  // Register - Driver
  async registerDriver(data) {
    return apiClient.post('/auth/register/driver', data);
  },
  
  // Generic register method
  async register(userType, registrationData) {
    switch (userType) {
      case USER_TYPES.CUSTOMER:
        return this.registerCustomer(registrationData);
      case USER_TYPES.RESTAURANT:
        return this.registerRestaurant(registrationData);
      case USER_TYPES.DRIVER:
        return this.registerDriver(registrationData);
      default:
        throw new Error('Invalid user type');
    }
  },
  
  // Logout
  async logout() {
    return apiClient.post('/auth/logout');
  },
  
  // Refresh token (backend expects refreshToken in body)
  async refreshToken(refreshToken) {
    return apiClient.post('/auth/refresh-token', {
      refreshToken,
    });
  },
  
  // Forgot password
  async forgotPassword(phone, email) {
    const payload = {};
    if (phone) payload.phone_number = phone;
    if (email) payload.email = email;
    
    return apiClient.post('/auth/forgot-password', payload);
  },
  
  // Reset password
  async resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },
  
  // Verify phone number
  async verifyPhone(phoneNumber, verificationCode) {
    return apiClient.post('/auth/verify-phone', {
      phone_number: phoneNumber,
      verification_code: verificationCode,
    });
  },
  
  // Resend verification code
  async resendVerificationCode(phoneNumber) {
    return apiClient.post('/auth/resend-verification', {
      phone_number: phoneNumber,
    });
  },
};
