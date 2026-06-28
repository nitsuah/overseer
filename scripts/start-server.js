// scripts/start-server.js
// Start the Next.js server on a dynamic port if the default is in use

const { spawn } = require('child_process');
const net = require('net');

const DEFAULT_PORT = 3000;
const MAX_PORT_ATTEMPTS = 10;

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + MAX_PORT_ATTEMPTS; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found between ${startPort} and ${startPort + MAX_PORT_ATTEMPTS - 1}`);
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen({ port }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function startServer() {
  const port = await findAvailablePort(DEFAULT_PORT);
  console.log(`Starting server on port ${port}`);

  const server = spawn('next', ['start', '-p', port], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: port }
  });

  server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

startServer().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});