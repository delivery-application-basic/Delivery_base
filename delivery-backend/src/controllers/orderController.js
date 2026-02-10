const { Order, OrderItem, Address, Restaurant, Customer, Driver } = require('../models');
const orderService = require('../services/orderService');
const { getOrderTracking, getTrackingStage, emitTrackingUpdate } = require('../services/orderTrackingService');
const { USER_TYPES, ORDER_STATUS } = require('../utils/constants');

const orderIncludeCommon = [
    { model: OrderItem, as: 'items' },
    { model: Address, as: 'delivery_address', attributes: ['address_id', 'address_label', 'street_address', 'city', 'sub_city', 'landmark'] },
    { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'restaurant_name', 'phone_number', 'street_address', 'city'] }
];

/**
 * Create order from cart.
 * POST /api/v1/orders
 * Body: { address_id, payment_method, special_instructions? }
 */
exports.createOrder = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can place orders' });
        }
        const customerId = req.user.customer_id;
        const { address_id, payment_method, special_instructions } = req.body;

        const order = await orderService.createOrderFromCart(customerId, {
            address_id,
            payment_method,
            special_instructions
        });

        const fullOrder = await Order.findByPk(order.order_id, {
            include: orderIncludeCommon
        });

        return res.status(201).json({ success: true, data: fullOrder });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        next(error);
    }
};

/**
 * Get current user's orders (customer: their orders; restaurant: their orders; driver: assigned orders).
 * GET /api/v1/orders
 */
exports.getMyOrders = async (req, res, next) => {
    try {
        let where = {};
        if (req.userType === USER_TYPES.CUSTOMER) {
            where.customer_id = req.user.customer_id;
        } else if (req.userType === USER_TYPES.RESTAURANT) {
            where.restaurant_id = req.user.restaurant_id;
        } else if (req.userType === USER_TYPES.DRIVER) {
            where.driver_id = req.user.driver_id;
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized to list orders' });
        }

        const orders = await Order.findAll({
            where,
            include: orderIncludeCommon,
            order: [['order_date', 'DESC']]
        });

        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single order by id. Customer: own order; Restaurant: own restaurant order; Driver: assigned order.
 * GET /api/v1/orders/:id
 */
exports.getOrderById = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const order = await Order.findOne({
            where: { order_id: orderId },
            include: [
                ...orderIncludeCommon,
                { model: Customer, as: 'customer', attributes: ['customer_id', 'full_name', 'phone_number'] },
                { model: Driver, as: 'driver', attributes: ['driver_id', 'full_name', 'phone_number'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (req.userType === USER_TYPES.CUSTOMER && order.customer_id !== req.user.customer_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }
        if (req.userType === USER_TYPES.RESTAURANT && order.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }
        if (req.userType === USER_TYPES.DRIVER && (order.driver_id !== req.user.driver_id && order.order_status !== ORDER_STATUS.READY)) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

/**
 * Update order status. Restaurant: confirm, preparing, ready; Driver: picked_up, in_transit, delivered.
 * PATCH /api/v1/orders/:id/status
 * Body: { order_status }
 */
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { order_status } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const currentStatus = order.order_status;
        const validTransitions = {
            [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
            [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
            [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY],
            [ORDER_STATUS.READY]: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED],
            [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.IN_TRANSIT],
            [ORDER_STATUS.IN_TRANSIT]: [ORDER_STATUS.DELIVERED],
            [ORDER_STATUS.DELIVERED]: [],
            [ORDER_STATUS.CANCELLED]: []
        };

        const allowed = validTransitions[currentStatus] || [];
        if (!allowed.includes(order_status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} to ${order_status}`
            });
        }

        if (req.userType === USER_TYPES.RESTAURANT) {
            const allowedRestaurant = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY];
            if (!allowedRestaurant.includes(order_status)) {
                return res.status(403).json({ success: false, message: 'Restaurant cannot set this status' });
            }
            if (order.restaurant_id !== req.user.restaurant_id) {
                return res.status(403).json({ success: false, message: 'Not your restaurant order' });
            }
        } else if (req.userType === USER_TYPES.DRIVER) {
            const allowedDriver = [ORDER_STATUS.PICKED_UP, ORDER_STATUS.IN_TRANSIT, ORDER_STATUS.DELIVERED];
            if (!allowedDriver.includes(order_status)) {
                return res.status(403).json({ success: false, message: 'Driver cannot set this status' });
            }
            if (order.driver_id !== req.user.driver_id) {
                return res.status(403).json({ success: false, message: 'Not your assigned order' });
            }
        } else if (req.userType === USER_TYPES.CUSTOMER) {
            if (order_status !== ORDER_STATUS.CANCELLED) {
                return res.status(403).json({ success: false, message: 'Customer can only cancel, use cancel endpoint' });
            }
            if (order.customer_id !== req.user.customer_id) {
                return res.status(403).json({ success: false, message: 'Not your order' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized to update order status' });
        }

        order.order_status = order_status;
        if (order_status === ORDER_STATUS.CONFIRMED) {
            order.confirmed_at = new Date();
        }
        if (order_status === ORDER_STATUS.DELIVERED) {
            order.delivered_at = new Date();
        }
        if (order_status === ORDER_STATUS.CANCELLED) {
            order.cancelled_at = new Date();
            order.cancellation_reason = req.body.cancellation_reason || null;
        }
        await order.save();

        await orderService.recordStatusChange(
            orderId,
            currentStatus,
            order_status,
            req.userType,
            req.userType === USER_TYPES.CUSTOMER ? req.user.customer_id : req.userType === USER_TYPES.RESTAURANT ? req.user.restaurant_id : req.user.driver_id
        );

        // Auto-assign driver based on order flow type
        const isPartnered = order.order_flow_type === 'partnered';
        const isNonPartnered = order.order_flow_type === 'non_partnered';

        if (isPartnered && order_status === ORDER_STATUS.READY && !order.driver_id) {
            // Partnered: Assign when order is ready
            try {
                const { autoAssignDriver } = require('../services/driverAssignmentService');
                await autoAssignDriver(orderId);
            } catch (error) {
                console.error(`Auto-assignment failed for order ${orderId}:`, error.message);
            }
        } else if (isNonPartnered && order_status === ORDER_STATUS.PENDING && !order.driver_id) {
            // Non-Partnered: Assign immediately (driver will place order at restaurant)
            try {
                const { autoAssignDriver } = require('../services/driverAssignmentService');
                await autoAssignDriver(orderId);
            } catch (error) {
                console.error(`Auto-assignment failed for order ${orderId}:`, error.message);
            }
        }

        const updated = await Order.findByPk(orderId, { include: orderIncludeCommon });
        
        // Emit simplified tracking update
        const trackingStage = getTrackingStage(updated);
        emitTrackingUpdate(orderId, trackingStage, updated);
        
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel order (customer or restaurant within limits).
 * POST /api/v1/orders/:id/cancel
 * Body: { cancellation_reason? }
 */
exports.cancelOrder = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { cancellation_reason } = req.body || {};

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const canCancel = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(order.order_status);
        if (!canCancel) {
            return res.status(400).json({
                success: false,
                message: 'Order can only be cancelled when pending or confirmed'
            });
        }

        if (req.userType === USER_TYPES.CUSTOMER) {
            if (order.customer_id !== req.user.customer_id) {
                return res.status(403).json({ success: false, message: 'Not your order' });
            }
        } else if (req.userType === USER_TYPES.RESTAURANT) {
            if (order.restaurant_id !== req.user.restaurant_id) {
                return res.status(403).json({ success: false, message: 'Not your restaurant order' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Only customer or restaurant can cancel' });
        }

        const previousStatus = order.order_status;
        order.order_status = ORDER_STATUS.CANCELLED;
        order.cancelled_at = new Date();
        order.cancellation_reason = cancellation_reason || null;
        await order.save();

        await orderService.recordStatusChange(
            orderId,
            previousStatus,
            ORDER_STATUS.CANCELLED,
            req.userType,
            req.userType === USER_TYPES.CUSTOMER ? req.user.customer_id : req.user.restaurant_id
        );

        const updated = await Order.findByPk(orderId, { include: orderIncludeCommon });
        return res.status(200).json({ success: true, data: updated, message: 'Order cancelled' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get orders for a restaurant (restaurant owner or admin).
 * GET /api/v1/orders/restaurant/:restaurantId
 */
exports.getRestaurantOrders = async (req, res, next) => {
    try {
        const restaurantId = parseInt(req.params.restaurantId, 10);

        if (req.userType === USER_TYPES.RESTAURANT && req.user.restaurant_id !== restaurantId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this restaurant orders' });
        }

        const orders = await Order.findAll({
            where: { restaurant_id: restaurantId },
            include: orderIncludeCommon,
            order: [['order_date', 'DESC']]
        });

        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

/**
 * Get orders assigned to a driver.
 * GET /api/v1/orders/driver/:driverId
 */
exports.getDriverOrders = async (req, res, next) => {
    try {
        const driverId = parseInt(req.params.driverId, 10);

        if (req.userType === USER_TYPES.DRIVER && req.user.driver_id !== driverId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this driver orders' });
        }

        const orders = await Order.findAll({
            where: { driver_id: driverId },
            include: orderIncludeCommon,
            order: [['order_date', 'DESC']]
        });

        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

/**
 * Get order tracking information (simplified 5-stage system).
 * GET /api/v1/orders/:id/tracking
 */
exports.getOrderTracking = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        
        // Check authorization
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify user has access to this order
        if (req.userType === USER_TYPES.CUSTOMER && order.customer_id !== req.user.customer_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order tracking' });
        }
        if (req.userType === USER_TYPES.RESTAURANT && order.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order tracking' });
        }
        if (req.userType === USER_TYPES.DRIVER && order.driver_id !== req.user.driver_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order tracking' });
        }

        const tracking = await getOrderTracking(orderId);
        return res.status(200).json({ success: true, data: tracking });
    } catch (error) {
        next(error);
    }
};
