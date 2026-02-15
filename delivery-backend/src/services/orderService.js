const { Cart, CartItem, MenuItem, Order, OrderItem, Address, OrderStatusHistory, Restaurant, Driver } = require('../models');
const { ORDER_STATUS, USER_TYPES } = require('../utils/constants');
const { determineOrderFlowType } = require('./paymentFlowService');
const {
    DEFAULT_SERVICE_FEE,
    DEFAULT_DELIVERY_FEE_FLAT,
    URBAN_DISTANCE_RATE,
    SUBURBAN_DISTANCE_RATE,
    RURAL_DISTANCE_RATE,
    MINIMUM_DELIVERY_FEE,
    BASE_DELIVERY_FEE,
    PEAK_HOUR_LUNCH_START,
    PEAK_HOUR_LUNCH_END,
    PEAK_HOUR_DINNER_START,
    PEAK_HOUR_DINNER_END,
    PEAK_HOUR_MULTIPLIER,
    DEMAND_SURGE_THRESHOLD_1,
    DEMAND_SURGE_THRESHOLD_2,
    DEMAND_SURGE_MULTIPLIER_1,
    DEMAND_SURGE_MULTIPLIER_2
} = require('../utils/constants');
const { calculateDistance, determineLocationType } = require('./distanceCalculator');
const { Op } = require('sequelize');

/**
 * Calculate service fee from env/default.
 */
function calculateServiceFee() {
    return DEFAULT_SERVICE_FEE;
}

/**
 * Check if current time is within peak hours
 */
function isPeakHour() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Parse peak hour times
    const [lunchStartH, lunchStartM] = PEAK_HOUR_LUNCH_START.split(':').map(Number);
    const [lunchEndH, lunchEndM] = PEAK_HOUR_LUNCH_END.split(':').map(Number);
    const [dinnerStartH, dinnerStartM] = PEAK_HOUR_DINNER_START.split(':').map(Number);
    const [dinnerEndH, dinnerEndM] = PEAK_HOUR_DINNER_END.split(':').map(Number);

    const currentMinutes = hours * 60 + minutes;
    const lunchStartMinutes = lunchStartH * 60 + lunchStartM;
    const lunchEndMinutes = lunchEndH * 60 + lunchEndM;
    const dinnerStartMinutes = dinnerStartH * 60 + dinnerStartM;
    const dinnerEndMinutes = dinnerEndH * 60 + dinnerEndM;

    return (currentMinutes >= lunchStartMinutes && currentMinutes <= lunchEndMinutes) ||
           (currentMinutes >= dinnerStartMinutes && currentMinutes <= dinnerEndMinutes);
}

/**
 * Calculate demand/supply multiplier based on active orders vs available drivers
 */
async function calculateDemandMultiplier() {
    const activeOrderStatuses = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.IN_TRANSIT];
    
    const activeOrdersCount = await Order.count({
        where: {
            order_status: {
                [Op.in]: activeOrderStatuses
            }
        }
    });

    const availableDriversCount = await Driver.count({
        where: {
            is_available: true,
            is_active: true,
            verification_status: 'approved'
        }
    });

    if (availableDriversCount === 0) {
        return DEMAND_SURGE_MULTIPLIER_2; // Maximum surge if no drivers
    }

    const ratio = activeOrdersCount / availableDriversCount;

    if (ratio >= DEMAND_SURGE_THRESHOLD_2) {
        return DEMAND_SURGE_MULTIPLIER_2; // +40%
    } else if (ratio >= DEMAND_SURGE_THRESHOLD_1) {
        return DEMAND_SURGE_MULTIPLIER_1; // +20%
    }

    return 1.0; // No surge
}

/**
 * Check if current time is within restaurant's happy hour
 * Validates: enabled flag, day of week, date range, and time range
 */
function isHappyHour(restaurant) {
    // Basic validation
    if (!restaurant.happy_hour_enabled || !restaurant.happy_hour_start_time || !restaurant.happy_hour_end_time) {
        return false;
    }

    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Check day of week (if specified)
    if (restaurant.happy_hour_days && Array.isArray(restaurant.happy_hour_days) && restaurant.happy_hour_days.length > 0) {
        if (!restaurant.happy_hour_days.includes(dayOfWeek)) {
            return false; // Current day is not in the allowed days list
        }
    }

    // Check date range (if specified)
    if (restaurant.happy_hour_start_date) {
        const startDate = new Date(restaurant.happy_hour_start_date);
        startDate.setHours(0, 0, 0, 0);
        if (currentDate < startDate) {
            return false; // Current date is before start date
        }
    }

    if (restaurant.happy_hour_end_date) {
        const endDate = new Date(restaurant.happy_hour_end_date);
        endDate.setHours(23, 59, 59, 999);
        if (currentDate > endDate) {
            return false; // Current date is after end date
        }
    }

    // Check time range
    const [startH, startM] = restaurant.happy_hour_start_time.split(':').map(Number);
    const [endH, endM] = restaurant.happy_hour_end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Handle happy hour that spans midnight (e.g., 22:00 - 02:00)
    if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Calculate happy hour meal discount
 * Returns discount amount in ETB based on restaurant's configured discount percentage
 */
function calculateHappyHourDiscount(restaurant, subtotal) {
    if (!isHappyHour(restaurant)) {
        return 0;
    }

    const discountPercent = parseFloat(restaurant.happy_hour_discount_percent) || 0;
    if (discountPercent <= 0) {
        return 0;
    }

    const discountAmount = (subtotal * discountPercent) / 100;
    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate smart delivery fee based on distance, location, demand, and peak hours
 */
async function calculateSmartDeliveryFee(restaurant, address) {
    // Get restaurant location
    const restLat = parseFloat(restaurant.latitude);
    const restLon = parseFloat(restaurant.longitude);
    const addrLat = parseFloat(address.latitude);
    const addrLon = parseFloat(address.longitude);

    // Calculate distance
    let distanceKm = null;
    if (restLat && restLon && addrLat && addrLon) {
        distanceKm = calculateDistance(restLat, restLon, addrLat, addrLon);
    }

    // Determine location type
    const locationType = determineLocationType(address.city, address.sub_city);

    // Get distance rate based on location type
    let distanceRate = URBAN_DISTANCE_RATE;
    if (locationType === 'suburban') {
        distanceRate = SUBURBAN_DISTANCE_RATE;
    } else if (locationType === 'rural') {
        distanceRate = RURAL_DISTANCE_RATE;
    }

    // Calculate base distance fee
    let distanceFee = BASE_DELIVERY_FEE; // Base fee regardless of distance
    if (distanceKm !== null && distanceKm > 0) {
        distanceFee += distanceKm * distanceRate;
    } else {
        // Fallback: use restaurant's base delivery fee or default flat fee
        distanceFee = parseFloat(restaurant.delivery_fee) || DEFAULT_DELIVERY_FEE_FLAT;
    }

    // Apply restaurant-specific base fee if set (overrides calculated base)
    if (restaurant.delivery_fee && parseFloat(restaurant.delivery_fee) > 0) {
        distanceFee = parseFloat(restaurant.delivery_fee);
        if (distanceKm !== null && distanceKm > 0) {
            distanceFee += distanceKm * distanceRate;
        }
    }

    // Apply peak hour multiplier
    let peakMultiplier = 1.0;
    if (isPeakHour()) {
        peakMultiplier = PEAK_HOUR_MULTIPLIER;
    }

    // Apply demand/supply multiplier
    const demandMultiplier = await calculateDemandMultiplier();

    // Calculate final fee with multipliers
    let finalFee = distanceFee * peakMultiplier * demandMultiplier;

    // Ensure minimum fee
    finalFee = Math.max(finalFee, MINIMUM_DELIVERY_FEE);

    return Math.round(finalFee * 100) / 100;
}

/**
 * Create order from customer's cart. Validates cart, address, availability; creates order + order items; clears cart; records status history.
 */
async function createOrderFromCart(customerId, { address_id, payment_method, special_instructions }) {
    const cart = await Cart.findOne({
        where: { customer_id: customerId },
        include: [
            { model: CartItem, as: 'items', include: [{ model: MenuItem, as: 'product' }] }
        ]
    });

    if (!cart || !cart.items || cart.items.length === 0) {
        const err = new Error('Cart is empty');
        err.statusCode = 400;
        throw err;
    }

    const address = await Address.findOne({
        where: { address_id, customer_id: customerId }
    });
    if (!address) {
        const err = new Error('Delivery address not found or does not belong to you');
        err.statusCode = 400;
        throw err;
    }

    let subtotal = 0;
    const orderItemsPayload = [];

    for (const ci of cart.items) {
        const product = ci.product;
        if (!product) {
            const err = new Error(`Menu item not found for cart item ${ci.cart_item_id}`);
            err.statusCode = 400;
            throw err;
        }
        if (!product.is_available) {
            const err = new Error(`Item "${product.item_name}" is no longer available`);
            err.statusCode = 400;
            throw err;
        }
        const unitPrice = parseFloat(product.price);
        const qty = ci.quantity || 1;
        const lineSubtotal = unitPrice * qty;
        subtotal += lineSubtotal;
        orderItemsPayload.push({
            item_id: product.item_id,
            item_name: product.item_name,
            quantity: qty,
            unit_price: unitPrice,
            subtotal: lineSubtotal,
            special_instructions: null
        });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // Get restaurant for delivery fee calculation
    const restaurant = await Restaurant.findByPk(cart.restaurant_id);
    if (!restaurant) {
        const err = new Error('Restaurant not found');
        err.statusCode = 400;
        throw err;
    }

    // Calculate happy hour discount (applied to subtotal)
    const happyHourDiscount = calculateHappyHourDiscount(restaurant, subtotal);
    const discountedSubtotal = Math.max(0, subtotal - happyHourDiscount);

    // Calculate smart delivery fee
    const deliveryFee = await calculateSmartDeliveryFee(restaurant, address);
    const serviceFee = calculateServiceFee();
    const totalAmount = Math.round((discountedSubtotal + deliveryFee + serviceFee) * 100) / 100;

    // Determine order flow type based on restaurant partnership status
    const orderFlowType = await determineOrderFlowType(cart.restaurant_id);

    const order = await Order.create({
        customer_id: customerId,
        restaurant_id: cart.restaurant_id,
        address_id: address.address_id,
        subtotal: discountedSubtotal, // Store discounted subtotal (after happy hour discount)
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        driver_tip: 0,
        discount_amount: happyHourDiscount, // Store discount amount for transparency
        total_amount: totalAmount,
        order_status: ORDER_STATUS.PENDING,
        payment_status: 'pending',
        payment_method,
        special_instructions: special_instructions || null,
        order_flow_type: orderFlowType,
        estimated_total_amount: orderFlowType === 'non_partnered' ? totalAmount : null // For non-partnered orders
    });

    for (const item of orderItemsPayload) {
        await OrderItem.create({
            order_id: order.order_id,
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
            special_instructions: item.special_instructions
        });
    }

    await OrderStatusHistory.create({
        order_id: order.order_id,
        old_status: null,
        new_status: ORDER_STATUS.PENDING,
        changed_by_type: 'customer',
        changed_by_id: customerId
    });

    await CartItem.destroy({ where: { cart_id: cart.cart_id } });
    await cart.destroy();

    // Generate verification code for delivery
    try {
        const { generateOrderVerificationCode, sendVerificationCode } = require('./verificationCodeService');
        await generateOrderVerificationCode(order.order_id);
        // Send code to customer immediately
        await sendVerificationCode(order.order_id);
    } catch (error) {
        console.error(`Failed to generate/send verification code for order ${order.order_id}:`, error.message);
        // Don't fail order creation if code generation fails
    }

    // Emit initial tracking update (Stage 1: Order Issued)
    try {
        const { emitTrackingUpdate, getTrackingStage } = require('./orderTrackingService');
        const trackingStage = getTrackingStage(order);
        emitTrackingUpdate(order.order_id, trackingStage, order);
    } catch (error) {
        console.error(`Failed to emit tracking update for order ${order.order_id}:`, error.message);
    }

    // Notify restaurant of new order (real-time)
    try {
        const { emitOrderCreated } = require('./socketEventService');
        emitOrderCreated(order, order.restaurant_id);
    } catch (error) {
        console.error(`Failed to emit order:created for order ${order.order_id}:`, error.message);
    }

    // Pool flow: drivers see orders when restaurant sets preparing/ready and accept from GET /drivers/orders/available
    return order;
}

/**
 * Record order status change in history.
 */
async function recordStatusChange(orderId, oldStatus, newStatus, changedByType, changedById) {
    await OrderStatusHistory.create({
        order_id: orderId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by_type: changedByType,
        changed_by_id: changedById
    });
}

module.exports = {
    createOrderFromCart,
    recordStatusChange,
    calculateSmartDeliveryFee,
    calculateServiceFee,
    calculateDemandMultiplier,
    calculateHappyHourDiscount,
    isHappyHour,
    isPeakHour
};
