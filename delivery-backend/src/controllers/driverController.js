const {
    autoAssignDriver,
    manualAssignDriver,
    acceptAssignment,
    rejectAssignment,
    getAvailableDrivers,
    handleExpiredAssignments
} = require('../services/driverAssignmentService');
const { Driver, Order, DriverAssignment, Restaurant, Address } = require('../models');
const { USER_TYPES } = require('../utils/constants');

/**
 * Auto-assign driver to order
 * POST /api/v1/drivers/assign
 * Access: Admin, Restaurant
 */
exports.autoAssign = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: 'order_id is required'
            });
        }

        const result = await autoAssignDriver(order_id);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to assign driver'
        });
    }
};

/**
 * Manual assignment by admin
 * POST /api/v1/drivers/assign/manual
 * Access: Admin only
 */
exports.manualAssign = async (req, res) => {
    try {
        const { order_id, driver_id } = req.body;

        if (!order_id || !driver_id) {
            return res.status(400).json({
                success: false,
                message: 'order_id and driver_id are required'
            });
        }

        const result = await manualAssignDriver(order_id, driver_id);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to manually assign driver'
        });
    }
};

/**
 * Driver accepts order assignment
 * POST /api/v1/drivers/accept/:orderId
 * Access: Driver only
 */
exports.acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const driverId = req.user.driver_id; // From authenticated driver

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        const result = await acceptAssignment(parseInt(orderId), driverId);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to accept assignment'
        });
    }
};

/**
 * Driver rejects order assignment
 * POST /api/v1/drivers/reject/:orderId
 * Access: Driver only
 */
exports.rejectOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const driverId = req.user.driver_id; // From authenticated driver

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        const result = await rejectAssignment(parseInt(orderId), driverId);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to reject assignment'
        });
    }
};

/**
 * Toggle driver availability
 * PATCH /api/v1/drivers/availability
 * Access: Driver only
 */
exports.toggleAvailability = async (req, res) => {
    try {
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        const driver = await Driver.findByPk(driverId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Toggle availability
        const newAvailability = !driver.is_available;
        await driver.update({ is_available: newAvailability });

        res.status(200).json({
            success: true,
            message: `Driver availability ${newAvailability ? 'enabled' : 'disabled'}`,
            data: {
                driver_id: driverId,
                is_available: newAvailability
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to toggle availability'
        });
    }
};

/**
 * Get available drivers
 * GET /api/v1/drivers/available
 * Access: Admin, Restaurant
 */
exports.getAvailableDrivers = async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.query;

        const filters = {};
        if (latitude && longitude) {
            filters.latitude = latitude;
            filters.longitude = longitude;
            if (radius) {
                filters.radius = parseFloat(radius);
            }
        }

        const drivers = await getAvailableDrivers(filters);

        res.status(200).json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get available drivers'
        });
    }
};

/**
 * Get driver's pending assignments
 * GET /api/v1/drivers/assignments/pending
 * Access: Driver only
 */
exports.getPendingAssignments = async (req, res) => {
    try {
        const driverId = req.user.driver_id;

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        const assignments = await DriverAssignment.findAll({
            where: {
                driver_id: driverId,
                assignment_status: 'offered'
            },
            include: [
                {
                    model: Order,
                    attributes: [
                        'order_id',
                        'order_status',
                        'total_amount',
                        'delivery_fee',
                        'order_date'
                    ],
                    include: [
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            attributes: ['restaurant_id', 'restaurant_name', 'street_address', 'city']
                        },
                        {
                            model: Address,
                            as: 'delivery_address',
                            attributes: ['address_id', 'street_address', 'city', 'sub_city']
                        }
                    ]
                }
            ],
            order: [['offered_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get pending assignments'
        });
    }
};

/**
 * Get driver's assignment history
 * GET /api/v1/drivers/assignments
 * Access: Driver only
 */
exports.getAssignmentHistory = async (req, res) => {
    try {
        const driverId = req.user.driver_id;
        const { status } = req.query; // Optional filter: 'accepted', 'rejected', 'expired'

        if (!driverId) {
            return res.status(401).json({
                success: false,
                message: 'Driver authentication required'
            });
        }

        const whereClause = { driver_id: driverId };
        if (status) {
            whereClause.assignment_status = status;
        }

        const assignments = await DriverAssignment.findAll({
            where: whereClause,
            include: [
                {
                    model: Order,
                    attributes: [
                        'order_id',
                        'order_status',
                        'total_amount',
                        'delivery_fee',
                        'order_date'
                    ]
                }
            ],
            order: [['offered_at', 'DESC']],
            limit: 50
        });

        res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to get assignment history'
        });
    }
};

/**
 * Handle expired assignments (cron job endpoint)
 * POST /api/v1/drivers/assignments/expired
 * Access: Admin only (or system cron)
 */
exports.handleExpiredAssignments = async (req, res) => {
    try {
        const expired = await handleExpiredAssignments();

        res.status(200).json({
            success: true,
            message: `Processed ${expired.length} expired assignments`,
            data: {
                expired_count: expired.length,
                expired_assignments: expired.map(a => ({
                    assignment_id: a.assignment_id,
                    order_id: a.order_id,
                    driver_id: a.driver_id
                }))
            }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to handle expired assignments'
        });
    }
};
