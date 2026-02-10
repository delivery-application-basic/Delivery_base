const {
    getDeliveryDetails,
    updateDriverLocation,
    updateDeliveryStatus,
    uploadDeliveryProof,
    getDeliveryRoute
} = require('../services/deliveryTrackingService');
const { USER_TYPES } = require('../utils/constants');

/**
 * Get delivery details by order ID
 * GET /api/v1/deliveries/:orderId
 * Access: Customer (their orders), Restaurant (their orders), Driver (assigned deliveries), Admin
 */
exports.getDeliveryDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userType = req.userType;
        const userId = req.user[`${userType}_id`];

        const delivery = await getDeliveryDetails(parseInt(orderId));

        // Authorization check
        if (userType === USER_TYPES.CUSTOMER) {
            const { Order } = require('../models');
            const order = await Order.findByPk(orderId);
            if (!order || order.customer_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your own order deliveries'
                });
            }
        } else if (userType === USER_TYPES.RESTAURANT) {
            const { Order } = require('../models');
            const order = await Order.findByPk(orderId);
            if (!order || order.restaurant_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view deliveries for your restaurant orders'
                });
            }
        } else if (userType === USER_TYPES.DRIVER) {
            if (delivery.driver_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your assigned deliveries'
                });
            }
        }
        // Admin can view all deliveries

        res.status(200).json({
            success: true,
            data: delivery
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get delivery details'
        });
    }
};

/**
 * Update driver location
 * PATCH /api/v1/deliveries/:id/location
 * Access: Driver only
 */
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude } = req.body;
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'latitude and longitude are required'
            });
        }

        const result = await updateDriverLocation(
            parseInt(id),
            driverId,
            parseFloat(latitude),
            parseFloat(longitude)
        );

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update location'
        });
    }
};

/**
 * Update delivery status
 * PATCH /api/v1/deliveries/:id/status
 * Access: Driver only
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'status is required'
            });
        }

        const result = await updateDeliveryStatus(parseInt(id), driverId, status);

        res.status(200).json({
            success: true,
            message: 'Delivery status updated successfully',
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update delivery status'
        });
    }
};

/**
 * Upload delivery proof
 * POST /api/v1/deliveries/:id/proof
 * Access: Driver only
 */
exports.uploadProof = async (req, res) => {
    try {
        const { id } = req.params;
        const { proof_url } = req.body;
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        if (!proof_url) {
            return res.status(400).json({
                success: false,
                message: 'proof_url is required'
            });
        }

        const result = await uploadDeliveryProof(parseInt(id), driverId, proof_url);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to upload delivery proof'
        });
    }
};

/**
 * Get delivery route (for map display)
 * GET /api/v1/deliveries/:orderId/route
 * Access: Customer, Restaurant, Driver, Admin
 */
exports.getRoute = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userType = req.userType;
        const userId = req.user[`${userType}_id`];

        // Authorization check (same as getDeliveryDetails)
        if (userType === USER_TYPES.CUSTOMER) {
            const { Order } = require('../models');
            const order = await Order.findByPk(orderId);
            if (!order || order.customer_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view routes for your own orders'
                });
            }
        } else if (userType === USER_TYPES.RESTAURANT) {
            const { Order } = require('../models');
            const order = await Order.findByPk(orderId);
            if (!order || order.restaurant_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view routes for your restaurant orders'
                });
            }
        } else if (userType === USER_TYPES.DRIVER) {
            const { Delivery } = require('../models');
            const delivery = await Delivery.findOne({ where: { order_id: orderId } });
            if (!delivery || delivery.driver_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view routes for your assigned deliveries'
                });
            }
        }

        const route = await getDeliveryRoute(parseInt(orderId));

        res.status(200).json({
            success: true,
            data: route
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get delivery route'
        });
    }
};
