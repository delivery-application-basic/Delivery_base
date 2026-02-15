/**
 * Check PC IP, database connection, and that the app can reach this server.
 * Run from backend folder: node scripts/check-connection.js
 * Then set delivery-app-mobile/src/utils/constants.js DEV_HOST to one of the IPs shown.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const os = require('os');
const { sequelize } = require('../src/config/database');

function getLocalIPs() {
  const ifaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, address: iface.address });
      }
    }
  }
  return ips;
}

async function main() {
  console.log('--- Connection check ---\n');

  const ips = getLocalIPs();
  console.log('PC IPv4 addresses (use one of these for DEV_HOST in the mobile app):');
  if (ips.length === 0) {
    console.log('  (none found; check Wi-Fi is on or run ipconfig)');
  } else {
    ips.forEach(({ name, address }) => console.log(`  ${address}  (${name})`));
  }

  const port = process.env.PORT || 5000;
  const suggested = ips.length ? ips[0].address : 'YOUR_PC_IP';
  console.log(`\nBackend URL the app should use: http://${suggested}:${port}/api/v1`);
  console.log('In delivery-app-mobile/src/utils/constants.js set: const DEV_HOST = \'' + suggested + '\';\n');

  console.log('Database connection:');
  try {
    await sequelize.authenticate();
    console.log('  OK — PostgreSQL is connected.');
  } catch (err) {
    console.log('  FAILED —', err.message);
    console.log('  Check .env: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    process.exit(1);
  }

  console.log('\n--- Run the backend with: npm start (then the app can fetch from the URL above) ---');
  process.exit(0);
}

main();
