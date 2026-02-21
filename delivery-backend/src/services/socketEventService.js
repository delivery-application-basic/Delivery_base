/**
 * Central place to emit Step 13 real-time socket events.
 * Used by orderService, orderController, driverAssignmentService, deliveryTrackingService.
 */
const { getIO } = require('../config/socket');
const { ORDER_STATUS } = require('../utils/constants');

function getIOOrNull() {
    try {
        return getIO();
    } catch {
        return null;
    }
}

/**
 * Notify restaurant of new order (order:created)
 */
function emitOrderCreated(order, restaurantId) {
    const io = getIOOrNull();
    if (!io || !restaurantId) return;
    const payload = {
        order_id: order.order_id,
        customer_id: order.customer_id,
        total_amount: order.total_amount,
        order_status: order.order_status,
        created_at: order.created_at,
        timestamp: new Date()
    };
    io.to(`restaurant:${restaurantId}`).emit('order:created', payload);
}

/**
 * Emit order status event to order room (order:confirmed, order:ready, order:assigned, order:picked-up, order:in-transit, order:delivered)
 */
function emitOrderStatusEvent(orderId, orderStatus, extra = {}) {
    const io = getIOOrNull();
    if (!io || !orderId) return;
    const eventMap = {
        [ORDER_STATUS.CONFIRMED]: 'order:confirmed',
        [ORDER_STATUS.READY]: 'order:ready',
        [ORDER_STATUS.PICKED_UP]: 'order:picked-up',
        [ORDER_STATUS.IN_TRANSIT]: 'order:in-transit',
        [ORDER_STATUS.DELIVERED]: 'order:delivered'
    };
    const event = eventMap[orderStatus];
    if (!event) return;
    io.to(`order:${orderId}`).emit(event, {
        order_id: orderId,
        order_status: orderStatus,
        timestamp: new Date(),
        ...extra
    });
}

/**
 * Notify order room that order was cancelled
 */
function emitOrderCancelled(orderId, reason = null) {
    const io = getIOOrNull();
    if (!io || !orderId) return;
    io.to(`order:${orderId}`).emit('order:cancelled', {
        order_id: orderId,
        reason,
        timestamp: new Date()
    });
}

/**
 * Notify driver of new assignment offer (driver:assignment)
 */
function emitDriverAssignment(driverId, payload) {
    const io = getIOOrNull();
    if (!io || !driverId) return;
    io.to(`driver:${driverId}`).emit('driver:assignment', {
        ...payload,
        timestamp: new Date()
    });
}

/**
 * Notify order room that driver was assigned (order:assigned)
 */
function emitOrderAssigned(orderId, payload) {
    const io = getIOOrNull();
    if (!io || !orderId) return;
    io.to(`order:${orderId}`).emit('order:assigned', {
        order_id: orderId,
        ...payload,
        timestamp: new Date()
    });
}

/**
 * Notify all drivers that an order was taken (so they remove it from available list)
 */
function emitOrderTakenToDrivers(orderId) {
    const io = getIOOrNull();
    if (!io || !orderId) return;
    io.to('drivers').emit('order:taken', {
        order_id: orderId,
        timestamp: new Date()
    });
}

/**
 * Notify eligible drivers that a new order is available (preparing or ready), filtered by vehicle type and distance
 */
function emitOrderAvailableToEligibleDrivers(orderId, orderStatus) {
    const io = getIOOrNull();
    if (!io || !orderId) return;

    // Get eligible drivers for this order
    const { findNearestAvailableDrivers } = require('./driverAssignmentService');
    findNearestAvailableDrivers(orderId).then(drivers => {
        drivers.forEach(driver => {
            io.to(`driver:${driver.driver_id}`).emit('order:available', {
                order_id: orderId,
                order_status: orderStatus,
                distance_km: driver.distance_km,
                priority_score: driver.priority_score,
                timestamp: new Date()
            });
        });
    }).catch(error => {
        console.error(`Failed to find eligible drivers for order ${orderId}:`, error.message);
    });
}

/**
 * Notify restaurant that an order was delivered (so they can complete their records)
 */
function emitOrderDeliveredToRestaurant(orderId, restaurantId) {
    const io = getIOOrNull();
    if (!io || !orderId || !restaurantId) return;
    io.to(`restaurant:${restaurantId}`).emit('order:delivered', {
        order_id: orderId,
        order_status: 'delivered',
        message: 'Order delivered. You can complete your records.',
        timestamp: new Date()
    });
}

/**
 * Notify order room of driver's live location (driver:location_update)
 */
function emitDriverLocationUpdate(orderId, driverId, location) {
    const io = getIOOrNull();
    if (!io || !orderId) return;
    io.to(`order:${orderId}`).emit('driver:location_update', {
        order_id: orderId,
        driver_id: driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date()
    });
}

module.exports = {
    emitOrderCreated,
    emitOrderStatusEvent,
    emitOrderCancelled,
    emitDriverAssignment,
    emitOrderAssigned,
    emitOrderTakenToDrivers,
    emitOrderAvailableToEligibleDrivers,
    emitOrderDeliveredToRestaurant,
    emitDriverLocationUpdate
};
