// Update start-worker.js to use the exported instance
const worker = require('./workers/journey.worker');

// Start the worker
worker.start();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  worker.stop();
  process.exit(0);
});

console.log('Journey worker started. Press Ctrl+C to stop.');