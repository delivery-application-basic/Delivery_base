/**
 * Handles all order-related socket events
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Individual connection socket
 */
module.exports = (io, socket) => {
    // Join order room for real-time tracking (accept orderId or { orderId })
    socket.on('join:order', (data) => {
        const orderId = typeof data === 'object' && data !== null ? data.orderId : data;
        if (!orderId) return;
        const room = `order:${orderId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined order room: ${room}`);
    });

    socket.on('leave:order', (data) => {
        const orderId = typeof data === 'object' && data !== null ? data.orderId : data;
        if (!orderId) return;
        const room = `order:${orderId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} left order room: ${room}`);
    });

    // Join restaurant room to receive new order notifications
    socket.on('join:restaurant', (data) => {
        const restaurantId = typeof data === 'object' && data !== null ? data.restaurantId : data;
        if (!restaurantId) return;
        const room = `restaurant:${restaurantId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined restaurant room: ${room}`);
    });
    socket.on('leave:restaurant', (data) => {
        const restaurantId = typeof data === 'object' && data !== null ? data.restaurantId : data;
        if (!restaurantId) return;
        socket.leave(`restaurant:${restaurantId}`);
    });

    // Join driver room to receive assignment offers; also join shared "drivers" room for order:taken
    socket.on('join:driver', (data) => {
        const driverId = typeof data === 'object' && data !== null ? data.driverId : data;
        if (!driverId) return;
        const room = `driver:${driverId}`;
        socket.join(room);
        socket.join('drivers');
        console.log(`Socket ${socket.id} joined driver room: ${room}`);
    });
    socket.on('leave:driver', (data) => {
        const driverId = typeof data === 'object' && data !== null ? data.driverId : data;
        if (!driverId) return;
        socket.leave(`driver:${driverId}`);
        socket.leave('drivers');
    });

    // Handle order cancellation notifications (client can emit to broadcast to order room)
    socket.on('order:cancel', (data) => {
        const { orderId, reason } = data || {};
        if (!orderId) return;
        io.to(`order:${orderId}`).emit('order:cancelled', {
            order_id: orderId,
            reason: reason || null,
            timestamp: new Date()
        });
    });
};
