import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import api from './api.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();
app.use('*', logger());
app.route('/api', api);

const BACKEND_PORT = 5000;

async function start() {
  await seedDatabase();

  serve({
    fetch: app.fetch,
    port: BACKEND_PORT,
  }, (info) => {
    console.log(`\n======================================================`);
    console.log(`🚀 Soopi Backend API Server is running on: http://localhost:${info.port}`);
    console.log(`======================================================\n`);
  });

  // Launch Vite dev server using direct local node_modules path
  const vitePath = path.resolve(__dirname, '../node_modules/vite/bin/vite.js');
  const viteProcess = spawn(process.execPath, [vitePath, '--port', '3000', '--host'], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });

  viteProcess.on('error', (err) => {
    console.error('Error starting Vite client:', err);
  });

  const cleanup = () => {
    viteProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

start().catch(console.error);
