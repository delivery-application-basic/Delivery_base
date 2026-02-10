const registerOrderHandlers = require('./orderHandler');
const registerDeliveryHandlers = require('./deliveryHandler');

/**
 * Main socket entry point that registers all specific handlers
 * @param {Object} io - Socket.io server instance
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // General handshake/join logic
        socket.on('join', (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined general room: ${room}`);
        });

        // Register feature-specific handlers
        registerOrderHandlers(io, socket);
        registerDeliveryHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
