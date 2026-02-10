const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join order room for delivery tracking
        socket.on('join', (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
        });

        // Join order room specifically for delivery tracking
        socket.on('join:order', (orderId) => {
            const room = `order:${orderId}`;
            socket.join(room);
            console.log(`Socket ${socket.id} joined order room: ${room}`);
        });

        // Driver location update event (real-time)
        socket.on('driver:location-update', (data) => {
            const { orderId, latitude, longitude } = data;
            if (orderId && latitude && longitude) {
                // Broadcast to order room
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
                // Broadcast to order room
                io.to(`order:${orderId}`).emit('delivery:status-update', {
                    order_id: orderId,
                    status,
                    timestamp: new Date()
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIO };
