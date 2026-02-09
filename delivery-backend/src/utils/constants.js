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
        FAILED: 'failed',
        REFUNDED: 'refunded'
    }
};
