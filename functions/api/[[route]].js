import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import api from '../../server/api.js';

const app = new Hono().basePath('/api');
app.route('/', api);

export const onRequest = handle(app);

