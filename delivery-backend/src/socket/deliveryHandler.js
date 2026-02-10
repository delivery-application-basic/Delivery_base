/**
 * Handles all delivery-related socket events
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Individual connection socket
 */
module.exports = (io, socket) => {
    // Driver location update event (real-time)
    socket.on('driver:location-update', (data) => {
        const { orderId, latitude, longitude } = data;
        if (orderId && latitude && longitude) {
            // Broadcast to order room so customer can see the driver moving
            io.to(`order:${orderId}`).emit('delivery:location-update', {
                order_id: orderId,
                latitude,
                longitude,
                timestamp: new Date()
            });
        }
    });

    // Driver status update event
    socket.on('driver:status-update', (data) => {
        const { orderId, status } = data;
        if (orderId && status) {
            // Broadcast status (Heading to restaurant, At restaurant, etc.)
            io.to(`order:${orderId}`).emit('delivery:status-update', {
                order_id: orderId,
                status,
                timestamp: new Date()
            });
        }
    });
};
