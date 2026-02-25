import axios from 'axios';
import { GEOCODE_CONFIG } from '../../utils/constants';

const DEFAULT_CITY = 'Addis Ababa';

const buildFallbackAddress = (latitude, longitude) => ({
  street_address: 'Current Location',
  sub_city: '',
  city: DEFAULT_CITY,
  latitude,
  longitude,
  formatted_address: 'Current Location'
});

const parseNominatimAddress = (data, latitude, longitude) => {
  if (!data) return null;

  const addr = data.address || {};
  const streetName = addr.road || addr.pedestrian || addr.footway || addr.path || '';
  const houseNumber = addr.house_number || '';
  const streetAddress = `${houseNumber} ${streetName}`.trim();

  return {
    street_address: streetAddress || data.name || data.display_name || 'Current Location',
    sub_city: addr.suburb || addr.neighbourhood || addr.city_district || '',
    city: addr.city || addr.town || addr.village || addr.county || DEFAULT_CITY,
    landmark: data.name || '',
    latitude,
    longitude,
    formatted_address: data.display_name || streetAddress || 'Current Location'
  };
};

/**
 * Geocoding Service - Handles reverse geocoding to get addresses from coordinates
 * Primary: Geocode Earth (Pelias), Fallback: OpenStreetMap Nominatim
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
      // 1) Primary provider
      if (GEOCODE_CONFIG.API_KEY) {
        const response = await axios.get(`${GEOCODE_CONFIG.BASE_URL}/reverse`, {
          params: {
            'point.lat': latitude,
            'point.lon': longitude,
            api_key: GEOCODE_CONFIG.API_KEY,
            size: 1,
            layers: 'address,venue,neighbourhood'
          },
          timeout: 6000
        });

        if (response.data?.features?.length > 0) {
          const feature = response.data.features[0];
          const props = feature.properties || {};

          return {
            street_address: props.name || props.street || props.label || 'Current Location',
            sub_city: props.neighbourhood || props.borough || props.county || '',
            city: props.city || props.locality || DEFAULT_CITY,
            landmark: props.name && props.name !== props.street ? props.name : '',
            latitude,
            longitude,
            formatted_address: props.label || props.name || 'Current Location'
          };
        }
      }

      // 2) Fallback provider
      const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          format: 'jsonv2',
          lat: latitude,
          lon: longitude,
          addressdetails: 1
        },
        headers: {
          Accept: 'application/json'
        },
        timeout: 6000
      });

      const parsed = parseNominatimAddress(nominatimResponse.data, latitude, longitude);
      if (parsed) return parsed;

      throw new Error('Geocoding service unavailable or no results');
    } catch (error) {
      // Avoid dev red-screen noise for expected network/provider failures.
      console.warn('Geocoding fallback used:', error?.message || 'unknown error');
      return buildFallbackAddress(latitude, longitude);
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
      // 1) Primary provider
      if (GEOCODE_CONFIG.API_KEY) {
        const response = await axios.get(`${GEOCODE_CONFIG.BASE_URL}/autocomplete`, {
          params: {
            text,
            api_key: GEOCODE_CONFIG.API_KEY,
            size: 10,
            'boundary.country': 'ETH',
            'focus.point.lat': 9.145,
            'focus.point.lon': 38.7614
          },
          timeout: 6000
        });

        if (response.data?.features) {
          return response.data.features.map(feature => {
            const props = feature.properties || {};
            const [lon, lat] = feature.geometry?.coordinates || [];
            return {
              id: props.id || `${lat}-${lon}` || Math.random().toString(),
              street_address: props.name || props.street || props.label || text,
              city: props.city || props.locality || DEFAULT_CITY,
              sub_city: props.neighbourhood || props.borough || props.county || '',
              latitude: lat,
              longitude: lon,
              formatted_address: props.label || props.name || text
            };
          });
        }
      }

      // 2) Fallback provider
      const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: text,
          format: 'jsonv2',
          addressdetails: 1,
          limit: 10,
          countrycodes: 'et'
        },
        headers: {
          Accept: 'application/json'
        },
        timeout: 6000
      });

      if (!Array.isArray(nominatimResponse.data)) return [];

      return nominatimResponse.data.map(item => {
        const addr = item.address || {};
        const street = addr.road || addr.pedestrian || addr.footway || '';
        const houseNo = addr.house_number || '';
        const streetAddress = `${houseNo} ${street}`.trim();

        return {
          id: item.place_id?.toString?.() || Math.random().toString(),
          street_address: streetAddress || item.name || item.display_name || text,
          city: addr.city || addr.town || addr.village || addr.county || DEFAULT_CITY,
          sub_city: addr.suburb || addr.neighbourhood || addr.city_district || '',
          latitude: Number(item.lat),
          longitude: Number(item.lon),
          formatted_address: item.display_name || streetAddress || text
        };
      });
    } catch (error) {
      console.warn('Autocomplete fallback used:', error?.message || 'unknown error');
      return [];
    }
  }
};

export default geocodingService;
