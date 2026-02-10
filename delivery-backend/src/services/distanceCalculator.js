/**
 * Distance Calculator Service
 * Calculates distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number|null} Distance in kilometers, or null if coordinates invalid
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return null;
    }

    // Convert to numbers
    const lat1Num = parseFloat(lat1);
    const lon1Num = parseFloat(lon1);
    const lat2Num = parseFloat(lat2);
    const lon2Num = parseFloat(lon2);

    if (isNaN(lat1Num) || isNaN(lon1Num) || isNaN(lat2Num) || isNaN(lon2Num)) {
        return null;
    }

    // Earth's radius in kilometers
    const R = 6371;
    const dLat = toRadians(lat2Num - lat1Num);
    const dLon = toRadians(lon2Num - lon1Num);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1Num)) *
        Math.cos(toRadians(lat2Num)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine location type based on city name (Ethiopian context)
 * @param {string} city - City name
 * @param {string} subCity - Sub-city name (optional)
 * @returns {string} 'urban', 'suburban', or 'rural'
 */
function determineLocationType(city, subCity) {
    if (!city) return 'urban'; // Default to urban

    const cityLower = city.toLowerCase();
    
    // Major urban centers
    const urbanCities = ['addis ababa', 'addis', 'dire dawa', 'hawassa', 'mekelle', 'bahir dar', 'gondar'];
    
    if (urbanCities.some(uc => cityLower.includes(uc))) {
        return 'urban';
    }
    
    // Suburban areas (smaller cities/towns)
    if (subCity && subCity.trim()) {
        return 'suburban';
    }
    
    // Default to rural for unknown cities
    return 'rural';
}

module.exports = {
    calculateDistance,
    determineLocationType,
    toRadians
};
