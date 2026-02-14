import axios from 'axios';
import { GEOCODE_CONFIG } from '../../utils/constants';

/**
 * Geocoding Service - Handles reverse geocoding to get addresses from coordinates
 * Uses Geocode Earth (Pelias)
 */
export const geocodingService = {
  /**
   * Reverse geocode coordinates to get a human-readable address
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<object>} Address components
   */
  async reverseGeocode(latitude, longitude) {
    try {
      // 1. Try Geocode Earth (Pelias)
      if (GEOCODE_CONFIG.API_KEY) {
        const response = await axios.get(`${GEOCODE_CONFIG.BASE_URL}/reverse`, {
          params: {
            'point.lat': latitude,
            'point.lon': longitude,
            'api_key': GEOCODE_CONFIG.API_KEY,
            'size': 1,
            'layers': 'address,venue,neighbourhood'
          },
          timeout: 10000 // 10s timeout for geocoding
        });

        if (response.data && response.data.features && response.data.features.length > 0) {
          const feature = response.data.features[0];
          const props = feature.properties;
          
          return {
            street_address: props.name || props.street || props.label,
            sub_city: props.neighbourhood || props.borough || props.county || '',
            city: props.city || props.locality || 'Addis Ababa',
            landmark: props.name !== props.street ? props.name : '',
            latitude,
            longitude,
            formatted_address: props.label
          };
        }
      }

      throw new Error('Geocoding service unavailable or no results');
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback
      return {
        street_address: 'Current Location',
        sub_city: '',
        city: 'Addis Ababa',
        latitude,
        longitude,
        formatted_address: 'Current Location'
      };
    }
  }
};

export default geocodingService;
