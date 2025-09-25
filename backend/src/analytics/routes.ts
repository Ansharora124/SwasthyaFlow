import { Router, Request, Response } from 'express';
import { requireAuth } from '@clerk/express';
import { getUserId } from '../auth';
import { buildSummary, registerClient, unregisterClient, broadcastAnalytics } from './service';

const router = Router();

router.get('/summary', requireAuth(), async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const summary = await buildSummary(userId);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to build analytics summary' });
  }
});

router.get('/stream', requireAuth(), async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const userId = getUserId(req);
  registerClient(userId, res);
  broadcastAnalytics(userId); // initial payload

  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); } catch {}
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    unregisterClient(userId, res);
  });
});

export default router;
