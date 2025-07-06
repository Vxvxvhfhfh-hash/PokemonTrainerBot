import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  serveStatic(app);
}

// Register API routes
registerRoutes(app);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}