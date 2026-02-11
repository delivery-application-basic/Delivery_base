/**
 * Check Android build environment: JDK (JAVA_HOME) and adb (PATH).
 * Run: node scripts/check-android-env.js
 * Fixes: "No Java compiler found" and "adb is not recognized".
 */
const { execSync } = require('child_process');

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
  } catch (e) {
    return null;
  }
}

let failed = false;

console.log('Checking Android build environment...\n');

// 1. Java / JDK (Gradle needs a JDK, not just JRE)
const javaHome = process.env.JAVA_HOME;
const javaVersion = run('java -version', { stdio: ['pipe', 'pipe', 'pipe'] });
const javacExists = run('javac -version 2>&1');

if (!javaVersion) {
  console.error('ERROR: Java is not in PATH (or not installed).');
  failed = true;
} else if (!javacExists && !javaHome) {
  console.error('ERROR: No JDK found. Gradle needs a JDK (includes javac), not just a JRE.');
  console.error('  - Install JDK 17 (e.g. from https://adoptium.net/ or Oracle).');
  console.error('  - Set JAVA_HOME to the JDK folder (e.g. C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.x).');
  failed = true;
} else if (!javacExists && javaHome) {
  console.error('ERROR: JAVA_HOME is set but it does not contain a JDK (no javac).');
  console.error('  - Set JAVA_HOME to a JDK 17 install folder, not a JRE.');
  failed = true;
} else {
  console.log('OK: Java/JDK is available.');
}

// 2. adb
const adbOut = run('adb devices');
if (adbOut === null) {
  console.error('ERROR: "adb" is not recognized or not in PATH.');
  console.error('  - Add Android SDK platform-tools to your system PATH.');
  console.error('  - Typical path: C:\\Users\\<You>\\AppData\\Local\\Android\\Sdk\\platform-tools');
  failed = true;
} else {
  console.log('OK: adb is available.');
  const deviceLines = adbOut.split('\n').filter((l) => l.endsWith('device') && !l.startsWith('List'));
  if (deviceLines.length === 0) {
    console.warn('WARN: No device/emulator connected. Connect phone with USB debugging or start an emulator.');
  } else {
    console.log('OK: At least one device/emulator connected.');
  }
}

if (failed) {
  console.log('\n--- Quick fix (Windows) ---');
  console.log('1. JDK: Install JDK 17, then set JAVA_HOME in System Environment Variables to the JDK folder.');
  console.log('2. adb: Add Android SDK platform-tools to Path (e.g. C:\\Users\\<You>\\AppData\\Local\\Android\\Sdk\\platform-tools).');
  console.log('3. Restart the terminal (or IDE) after changing PATH/JAVA_HOME.');
  process.exit(1);
}

console.log('\nEnvironment OK. You can run: npm run android');
process.exit(0);
