import express, { Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import { getUserId } from './auth';

dotenv.config();

const app = express();

// Basic security and parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Clerk
app.use(clerkMiddleware());

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Protected test route
app.get('/api/me', requireAuth(), (req: Request, res) => {
  res.json({ userId: getUserId(req) });
});

// Schedule routes
import scheduleRouter from './schedules/routes';
app.use('/api/schedules', requireAuth(), scheduleRouter);

// Start
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || '';

async function start() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


