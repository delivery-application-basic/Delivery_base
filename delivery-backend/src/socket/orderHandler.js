/**
 * Handles all order-related socket events
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Individual connection socket
 */
module.exports = (io, socket) => {
    // Join order room for real-time tracking
    socket.on('join:order', (orderId) => {
        const room = `order:${orderId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined order room: ${room}`);
    });

    // Handle order cancellation notifications
    socket.on('order:cancel', (data) => {
        const { orderId, reason } = data;
        io.to(`order:${orderId}`).emit('order:cancelled', {
            order_id: orderId,
            reason,
            timestamp: new Date()
        });
    });
};
