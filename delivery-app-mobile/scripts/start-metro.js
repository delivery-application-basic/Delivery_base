/**
 * Start Metro bundler on the first available port (8081, 8082, 8083).
 * Run: npm start (uses this script)
 */
const net = require('net');
const { spawn } = require('child_process');

const PORTS = [8081, 8082, 8083];

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer((s) => s.end());
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, 'localhost');
  });
}

async function main() {
  let port = null;
  for (const p of PORTS) {
    if (await isPortFree(p)) {
      port = p;
      break;
    }
    console.warn(`Port ${p} is in use, trying next...`);
  }
  if (port === null) {
    console.error('All ports 8081, 8082, 8083 are in use. Free one or kill the process using 8081.');
    process.exit(1);
  }
  if (port !== 8081) {
    console.log(`Starting Metro on port ${port} (8081 was busy). For "npm run android", use: npm run android -- --port ${port}`);
  }
  const child = spawn('npx', ['react-native', 'start', '--port', String(port)], {
    stdio: 'inherit',
    shell: true,
    cwd: require('path').resolve(__dirname, '..'),
  });
  child.on('exit', (code) => process.exit(code != null ? code : 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
