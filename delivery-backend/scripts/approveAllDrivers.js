/**
 * Set all existing drivers to verification_status = 'approved' and is_verified = true.
 * Run from delivery-backend: node scripts/approveAllDrivers.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const { connectDB } = require('../src/config/database');
const { Driver } = require('../src/models');

async function approveAllDrivers() {
    try {
        const [count] = await Driver.update(
            { verification_status: 'approved', is_verified: true },
            { where: {} }
        );
        console.log(`Approved ${count} driver(s).`);
    } catch (err) {
        console.error('Failed to approve drivers:', err.message);
        process.exit(1);
    } finally {
        await require('../src/models').sequelize.close();
    }
}

(async () => {
    await connectDB();
    await approveAllDrivers();
})();
