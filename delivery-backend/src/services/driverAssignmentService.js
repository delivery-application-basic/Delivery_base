const { Driver, Order, Address, Restaurant, DriverAssignment, Delivery, OrderStatusHistory } = require('../models');
const { ORDER_STATUS, DELIVERY_STATUS } = require('../utils/constants');
const { calculateDistance } = require('./distanceCalculator');
const { Op } = require('sequelize');

const DEFAULT_DELIVERY_RADIUS_KM = parseFloat(process.env.DEFAULT_DELIVERY_RADIUS_KM) || 10.0;
const ASSIGNMENT_TIMEOUT_SECONDS = 60; // 60 seconds timeout for driver response

/**
 * Find nearest available drivers for an order
 * @param {number} orderId - Order ID
 * @param {number} maxDrivers - Maximum number of drivers to return (default: 5)
 * @returns {Promise<Array>} Array of drivers sorted by distance
 */
async function findNearestAvailableDrivers(orderId, maxDrivers = 5) {
    // Get order with restaurant
    const order = await Order.findOne({
        where: { order_id: orderId },
        include: [
            { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'latitude', 'longitude', 'restaurant_name', 'street_address', 'city'] },
            { model: Address, as: 'delivery_address', attributes: ['address_id', 'latitude', 'longitude'] }
        ]
    });

    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    const address = order.delivery_address;

    if (!order.restaurant || !address) {
        const err = new Error('Order missing restaurant or delivery address information');
        err.statusCode = 400;
        throw err;
    }

    const restaurantLat = parseFloat(order.restaurant.latitude);
    const restaurantLon = parseFloat(order.restaurant.longitude);
    const deliveryLat = parseFloat(address.latitude);
    const deliveryLon = parseFloat(address.longitude);

    if (!restaurantLat || !restaurantLon || !deliveryLat || !deliveryLon) {
        const err = new Error('Restaurant or delivery address missing coordinates');
        err.statusCode = 400;
        throw err;
    }

    // Get all available drivers
    const availableDrivers = await Driver.findAll({
        where: {
            is_available: true,
            is_active: true,
            verification_status: 'approved',
            current_latitude: { [Op.not]: null },
            current_longitude: { [Op.not]: null }
        },
        attributes: [
            'driver_id',
            'full_name',
            'phone_number',
            'vehicle_type',
            'current_latitude',
            'current_longitude',
            'average_rating',
            'total_deliveries'
        ]
    });

    if (availableDrivers.length === 0) {
        return [];
    }

    // Calculate distance from restaurant to each driver
    // Calculate priority score based on distance and rating (all drivers use bicycles)
    const driversWithDistance = availableDrivers
        .map(driver => {
            const driverLat = parseFloat(driver.current_latitude);
            const driverLon = parseFloat(driver.current_longitude);

            if (!driverLat || !driverLon) {
                return null;
            }

            // Calculate distance from restaurant to driver
            const distanceToRestaurant = calculateDistance(restaurantLat, restaurantLon, driverLat, driverLon);

            if (distanceToRestaurant === null || distanceToRestaurant > DEFAULT_DELIVERY_RADIUS_KM) {
                return null; // Driver is too far from restaurant
            }

            // Rating score (0-5, higher is better)
            const rating = parseFloat(driver.average_rating) || 0;

            // Calculate priority score: 80% distance, 20% rating
            // All drivers use bicycles, so vehicle type is not considered
            // Lower score = higher priority
            const distanceScore = distanceToRestaurant * 0.8;
            const ratingScore = (5 - rating) * 0.2; // Invert rating so lower is better
            const priorityScore = distanceScore + ratingScore;

            return {
                driver_id: driver.driver_id,
                full_name: driver.full_name,
                phone_number: driver.phone_number,
                vehicle_type: driver.vehicle_type,
                current_latitude: driver.current_latitude,
                current_longitude: driver.current_longitude,
                average_rating: driver.average_rating,
                total_deliveries: driver.total_deliveries,
                distance_km: distanceToRestaurant,
                priority_score: priorityScore // For sorting
            };
        })
        .filter(driver => driver !== null)
        .sort((a, b) => {
            // Primary sort: priority score (lower is better)
            if (a.priority_score !== b.priority_score) {
                return a.priority_score - b.priority_score;
            }
            // Secondary sort: distance (nearest first)
            return a.distance_km - b.distance_km;
        })
        .slice(0, maxDrivers); // Limit to maxDrivers

    return driversWithDistance;
}

/**
 * Auto-assign driver to order
 * Finds nearest available driver and creates assignment offer
 * Excludes drivers who have already been offered or rejected this order
 * 
 * FLOW DIFFERENCES:
 * - Partnered: Order must be 'ready' (restaurant prepares first)
 * - Non-Partnered: Order can be assigned immediately (driver places order)
 * 
 * @param {number} orderId - Order ID
 * @param {Array<number>} excludeDriverIds - Optional: Driver IDs to exclude (e.g., already rejected)
 * @returns {Promise<Object>} Assignment details
 */
async function autoAssignDriver(orderId, excludeDriverIds = []) {
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    // Check order flow type and status requirements
    const isPartnered = order.order_flow_type === 'partnered';
    const isNonPartnered = order.order_flow_type === 'non_partnered';

    if (isPartnered) {
        // Partnered: Order must be 'ready' (restaurant prepares first)
        if (order.order_status !== ORDER_STATUS.READY) {
            const err = new Error(`Partnered order must be in 'ready' status. Current status: ${order.order_status}`);
            err.statusCode = 400;
            throw err;
        }
    } else if (isNonPartnered) {
        // Non-Partnered: Can assign immediately (driver will place order)
        if (![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.order_status)) {
            const err = new Error(`Non-partnered order can only be assigned when status is 'pending' or 'confirmed'. Current status: ${order.order_status}`);
            err.statusCode = 400;
            throw err;
        }
    } else {
        // Default to partnered behavior if flow type not set
        if (order.order_status !== ORDER_STATUS.READY) {
            const err = new Error(`Order must be in 'ready' status. Current status: ${order.order_status}`);
            err.statusCode = 400;
            throw err;
        }
    }

    // Check if order already has a driver assigned
    if (order.driver_id) {
        const err = new Error('Order already has a driver assigned');
        err.statusCode = 400;
        throw err;
    }

    // Check for existing pending assignments
    const existingAssignment = await DriverAssignment.findOne({
        where: {
            order_id: orderId,
            assignment_status: 'offered'
        }
    });

    if (existingAssignment) {
        // Check if assignment has expired
        const offeredAt = new Date(existingAssignment.offered_at);
        const now = new Date();
        const secondsElapsed = (now - offeredAt) / 1000;

        if (secondsElapsed < ASSIGNMENT_TIMEOUT_SECONDS) {
            const err = new Error('Assignment offer already sent to a driver. Please wait for response or timeout.');
            err.statusCode = 400;
            throw err;
        } else {
            // Mark expired assignment
            await existingAssignment.update({
                assignment_status: 'expired',
                responded_at: now
            });
        }
    }

    // Get all drivers who have already been offered/rejected for this order
    const previousAssignments = await DriverAssignment.findAll({
        where: {
            order_id: orderId,
            assignment_status: { [Op.in]: ['offered', 'rejected', 'expired'] }
        },
        attributes: ['driver_id']
    });

    const alreadyOfferedDriverIds = previousAssignments.map(a => a.driver_id);
    // Combine with explicitly excluded driver IDs
    const allExcludedDriverIds = [...new Set([...alreadyOfferedDriverIds, ...excludeDriverIds])];

    // Find nearest available drivers (excluding already offered/rejected ones)
    const nearestDrivers = await findNearestAvailableDrivers(orderId, 10); // Get more drivers to have options

    // Filter out excluded drivers
    const availableDrivers = nearestDrivers.filter(
        driver => !allExcludedDriverIds.includes(driver.driver_id)
    );

    if (availableDrivers.length === 0) {
        const err = new Error('No available drivers found within delivery radius. All nearby drivers have been offered or rejected.');
        err.statusCode = 404;
        throw err;
    }

    // Try to assign to nearest available driver
    const driver = availableDrivers[0]; // Nearest driver after filtering

    // Double-check driver doesn't have pending assignment
    const existingDriverAssignment = await DriverAssignment.findOne({
        where: {
            order_id: orderId,
            driver_id: driver.driver_id,
            assignment_status: { [Op.in]: ['offered', 'accepted'] }
        }
    });

    if (existingDriverAssignment) {
        const err = new Error('Driver already has a pending assignment for this order');
        err.statusCode = 400;
        throw err;
    }

    // Create assignment offer
    const assignment = await DriverAssignment.create({
        order_id: orderId,
        driver_id: driver.driver_id,
        assignment_status: 'offered',
        offered_at: new Date()
    });

    const result = {
        assignment_id: assignment.assignment_id,
        order_id: orderId,
        driver_id: driver.driver_id,
        driver_name: driver.full_name,
        driver_phone: driver.phone_number,
        vehicle_type: driver.vehicle_type,
        distance_km: driver.distance_km,
        assignment_status: 'offered',
        timeout_seconds: ASSIGNMENT_TIMEOUT_SECONDS,
        message: 'Assignment offer sent to nearest driver. Waiting for response...'
    };

    try {
        const { emitDriverAssignment } = require('./socketEventService');
        emitDriverAssignment(driver.driver_id, {
            assignment_id: assignment.assignment_id,
            order_id: orderId,
            distance_km: driver.distance_km,
            timeout_seconds: ASSIGNMENT_TIMEOUT_SECONDS
        });
    } catch (error) {
        console.error(`Failed to emit driver:assignment for order ${orderId}:`, error.message);
    }

    return result;
}

/**
 * Manual assignment by admin
 * @param {number} orderId - Order ID
 * @param {number} driverId - Driver ID to assign
 * @returns {Promise<Object>} Assignment details
 */
async function manualAssignDriver(orderId, driverId) {
    // Check if order exists and is in 'ready' status
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }

    // Check order status based on flow type
    const isPartnered = order.order_flow_type === 'partnered';
    const isNonPartnered = order.order_flow_type === 'non_partnered';

    if (isPartnered && order.order_status !== ORDER_STATUS.READY) {
        const err = new Error(`Partnered order must be in 'ready' status. Current status: ${order.order_status}`);
        err.statusCode = 400;
        throw err;
    }

    if (isNonPartnered && ![ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.order_status)) {
        const err = new Error(`Non-partnered order can only be assigned when status is 'pending' or 'confirmed'. Current status: ${order.order_status}`);
        err.statusCode = 400;
        throw err;
    }

    // Check if order already has a driver assigned
    if (order.driver_id) {
        const err = new Error('Order already has a driver assigned');
        err.statusCode = 400;
        throw err;
    }

    // Check if driver exists and is available
    const driver = await Driver.findByPk(driverId);
    if (!driver) {
        const err = new Error('Driver not found');
        err.statusCode = 404;
        throw err;
    }

    if (!driver.is_available || !driver.is_active || driver.verification_status !== 'approved') {
        const err = new Error('Driver is not available for assignment');
        err.statusCode = 400;
        throw err;
    }

    // Create assignment and immediately accept (manual assignment)
    const assignment = await DriverAssignment.create({
        order_id: orderId,
        driver_id: driverId,
        assignment_status: 'accepted',
        offered_at: new Date(),
        responded_at: new Date()
    });

    // Update order with driver
    // For non-partnered orders, status changes to 'confirmed' (driver will place order)
    // For partnered orders, status changes to 'picked_up' (food already ready)
    const newStatus = isNonPartnered ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PICKED_UP;

    await order.update({
        driver_id: driverId,
        order_status: newStatus
    });

    // Create delivery record
    const restaurant = await Restaurant.findByPk(order.restaurant_id);
    const address = await Address.findByPk(order.address_id);

    await Delivery.create({
        order_id: orderId,
        driver_id: driverId,
        pickup_address: restaurant ? `${restaurant.street_address}, ${restaurant.city}` : 'Restaurant Address',
        pickup_latitude: restaurant ? restaurant.latitude : null,
        pickup_longitude: restaurant ? restaurant.longitude : null,
        delivery_address: address ? `${address.street_address}, ${address.city}` : 'Delivery Address',
        delivery_latitude: address ? address.latitude : null,
        delivery_longitude: address ? address.longitude : null,
        distance_km: order.delivery_fee ? null : null, // Will be calculated if needed
        assigned_at: new Date(),
        delivery_status: DELIVERY_STATUS.ASSIGNED
    });

    // Send verification code to driver when manually assigned
    try {
        const { sendVerificationCode } = require('./verificationCodeService');
        await sendVerificationCode(orderId);
    } catch (error) {
        console.error(`Failed to send verification code to driver for order ${orderId}:`, error.message);
        // Don't fail assignment if code sending fails
    }

    // Record status change
    const oldStatus = isNonPartnered ? ORDER_STATUS.PENDING : ORDER_STATUS.READY;
    await OrderStatusHistory.create({
        order_id: orderId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by_type: 'admin',
        changed_by_id: null // Admin ID would be passed if available
    });

    try {
        const { emitOrderAssigned } = require('./socketEventService');
        emitOrderAssigned(orderId, {
            driver_id: driverId,
            driver_name: driver.full_name,
            driver_phone: driver.phone_number,
            order_status: newStatus
        });
    } catch (error) {
        console.error(`Failed to emit order:assigned for order ${orderId}:`, error.message);
    }

    return {
        assignment_id: assignment.assignment_id,
        order_id: orderId,
        driver_id: driverId,
        driver_name: driver.full_name,
        driver_phone: driver.phone_number,
        vehicle_type: driver.vehicle_type,
        assignment_status: 'accepted',
        message: 'Driver manually assigned and order status updated'
    };
}

/**
 * Driver accepts order from the pool (order is preparing or ready, no driver - first-come-first-served)
 * Uses transaction to prevent race when two drivers accept at once.
 * When status is 'preparing': assign driver only, keep order status preparing until restaurant marks ready.
 * When status is 'ready': assign driver and set order to picked_up.
 */
async function acceptFromPool(orderId, driverId) {
    const order = await Order.findByPk(orderId, {
        include: [
            { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'street_address', 'city'] },
            { model: Address, as: 'delivery_address', attributes: ['address_id', 'street_address', 'city'] }
        ]
    });
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }
    if (order.driver_id) {
        const err = new Error('Order already taken by another driver');
        err.statusCode = 409;
        throw err;
    }
    const allowedStatuses = [ORDER_STATUS.PREPARING, ORDER_STATUS.READY];
    if (!allowedStatuses.includes(order.order_status)) {
        const err = new Error(`Order is not available for acceptance. Status: ${order.order_status}`);
        err.statusCode = 400;
        throw err;
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver) {
        const err = new Error('Driver not found');
        err.statusCode = 404;
        throw err;
    }
    if (!driver.is_active) {
        const err = new Error('Your driver account is inactive. Contact support.');
        err.statusCode = 403;
        throw err;
    }
    if (driver.verification_status !== 'approved') {
        const err = new Error('Your account is pending approval. You can accept orders once verified.');
        err.statusCode = 403;
        throw err;
    }

    const now = new Date();
    const wasReady = order.order_status === ORDER_STATUS.READY;
    const newStatus = wasReady ? ORDER_STATUS.PICKED_UP : order.order_status;

    const t = await Order.sequelize.transaction();
    try {
        const [updated] = await Order.update(
            { driver_id: driverId, order_status: newStatus },
            { where: { order_id: orderId, driver_id: null }, transaction: t }
        );
        if (updated === 0) {
            await t.rollback();
            const err = new Error('Order already taken by another driver');
            err.statusCode = 409;
            throw err;
        }

        await DriverAssignment.create({
            order_id: orderId,
            driver_id: driverId,
            assignment_status: 'accepted',
            offered_at: now,
            responded_at: now
        }, { transaction: t });

        const restaurant = order.restaurant || await Restaurant.findByPk(order.restaurant_id);
        const address = order.delivery_address || await Address.findByPk(order.address_id);
        await Delivery.create({
            order_id: orderId,
            driver_id: driverId,
            pickup_address: restaurant ? `${restaurant.street_address}, ${restaurant.city}` : 'Restaurant Address',
            pickup_latitude: restaurant?.latitude ?? null,
            pickup_longitude: restaurant?.longitude ?? null,
            delivery_address: address ? `${address.street_address}, ${address.city}` : 'Delivery Address',
            delivery_latitude: address?.latitude ?? null,
            delivery_longitude: address?.longitude ?? null,
            distance_km: null,
            assigned_at: now,
            delivery_status: DELIVERY_STATUS.ASSIGNED
        }, { transaction: t });

        await OrderStatusHistory.create({
            order_id: orderId,
            old_status: order.order_status,
            new_status: newStatus,
            changed_by_type: 'driver',
            changed_by_id: driverId
        }, { transaction: t });

        await t.commit();
    } catch (e) {
        await t.rollback();
        throw e;
    }

    if (wasReady) {
        try {
            const { sendVerificationCode } = require('./verificationCodeService');
            await sendVerificationCode(orderId);
        } catch (error) {
            console.error(`Failed to send verification code for order ${orderId}:`, error.message);
        }
    }
    try {
        const { emitOrderAssigned, emitOrderTakenToDrivers } = require('./socketEventService');
        emitOrderAssigned(orderId, {
            driver_id: driverId,
            driver_name: driver.full_name,
            driver_phone: driver.phone_number,
            order_status: newStatus
        });
        emitOrderTakenToDrivers(orderId);
    } catch (error) {
        console.error(`Failed to emit for order ${orderId}:`, error.message);
    }

    return {
        order_id: orderId,
        driver_id: driverId,
        assignment_status: 'accepted',
        order_status: newStatus,
        message: 'Order accepted successfully'
    };
}

/**
 * Driver accepts order (pool only - no more one-driver-offer flow)
 * @param {number} orderId - Order ID
 * @param {number} driverId - Driver ID (from authenticated user)
 * @returns {Promise<Object>} Assignment details
 */
async function acceptAssignment(orderId, driverId) {
    return acceptFromPool(orderId, driverId);
}

/**
 * Driver rejects order assignment (pool flow: no re-offer; order stays in pool for others)
 * @param {number} orderId - Order ID
 * @param {number} driverId - Driver ID (from authenticated user)
 * @returns {Promise<Object>} Rejection confirmation
 */
async function rejectAssignment(orderId, driverId) {
    const assignment = await DriverAssignment.findOne({
        where: {
            order_id: orderId,
            driver_id: driverId,
            assignment_status: 'offered'
        }
    });

    if (!assignment) {
        const err = new Error('Assignment offer not found or already responded to');
        err.statusCode = 404;
        throw err;
    }

    await assignment.update({
        assignment_status: 'rejected',
        responded_at: new Date()
    });

    return {
        assignment_id: assignment.assignment_id,
        order_id: orderId,
        driver_id: driverId,
        assignment_status: 'rejected',
        message: 'Assignment rejected.'
    };
}

/**
 * Get available drivers list
 * @param {Object} filters - Optional filters (latitude, longitude, radius)
 * @returns {Promise<Array>} List of available drivers
 */
async function getAvailableDrivers(filters = {}) {
    const whereClause = {
        is_available: true,
        is_active: true,
        verification_status: 'approved'
    };

    const drivers = await Driver.findAll({
        where: whereClause,
        attributes: [
            'driver_id',
            'full_name',
            'phone_number',
            'vehicle_type',
            'current_latitude',
            'current_longitude',
            'average_rating',
            'total_deliveries',
            'is_available'
        ],
        order: [['average_rating', 'DESC'], ['total_deliveries', 'DESC']]
    });

    // If location filter provided, calculate distances
    if (filters.latitude && filters.longitude) {
        const filterLat = parseFloat(filters.latitude);
        const filterLon = parseFloat(filters.longitude);
        const radius = filters.radius || DEFAULT_DELIVERY_RADIUS_KM;

        return drivers
            .map(driver => {
                const driverLat = parseFloat(driver.current_latitude);
                const driverLon = parseFloat(driver.current_longitude);

                if (!driverLat || !driverLon) {
                    return null;
                }

                const distance = calculateDistance(filterLat, filterLon, driverLat, driverLon);
                if (distance === null || distance > radius) {
                    return null;
                }

                return {
                    ...driver.toJSON(),
                    distance_km: distance
                };
            })
            .filter(driver => driver !== null)
            .sort((a, b) => a.distance_km - b.distance_km);
    }

    return drivers.map(driver => driver.toJSON());
}

/**
 * Driver releases an order they had accepted (unassign). Order goes back to pool for other drivers.
 * @param {number} orderId - Order ID
 * @param {number} driverId - Driver ID (must be the currently assigned driver)
 * @returns {Promise<Object>} Release confirmation
 */
async function releaseAssignment(orderId, driverId) {
    const { Delivery } = require('../models');
    const order = await Order.findByPk(orderId);
    if (!order) {
        const err = new Error('Order not found');
        err.statusCode = 404;
        throw err;
    }
    if (order.driver_id !== driverId) {
        const err = new Error('You are not assigned to this order');
        err.statusCode = 403;
        throw err;
    }
    const allowedStatuses = [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.PICKED_UP, ORDER_STATUS.IN_TRANSIT];
    if (!allowedStatuses.includes(order.order_status)) {
        const err = new Error(`Order cannot be released in status: ${order.order_status}`);
        err.statusCode = 400;
        throw err;
    }

    const t = await Order.sequelize.transaction();
    try {
        const oldStatus = order.order_status;
        await order.update(
            { driver_id: null, order_status: ORDER_STATUS.READY },
            { transaction: t }
        );
        await Delivery.destroy({
            where: { order_id: orderId },
            transaction: t
        });
        await OrderStatusHistory.create({
            order_id: orderId,
            old_status: oldStatus,
            new_status: ORDER_STATUS.READY,
            changed_by_type: 'driver',
            changed_by_id: driverId
        }, { transaction: t });
        await t.commit();
    } catch (e) {
        await t.rollback();
        throw e;
    }

    try {
        const { emitOrderAvailableToDrivers } = require('./socketEventService');
        emitOrderAvailableToDrivers(orderId);
    } catch (error) {
        console.error(`Failed to emit order:available for order ${orderId}:`, error.message);
    }

    return {
        order_id: orderId,
        driver_id: driverId,
        message: 'Order released. It is back in the pool for other drivers.'
    };
}

/**
 * Check and handle expired assignments
 * Called periodically to reassign expired offers
 */
async function handleExpiredAssignments() {
    const expiredAssignments = await DriverAssignment.findAll({
        where: {
            assignment_status: 'offered'
        }
    });

    const now = new Date();
    const expired = [];

    for (const assignment of expiredAssignments) {
        const offeredAt = new Date(assignment.offered_at);
        const secondsElapsed = (now - offeredAt) / 1000;

        if (secondsElapsed > ASSIGNMENT_TIMEOUT_SECONDS) {
            await assignment.update({
                assignment_status: 'expired',
                responded_at: now
            });

            expired.push(assignment);
            // Pool flow: no re-offer; order remains in pool for drivers to accept
        }
    }

    return expired;
}

module.exports = {
    findNearestAvailableDrivers,
    autoAssignDriver,
    manualAssignDriver,
    acceptAssignment,
    rejectAssignment,
    releaseAssignment,
    getAvailableDrivers,
    handleExpiredAssignments,
    ASSIGNMENT_TIMEOUT_SECONDS
};
