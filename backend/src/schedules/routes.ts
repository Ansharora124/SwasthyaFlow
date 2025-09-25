import { Router, Request } from 'express';
import { body, param, validationResult } from 'express-validator';
import { requireAuth } from '@clerk/express';
import Schedule from './model';
import { getUserId } from '../auth';
import { broadcastAnalytics } from '../analytics/service';

const router = Router();

router.get('/', async (req: Request, res) => {
  try {
    const userId = getUserId(req);
    const items = await Schedule.find({ userId }).sort({ startTime: 1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

router.post(
  '/',
  body('therapistId').isString().trim().notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('notes').optional().isString(),
  async (req: Request, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const userId = getUserId(req);
      const { therapistId, startTime, endTime, notes } = req.body;
      const doc = await Schedule.create({
        userId,
        therapistId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
      });
  res.status(201).json({ item: doc });
  if (userId) broadcastAnalytics(userId).catch(() => {});
    } catch (err) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }
);

router.post(
  '/:id/cancel',
  param('id').isMongoId(),
  async (req: Request, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const updated = await Schedule.findOneAndUpdate(
        { _id: id, userId },
        { $set: { status: 'cancelled' } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json({ item: updated });
  if (userId) broadcastAnalytics(userId).catch(() => {});
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel schedule' });
    }
  }
);

// Add a test route for demonstration (optional - remove in production)
router.post('/test-data', requireAuth(), async (req: Request, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const now = new Date();
    const testData = [];

    // Create sample sessions for today with different statuses
    for (let i = 0; i < 10; i++) {
      const startTime = new Date(now);
      startTime.setHours(9 + i, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const statuses = ['scheduled', 'completed', 'cancelled'];
      const therapies = ['Abhyanga', 'Shirodhara', 'Swedana', 'Nasya', 'Panchakarma'];
      const patients = ['Patient-A', 'Patient-B', 'Patient-C', 'Patient-D', 'Patient-E'];
      
      const doc = await Schedule.create({
        userId,
        therapistId: patients[i % patients.length],
        startTime,
        endTime,
        notes: therapies[i % therapies.length],
        status: statuses[i % 3]
      });
      testData.push(doc);
    }

    res.json({ message: 'Test data created', count: testData.length });
    if (userId) broadcastAnalytics(userId).catch(() => {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to create test data' });
  }
});

export default router;


