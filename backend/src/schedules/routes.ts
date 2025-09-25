import { Router, Request } from 'express';
import { body, param, validationResult } from 'express-validator';
import Schedule from './model';
import { getUserId } from '../auth';

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
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel schedule' });
    }
  }
);

export default router;


