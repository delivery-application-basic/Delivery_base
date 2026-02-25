const app = require('./src/app');
const http = require('http');
const os = require('os');
const { connectDB } = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
const { startHeartbeatMonitor, stopHeartbeatMonitor } = require('./src/services/driverHeartbeatService');
require('dotenv').config();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, '0.0.0.0', () => {
            const host = (function getLocalIP() {
                const ifaces = os.networkInterfaces();
                for (const name of Object.keys(ifaces)) {
                    for (const iface of ifaces[name]) {
                        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
                    }
                }
                return 'localhost';
            })();
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} (accepting connections on all interfaces)`);
            console.log(`  Local:   http://localhost:${PORT}`);
            console.log(`  Network: http://${host}:${PORT} (use this IP in the mobile app when on same Wi-Fi)`);
        });

        // Start the driver heartbeat monitor (auto-deactivates stale drivers)
        startHeartbeatMonitor();

        // Graceful shutdown
        process.on('SIGTERM', () => {
            stopHeartbeatMonitor();
            server.close();
        });
        process.on('SIGINT', () => {
            stopHeartbeatMonitor();
            server.close();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();
