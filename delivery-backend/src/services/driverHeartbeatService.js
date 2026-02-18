/**
 * Driver Heartbeat Monitor
 * 
 * Runs every 2 minutes to find drivers who haven't sent a heartbeat
 * in the last 6 minutes and marks them as INACTIVE (is_available = false).
 * 
 * This handles the case where a driver closes the app without manually
 * going INACTIVE — the system auto-detects they are gone.
 */
const { Driver } = require('../models');
const { Op } = require('sequelize');

const STALE_THRESHOLD_MINUTES = 6;
const CHECK_INTERVAL_MS = 2 * 60 * 1000; // Check every 2 minutes

let monitorInterval = null;

/**
 * Find and deactivate stale drivers (no heartbeat for 6+ minutes)
 */
async function deactivateStaleDrvers() {
    try {
        const cutoffTime = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000);

        const [updatedCount] = await Driver.update(
            { is_available: false },
            {
                where: {
                    is_available: true,
                    // Either last_seen_at is older than the cutoff, or it was never set
                    [Op.or]: [
                        { last_seen_at: { [Op.lt]: cutoffTime } },
                        { last_seen_at: null }
                    ]
                }
            }
        );

        if (updatedCount > 0) {
            console.log(`[HeartbeatMonitor] Deactivated ${updatedCount} stale driver(s) (no ping for ${STALE_THRESHOLD_MINUTES}+ minutes)`);
        }
    } catch (error) {
        console.error('[HeartbeatMonitor] Error deactivating stale drivers:', error.message);
    }
}

/**
 * Start the heartbeat monitor (called once on server startup)
 */
function startHeartbeatMonitor() {
    if (monitorInterval) return; // Already running

    console.log(`[HeartbeatMonitor] Started. Checking every 2 minutes for stale drivers (threshold: ${STALE_THRESHOLD_MINUTES} min).`);

    // Run once immediately on startup to clean up any stale drivers from a previous crash
    deactivateStaleDrvers();

    monitorInterval = setInterval(deactivateStaleDrvers, CHECK_INTERVAL_MS);
}

/**
 * Stop the heartbeat monitor (for graceful shutdown)
 */
function stopHeartbeatMonitor() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
        console.log('[HeartbeatMonitor] Stopped.');
    }
}

module.exports = { startHeartbeatMonitor, stopHeartbeatMonitor };
