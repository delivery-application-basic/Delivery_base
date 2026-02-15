const app = require('./src/app');
const http = require('http');
const { connectDB } = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
require('dotenv').config();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} (accepting connections on all interfaces)`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
