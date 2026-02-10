module.exports = {
    USER_TYPES: {
        CUSTOMER: 'customer',
        RESTAURANT: 'restaurant',
        DRIVER: 'driver',
        ADMIN: 'admin'
    },
    ORDER_STATUS: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        PREPARING: 'preparing',
        READY: 'ready',
        PICKED_UP: 'picked_up',
        IN_TRANSIT: 'in_transit',
        DELIVERED: 'delivered',
        CANCELLED: 'cancelled'
    },
    DELIVERY_STATUS: {
        ASSIGNED: 'assigned',
        HEADING_TO_RESTAURANT: 'heading_to_restaurant',
        AT_RESTAURANT: 'at_restaurant',
        PICKED_UP: 'picked_up',
        IN_TRANSIT: 'in_transit',
        DELIVERED: 'delivered',
        FAILED: 'failed'
    },
    PAYMENT_METHODS: {
        CASH: 'cash',
        TELEBIRR: 'telebirr',
        CBEBIRR: 'cbebirr',
        CARD: 'card',
        BANK_TRANSFER: 'bank_transfer'
    },
    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        PAID: 'paid',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    }
};

// Fee defaults (used when env not set)
const DEFAULT_SERVICE_FEE = parseFloat(process.env.DEFAULT_SERVICE_FEE) || 5.0;
const DEFAULT_DELIVERY_FEE_FLAT = parseFloat(process.env.DEFAULT_DELIVERY_FEE_FLAT) || 25.0;

// Distance-based delivery fee rates (ETB per km)
const URBAN_DISTANCE_RATE = parseFloat(process.env.URBAN_DISTANCE_RATE) || 20.0;
const SUBURBAN_DISTANCE_RATE = parseFloat(process.env.SUBURBAN_DISTANCE_RATE) || 25.0;
const RURAL_DISTANCE_RATE = parseFloat(process.env.RURAL_DISTANCE_RATE) || 30.0;

// Minimum delivery fee (ETB)
const MINIMUM_DELIVERY_FEE = parseFloat(process.env.MINIMUM_DELIVERY_FEE) || 25.0;

// Base delivery fee (applied regardless of distance)
const BASE_DELIVERY_FEE = parseFloat(process.env.BASE_DELIVERY_FEE) || 15.0;

// Peak hour multipliers
const PEAK_HOUR_LUNCH_START = process.env.PEAK_HOUR_LUNCH_START || '12:00';
const PEAK_HOUR_LUNCH_END = process.env.PEAK_HOUR_LUNCH_END || '14:00';
const PEAK_HOUR_DINNER_START = process.env.PEAK_HOUR_DINNER_START || '18:00';
const PEAK_HOUR_DINNER_END = process.env.PEAK_HOUR_DINNER_END || '21:00';
const PEAK_HOUR_MULTIPLIER = parseFloat(process.env.PEAK_HOUR_MULTIPLIER) || 1.2;

// Demand/supply surge thresholds
const DEMAND_SURGE_THRESHOLD_1 = parseFloat(process.env.DEMAND_SURGE_THRESHOLD_1) || 2.0; // orders/drivers ratio
const DEMAND_SURGE_THRESHOLD_2 = parseFloat(process.env.DEMAND_SURGE_THRESHOLD_2) || 3.0;
const DEMAND_SURGE_MULTIPLIER_1 = parseFloat(process.env.DEMAND_SURGE_MULTIPLIER_1) || 1.2; // +20%
const DEMAND_SURGE_MULTIPLIER_2 = parseFloat(process.env.DEMAND_SURGE_MULTIPLIER_2) || 1.4; // +40%

module.exports.DEFAULT_SERVICE_FEE = DEFAULT_SERVICE_FEE;
module.exports.DEFAULT_DELIVERY_FEE_FLAT = DEFAULT_DELIVERY_FEE_FLAT;
module.exports.URBAN_DISTANCE_RATE = URBAN_DISTANCE_RATE;
module.exports.SUBURBAN_DISTANCE_RATE = SUBURBAN_DISTANCE_RATE;
module.exports.RURAL_DISTANCE_RATE = RURAL_DISTANCE_RATE;
module.exports.MINIMUM_DELIVERY_FEE = MINIMUM_DELIVERY_FEE;
module.exports.BASE_DELIVERY_FEE = BASE_DELIVERY_FEE;
module.exports.PEAK_HOUR_LUNCH_START = PEAK_HOUR_LUNCH_START;
module.exports.PEAK_HOUR_LUNCH_END = PEAK_HOUR_LUNCH_END;
module.exports.PEAK_HOUR_DINNER_START = PEAK_HOUR_DINNER_START;
module.exports.PEAK_HOUR_DINNER_END = PEAK_HOUR_DINNER_END;
module.exports.PEAK_HOUR_MULTIPLIER = PEAK_HOUR_MULTIPLIER;
module.exports.DEMAND_SURGE_THRESHOLD_1 = DEMAND_SURGE_THRESHOLD_1;
module.exports.DEMAND_SURGE_THRESHOLD_2 = DEMAND_SURGE_THRESHOLD_2;
module.exports.DEMAND_SURGE_MULTIPLIER_1 = DEMAND_SURGE_MULTIPLIER_1;
module.exports.DEMAND_SURGE_MULTIPLIER_2 = DEMAND_SURGE_MULTIPLIER_2;
