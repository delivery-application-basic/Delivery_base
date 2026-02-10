const { Delivery, Order, Driver, Address, Restaurant, DriverLocationHistory } = require('../models');
const { DELIVERY_STATUS, ORDER_STATUS } = require('../utils/constants');
const { calculateDistance } = require('./distanceCalculator');
const { getIO } = require('../config/socket');
const { emitTrackingUpdate, getTrackingStage } = require('./orderTrackingService');
const { Op } = require('sequelize');

// Average bicycle speed in km/h (for Ethiopian market)
const AVERAGE_BICYCLE_SPEED_KMH = 15; // Conservative estimate for urban areas

/**
 * Calculate Estimated Time of Arrival (ETA)
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} currentSpeedKmh - Optional: Current speed (defaults to average bicycle speed)
 * @returns {number} ETA in minutes
 */
function calculateETA(distanceKm, currentSpeedKmh = AVERAGE_BICYCLE_SPEED_KMH) {
    if (!distanceKm || distanceKm <= 0) {
        return null;
    }
    // ETA = (Distance / Speed) * 60 minutes
    const etaHours = distanceKm / currentSpeedKmh;
    const etaMinutes = Math.ceil(etaHours * 60);
    return etaMinutes;
}

/**
 * Get delivery details by order ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Delivery details with ETA
 */
async function getDeliveryDetails(orderId) {
    const delivery = await Delivery.findOne({
        where: { order_id: orderId },
        include: [
            {
                model: Order,
                as: 'Order',
                attributes: ['order_id', 'order_status', 'total_amount', 'order_date'],
                include: [
                    {
                        model: Address,
                        as: 'delivery_address',
                        attributes: ['address_id', 'street_address', 'city', 'sub_city', 'latitude', 'longitude']
                    },
                    {
                        model: Restaurant,
                        as: 'restaurant',
                        attributes: ['restaurant_id', 'restaurant_name', 'latitude', 'longitude', 'street_address', 'city']
                    }
                ]
            },
            {
                model: Driver,
                as: 'driver',
                attributes: ['driver_id', 'full_name', 'phone_number', 'current_latitude', 'current_longitude']
            }
        ]
    });

    if (!delivery) {
        const err = new Error('Delivery not found');
        err.statusCode = 404;
        throw err;
    }

    // Calculate ETA if driver is in transit
    let eta = null;
    let distanceRemaining = null;

    if (delivery.delivery_status === DELIVERY_STATUS.IN_TRANSIT && delivery.driver) {
        const driverLat = parseFloat(delivery.driver.current_latitude);
        const driverLon = parseFloat(delivery.driver.current_longitude);
        const deliveryLat = parseFloat(delivery.delivery_latitude);
        const deliveryLon = parseFloat(delivery.delivery_longitude);

        if (driverLat && driverLon && deliveryLat && deliveryLon) {
            distanceRemaining = calculateDistance(driverLat, driverLon, deliveryLat, deliveryLon);
            if (distanceRemaining !== null && distanceRemaining > 0) {
                eta = calculateETA(distanceRemaining);
            }
        }
    }

    return {
        delivery_id: delivery.delivery_id,
        order_id: delivery.order_id,
        driver_id: delivery.driver_id,
        driver: delivery.driver ? {
            driver_id: delivery.driver.driver_id,
            full_name: delivery.driver.full_name,
            phone_number: delivery.driver.phone_number,
            current_location: delivery.driver.current_latitude && delivery.driver.current_longitude ? {
                latitude: parseFloat(delivery.driver.current_latitude),
                longitude: parseFloat(delivery.driver.current_longitude)
            } : null
        } : null,
        pickup_address: delivery.pickup_address,
        pickup_location: delivery.pickup_latitude && delivery.pickup_longitude ? {
            latitude: parseFloat(delivery.pickup_latitude),
            longitude: parseFloat(delivery.pickup_longitude)
        } : null,
        delivery_address: delivery.delivery_address,
        delivery_location: delivery.delivery_latitude && delivery.delivery_longitude ? {
            latitude: parseFloat(delivery.delivery_latitude),
            longitude: parseFloat(delivery.delivery_longitude)
        } : null,
        distance_km: delivery.distance_km ? parseFloat(delivery.distance_km) : null,
        distance_remaining_km: distanceRemaining,
        delivery_status: delivery.delivery_status,
        order_status: delivery.Order ? delivery.Order.order_status : null,
        assigned_at: delivery.assigned_at,
        picked_up_at: delivery.picked_up_at,
        delivered_at: delivery.delivered_at,
        delivery_proof_url: delivery.delivery_proof_url,
        eta_minutes: eta,
        restaurant: delivery.Order && delivery.Order.restaurant ? {
            restaurant_id: delivery.Order.restaurant.restaurant_id,
            restaurant_name: delivery.Order.restaurant.restaurant_name,
            address: `${delivery.Order.restaurant.street_address}, ${delivery.Order.restaurant.city}`,
            location: delivery.Order.restaurant.latitude && delivery.Order.restaurant.longitude ? {
                latitude: parseFloat(delivery.Order.restaurant.latitude),
                longitude: parseFloat(delivery.Order.restaurant.longitude)
            } : null
        } : null
    };
}

/**
 * Update driver location for delivery tracking
 * @param {number} deliveryId - Delivery ID
 * @param {number} driverId - Driver ID (from authenticated user)
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @returns {Promise<Object>} Updated location info
 */
async function updateDriverLocation(deliveryId, driverId, latitude, longitude) {
    const delivery = await Delivery.findOne({
        where: {
            delivery_id: deliveryId,
            driver_id: driverId
        },
        include: [
            {
                model: Order,
                as: 'Order',
                attributes: ['order_id', 'customer_id', 'restaurant_id']
            }
        ]
    });

    if (!delivery) {
        const err = new Error('Delivery not found or you are not assigned to this delivery');
        err.statusCode = 404;
        throw err;
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        const err = new Error('Invalid coordinates');
        err.statusCode = 400;
        throw err;
    }

    // Update driver's current location
    await Driver.update(
        {
            current_latitude: lat,
            current_longitude: lon
        },
        {
            where: { driver_id: driverId }
        }
    );

    // Record location in history
    await DriverLocationHistory.create({
        driver_id: driverId,
        latitude: lat,
        longitude: lon
    });

    // Calculate distance remaining and ETA
    let distanceRemaining = null;
    let eta = null;

    if (delivery.delivery_latitude && delivery.delivery_longitude) {
        const deliveryLat = parseFloat(delivery.delivery_latitude);
        const deliveryLon = parseFloat(delivery.delivery_longitude);
        distanceRemaining = calculateDistance(lat, lon, deliveryLat, deliveryLon);
        if (distanceRemaining !== null && distanceRemaining > 0) {
            eta = calculateETA(distanceRemaining);
        }
    }

    // Emit real-time location update via Socket.io
    const io = getIO();
    const orderId = delivery.Order ? delivery.Order.order_id : delivery.order_id;
    if (io && orderId) {
        // Emit to order room (customer, restaurant can listen)
        io.to(`order:${orderId}`).emit('delivery:location-update', {
            order_id: orderId,
            delivery_id: deliveryId,
            driver_id: driverId,
            latitude: lat,
            longitude: lon,
            distance_remaining_km: distanceRemaining,
            eta_minutes: eta,
            timestamp: new Date()
        });
    }

    return {
        delivery_id: deliveryId,
        order_id: orderId,
        latitude: lat,
        longitude: lon,
        distance_remaining_km: distanceRemaining,
        eta_minutes: eta,
        timestamp: new Date()
    };
}

/**
 * Update delivery status
 * @param {number} deliveryId - Delivery ID
 * @param {number} driverId - Driver ID (from authenticated user)
 * @param {string} status - New delivery status
 * @returns {Promise<Object>} Updated delivery info
 */
async function updateDeliveryStatus(deliveryId, driverId, status) {
    const validStatuses = Object.values(DELIVERY_STATUS);
    if (!validStatuses.includes(status)) {
        const err = new Error(`Invalid delivery status. Must be one of: ${validStatuses.join(', ')}`);
        err.statusCode = 400;
        throw err;
    }

    const delivery = await Delivery.findOne({
        where: {
            delivery_id: deliveryId,
            driver_id: driverId
        },
        include: [
            {
                model: Order,
                as: 'Order',
                attributes: ['order_id', 'customer_id', 'restaurant_id', 'order_status']
            }
        ]
    });

    if (!delivery) {
        const err = new Error('Delivery not found or you are not assigned to this delivery');
        err.statusCode = 404;
        throw err;
    }

    const oldStatus = delivery.delivery_status;

    // Update delivery status
    const updateData = { delivery_status: status };

    // Update timestamps based on status
    if (status === DELIVERY_STATUS.PICKED_UP && !delivery.picked_up_at) {
        updateData.picked_up_at = new Date();
    } else if (status === DELIVERY_STATUS.DELIVERED && !delivery.delivered_at) {
        updateData.delivered_at = new Date();
    }

    await delivery.update(updateData);

    // Update order status if needed
    const orderId = delivery.Order ? delivery.Order.order_id : delivery.order_id;
    let newOrderStatus = null;
    
    if (delivery.Order) {
        if (status === DELIVERY_STATUS.PICKED_UP && delivery.Order.order_status === ORDER_STATUS.READY) {
            newOrderStatus = ORDER_STATUS.PICKED_UP;
            await delivery.Order.update({ order_status: ORDER_STATUS.PICKED_UP });
        } else if (status === DELIVERY_STATUS.IN_TRANSIT && delivery.Order.order_status === ORDER_STATUS.PICKED_UP) {
            newOrderStatus = ORDER_STATUS.IN_TRANSIT;
            await delivery.Order.update({ order_status: ORDER_STATUS.IN_TRANSIT });
        } else if (status === DELIVERY_STATUS.DELIVERED && delivery.Order.order_status !== ORDER_STATUS.DELIVERED) {
            newOrderStatus = ORDER_STATUS.DELIVERED;
            await delivery.Order.update({ order_status: ORDER_STATUS.DELIVERED });
        } else {
            newOrderStatus = delivery.Order.order_status;
        }
    }

    // Emit real-time status update via Socket.io
    const io = getIO();
    if (io && orderId) {
        io.to(`order:${orderId}`).emit('delivery:status-update', {
            order_id: orderId,
            delivery_id: deliveryId,
            old_status: oldStatus,
            new_status: status,
            order_status: newOrderStatus || delivery.Order?.order_status,
            timestamp: new Date()
        });
    }

    // Emit simplified tracking update
    try {
        const updatedOrder = await Order.findByPk(orderId);
        if (updatedOrder) {
            const trackingStage = getTrackingStage(updatedOrder);
            emitTrackingUpdate(orderId, trackingStage, updatedOrder);
            const { emitOrderStatusEvent } = require('./socketEventService');
            emitOrderStatusEvent(orderId, updatedOrder.order_status);
        }
    } catch (error) {
        console.error(`Failed to emit tracking update for order ${orderId}:`, error.message);
    }

    return {
        delivery_id: deliveryId,
        order_id: orderId,
        old_status: oldStatus,
        new_status: status,
        order_status: newOrderStatus || delivery.Order?.order_status,
        picked_up_at: delivery.picked_up_at,
        delivered_at: delivery.delivered_at
    };
}

/**
 * Upload delivery proof (photo)
 * @param {number} deliveryId - Delivery ID
 * @param {number} driverId - Driver ID (from authenticated user)
 * @param {string} proofUrl - URL of uploaded proof image
 * @returns {Promise<Object>} Updated delivery info
 */
async function uploadDeliveryProof(deliveryId, driverId, proofUrl) {
    if (!proofUrl || proofUrl.trim().length === 0) {
        const err = new Error('Proof URL is required');
        err.statusCode = 400;
        throw err;
    }

    const delivery = await Delivery.findOne({
        where: {
            delivery_id: deliveryId,
            driver_id: driverId
        },
        include: [
            {
                model: Order,
                as: 'Order',
                attributes: ['order_id']
            }
        ]
    });

    if (!delivery) {
        const err = new Error('Delivery not found or you are not assigned to this delivery');
        err.statusCode = 404;
        throw err;
    }

    // Update delivery proof
    await delivery.update({
        delivery_proof_url: proofUrl
    });

    // Emit proof upload notification
    const io = getIO();
    const orderId = delivery.Order ? delivery.Order.order_id : delivery.order_id;
    if (io && orderId) {
        io.to(`order:${orderId}`).emit('delivery:proof-uploaded', {
            order_id: orderId,
            delivery_id: deliveryId,
            proof_url: proofUrl,
            timestamp: new Date()
        });
    }

    return {
        delivery_id: deliveryId,
        order_id: orderId,
        delivery_proof_url: proofUrl,
        message: 'Delivery proof uploaded successfully'
    };
}

/**
 * Get delivery route (for map display)
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Route information
 */
async function getDeliveryRoute(orderId) {
    const delivery = await Delivery.findOne({
        where: { order_id: orderId },
        include: [
            {
                model: Driver,
                as: 'driver',
                attributes: ['driver_id', 'current_latitude', 'current_longitude']
            }
        ]
    });

    if (!delivery) {
        const err = new Error('Delivery not found');
        err.statusCode = 404;
        throw err;
    }

    const route = {
        pickup: null,
        delivery: null,
        driver_current: null
    };

    if (delivery.pickup_latitude && delivery.pickup_longitude) {
        route.pickup = {
            latitude: parseFloat(delivery.pickup_latitude),
            longitude: parseFloat(delivery.pickup_longitude),
            address: delivery.pickup_address
        };
    }

    if (delivery.delivery_latitude && delivery.delivery_longitude) {
        route.delivery = {
            latitude: parseFloat(delivery.delivery_latitude),
            longitude: parseFloat(delivery.delivery_longitude),
            address: delivery.delivery_address
        };
    }

    if (delivery.driver && delivery.driver.current_latitude && delivery.driver.current_longitude) {
        route.driver_current = {
            latitude: parseFloat(delivery.driver.current_latitude),
            longitude: parseFloat(delivery.driver.current_longitude)
        };
    }

    return route;
}

module.exports = {
    getDeliveryDetails,
    updateDriverLocation,
    updateDeliveryStatus,
    uploadDeliveryProof,
    getDeliveryRoute,
    calculateETA
};
