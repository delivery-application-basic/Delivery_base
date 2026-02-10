const { Order, OrderStatusHistory, Delivery, Driver, Restaurant, Address } = require('../models');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../utils/constants');
const { getIO } = require('../config/socket');

/**
 * Simplified 5-Stage Tracking System (Ethiopian Market Optimized)
 * 
 * Stages:
 * 1. ORDER_ISSUED - Order created, payment pending
 * 2. PAYMENT_VERIFIED - Payment confirmed
 * 3. PROCESSING_FOOD - Restaurant preparing food
 * 4. DELIVERY_ON_THE_WAY - Driver picked up, en route to customer
 * 5. DELIVERED - Order completed
 */

const TRACKING_STAGES = {
    ORDER_ISSUED: 'order_issued',
    PAYMENT_VERIFIED: 'payment_verified',
    PROCESSING_FOOD: 'processing_food',
    DELIVERY_ON_THE_WAY: 'delivery_on_the_way',
    DELIVERED: 'delivered'
};

/**
 * Determine current tracking stage based on order status and payment status
 */
function getTrackingStage(order) {
    const orderStatus = order.order_status;
    const paymentStatus = order.payment_status;

    // Stage 5: Delivered
    if (orderStatus === ORDER_STATUS.DELIVERED) {
        return TRACKING_STAGES.DELIVERED;
    }

    // Stage 4: Delivery On The Way
    if ([ORDER_STATUS.PICKED_UP, ORDER_STATUS.IN_TRANSIT].includes(orderStatus)) {
        return TRACKING_STAGES.DELIVERY_ON_THE_WAY;
    }

    // Stage 3: Processing Food
    if ([ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY].includes(orderStatus)) {
        return TRACKING_STAGES.PROCESSING_FOOD;
    }

    // Stage 2: Payment Verified
    if (paymentStatus === PAYMENT_STATUS.COMPLETED && orderStatus === ORDER_STATUS.PENDING) {
        return TRACKING_STAGES.PAYMENT_VERIFIED;
    }

    // Stage 1: Order Issued (default)
    return TRACKING_STAGES.ORDER_ISSUED;
}

/**
 * Get stage number for display (1-5)
 */
function getStageNumber(stage) {
    const stageMap = {
        [TRACKING_STAGES.ORDER_ISSUED]: 1,
        [TRACKING_STAGES.PAYMENT_VERIFIED]: 2,
        [TRACKING_STAGES.PROCESSING_FOOD]: 3,
        [TRACKING_STAGES.DELIVERY_ON_THE_WAY]: 4,
        [TRACKING_STAGES.DELIVERED]: 5
    };
    return stageMap[stage] || 1;
}

/**
 * Get user-friendly stage label
 */
function getStageLabel(stage) {
    const labels = {
        [TRACKING_STAGES.ORDER_ISSUED]: 'Order Issued',
        [TRACKING_STAGES.PAYMENT_VERIFIED]: 'Payment Verified',
        [TRACKING_STAGES.PROCESSING_FOOD]: 'Processing Food',
        [TRACKING_STAGES.DELIVERY_ON_THE_WAY]: 'Delivery On The Way',
        [TRACKING_STAGES.DELIVERED]: 'Delivered'
    };
    return labels[stage] || 'Unknown';
}

/**
 * Get order tracking information (simplified 5-stage system)
 */
async function getOrderTracking(orderId) {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'restaurant_name', 'phone_number', 'street_address', 'city'] },
            { model: Address, as: 'delivery_address', attributes: ['address_id', 'address_label', 'street_address', 'city', 'sub_city', 'landmark'] },
            { model: Driver, as: 'driver', attributes: ['driver_id', 'full_name', 'phone_number'] },
            {
                model: Delivery,
                as: 'delivery',
                attributes: ['delivery_id', 'distance_km', 'assigned_at', 'picked_up_at', 'delivered_at']
            }
        ]
    });

    if (!order) {
        throw new Error('Order not found');
    }

    const currentStage = getTrackingStage(order);
    const stageNumber = getStageNumber(currentStage);
    
    // Calculate estimated delivery time (average 25 minutes for Ethiopian market)
    const estimatedDeliveryTime = 25; // minutes
    let estimatedDeliveryAt = null;
    
    if (order.confirmed_at) {
        estimatedDeliveryAt = new Date(order.confirmed_at);
        estimatedDeliveryAt.setMinutes(estimatedDeliveryAt.getMinutes() + estimatedDeliveryTime);
    }

    // Build simplified timeline
    const timeline = [];
    
    // Stage 1: Order Issued
    timeline.push({
        stage: TRACKING_STAGES.ORDER_ISSUED,
        stageNumber: 1,
        label: getStageLabel(TRACKING_STAGES.ORDER_ISSUED),
        completed: true,
        timestamp: order.created_at
    });

    // Stage 2: Payment Verified
    const paymentVerified = order.payment_status === PAYMENT_STATUS.COMPLETED;
    timeline.push({
        stage: TRACKING_STAGES.PAYMENT_VERIFIED,
        stageNumber: 2,
        label: getStageLabel(TRACKING_STAGES.PAYMENT_VERIFIED),
        completed: paymentVerified,
        timestamp: paymentVerified ? (order.paid_at || order.created_at) : null
    });

    // Stage 3: Processing Food
    const processingFood = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.PICKED_UP, ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.DELIVERED].includes(order.order_status);
    timeline.push({
        stage: TRACKING_STAGES.PROCESSING_FOOD,
        stageNumber: 3,
        label: getStageLabel(TRACKING_STAGES.PROCESSING_FOOD),
        completed: processingFood,
        timestamp: processingFood ? (order.confirmed_at || order.created_at) : null
    });

    // Stage 4: Delivery On The Way
    const deliveryOnWay = [ORDER_STATUS.PICKED_UP, ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.DELIVERED].includes(order.order_status);
    timeline.push({
        stage: TRACKING_STAGES.DELIVERY_ON_THE_WAY,
        stageNumber: 4,
        label: getStageLabel(TRACKING_STAGES.DELIVERY_ON_THE_WAY),
        completed: deliveryOnWay,
        timestamp: deliveryOnWay ? (order.delivery?.picked_up_at || order.delivery?.assigned_at) : null
    });

    // Stage 5: Delivered
    const delivered = order.order_status === ORDER_STATUS.DELIVERED;
    timeline.push({
        stage: TRACKING_STAGES.DELIVERED,
        stageNumber: 5,
        label: getStageLabel(TRACKING_STAGES.DELIVERED),
        completed: delivered,
        timestamp: delivered ? (order.delivered_at || order.delivery?.delivered_at) : null
    });

    return {
        order_id: order.order_id,
        current_stage: currentStage,
        current_stage_number: stageNumber,
        current_stage_label: getStageLabel(currentStage),
        timeline,
        estimated_delivery_time: estimatedDeliveryTime,
        estimated_delivery_at: estimatedDeliveryAt,
        restaurant: {
            restaurant_id: order.restaurant?.restaurant_id,
            restaurant_name: order.restaurant?.restaurant_name,
            phone_number: order.restaurant?.phone_number,
            address: order.restaurant?.street_address
        },
        delivery_address: {
            address_label: order.delivery_address?.address_label,
            street_address: order.delivery_address?.street_address,
            city: order.delivery_address?.city,
            sub_city: order.delivery_address?.sub_city,
            landmark: order.delivery_address?.landmark
        },
        driver: order.driver ? {
            driver_id: order.driver.driver_id,
            full_name: order.driver.full_name,
            phone_number: order.driver.phone_number
        } : null,
        order_status: order.order_status,
        payment_status: order.payment_status
    };
}

/**
 * Emit lightweight tracking update via Socket.io
 */
function emitTrackingUpdate(orderId, trackingStage, order = null) {
    const io = getIO();
    if (!io || !orderId) return;

    const update = {
        order_id: orderId,
        current_stage: trackingStage,
        current_stage_number: getStageNumber(trackingStage),
        current_stage_label: getStageLabel(trackingStage),
        timestamp: new Date()
    };

    // Include order status if available
    if (order) {
        update.order_status = order.order_status;
        update.payment_status = order.payment_status;
    }

    // Emit to order-specific room
    io.to(`order:${orderId}`).emit('order:tracking-update', update);
}

module.exports = {
    getOrderTracking,
    getTrackingStage,
    TRACKING_STAGES,
    emitTrackingUpdate,
    getStageNumber,
    getStageLabel
};
