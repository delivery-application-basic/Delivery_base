/**
 * USB-only Android launcher.
 * Tunnels Metro (8081) + Backend API/Socket (5000) over USB, then installs/runs.
 */
const { execSync, spawnSync } = require('child_process');

const isWindows = process.platform === 'win32';

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], shell: isWindows });
  } catch {
    return null;
  }
}

function getUsbDeviceId() {
  const out = run('adb devices');
  if (!out) return null;
  const lines = out.split('\n').map((l) => l.trim()).filter(Boolean);
  const physical = lines
    .filter((l) => l.endsWith('\tdevice') || l.endsWith(' device'))
    .map((l) => l.split(/\s/)[0])
    .filter((id) => !id.startsWith('emulator-'));
  return physical[0] || null;
}

function main() {
  const deviceId = getUsbDeviceId();
  if (!deviceId) {
    console.error('No physical Android phone detected by adb.');
    console.error('1) Connect phone by USB');
    console.error('2) Enable Developer Options + USB debugging');
    console.error('3) Accept the RSA prompt on phone');
    console.error('4) Run: adb devices (phone must show as "device")');
    process.exit(1);
  }

  console.log(`Using USB device: ${deviceId}`);

  run(`adb -s ${deviceId} reverse --remove-all`);

  // Metro bundler
  run(`adb -s ${deviceId} reverse tcp:8081 tcp:8081`);
  console.log('USB reverse: device tcp:8081 -> host tcp:8081 (Metro)');

  // Backend API + Socket.io
  run(`adb -s ${deviceId} reverse tcp:5000 tcp:5000`);
  console.log('USB reverse: device tcp:5000 -> host tcp:5000 (API + Socket)');

  const r = spawnSync(
    'npx',
    ['react-native', 'run-android', '--device', deviceId],
    { stdio: 'inherit', shell: isWindows }
  );
  process.exit(r.status ?? 0);
}

main();
