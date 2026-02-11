/**
 * Check that adb is available and at least one device/emulator is connected.
 * Run: node scripts/check-android-device.js
 * Helps avoid "adb is not recognized" or "No devices" when running npm run android.
 */
const { execSync } = require('child_process');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    return null;
  }
}

console.log('Checking Android device setup...\n');

// 1. Check adb (adb devices returns output even if no devices)
const devicesOut = run('adb devices');
if (devicesOut === null) {
  console.error('ERROR: "adb" is not recognized or not in PATH.');
  console.error('Add Android SDK platform-tools to your system PATH.');
  console.error('Typical path: C:\\Users\\<You>\\AppData\\Local\\Android\\Sdk\\platform-tools');
  process.exit(1);
}
console.log('OK: adb is available.');

// 2. Check at least one device
const lines = devicesOut.split('\n').filter((l) => l.trim());
const deviceLines = lines.filter((l) => l.endsWith('device') && !l.startsWith('List'));
if (deviceLines.length === 0) {
  console.error('ERROR: No Android device or emulator connected.');
  console.error('Connect your phone via USB with USB debugging enabled, or start an emulator.');
  process.exit(1);
}
console.log('OK: At least one device/emulator connected.');
console.log('\nYou can run: npm run android');
process.exit(0);
