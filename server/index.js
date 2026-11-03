import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import api from './api.js';
import { seedDatabase } from './seed.js';

const app = new Hono();

app.use('*', logger());

// Mount API routes
app.route('/api', api);

// Root healthcheck
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Soopi E-commerce API',
    runtime: 'Node.js',
    timestamp: new Date().toISOString()
  });
});

const PORT = Number(process.env.PORT) || 5000;

// Initialize & Seed Database if needed
seedDatabase()
  .then(() => {
    console.log(`🚀 Soopi Backend Server is starting on http://localhost:${PORT}`);
    serve({
      fetch: app.fetch,
      port: PORT
    }, (info) => {
      console.log(`✅ Soopi Server is running at http://localhost:${info.port}`);
      console.log(`📡 API Endpoints available at http://localhost:${info.port}/api`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

