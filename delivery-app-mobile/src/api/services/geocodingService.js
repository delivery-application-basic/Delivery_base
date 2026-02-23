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
          timeout: 2000 // 2s timeout for geocoding
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
  },

  /**
   * Search for locations using autocomplete
   * @param {string} text - Search query
   * @returns {Promise<Array>} List of location suggestions
   */
  async autocomplete(text) {
    if (!text || text.length < 3) return [];

    try {
      if (GEOCODE_CONFIG.API_KEY) {
        const response = await axios.get(`${GEOCODE_CONFIG.BASE_URL}/autocomplete`, {
          params: {
            'text': text,
            'api_key': GEOCODE_CONFIG.API_KEY,
            'size': 10,
            'boundary.country': 'ETH', // Prefer results in Ethiopia
            'focus.point.lat': 9.145,   // Focus on Addis Ababa
            'focus.point.lon': 38.7614
          },
          timeout: 4000
        });

        if (response.data && response.data.features) {
          return response.data.features.map(feature => {
            const props = feature.properties;
            const [lon, lat] = feature.geometry.coordinates;
            return {
              id: props.id || Math.random().toString(),
              street_address: props.name || props.street || props.label,
              city: props.city || props.locality || 'Addis Ababa',
              sub_city: props.neighbourhood || props.borough || props.county || '',
              latitude: lat,
              longitude: lon,
              formatted_address: props.label
            };
          });
        }
      }
      return [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }
};

export default geocodingService;
