"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const model_1 = __importDefault(require("./model"));
const auth_1 = require("../auth");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const userId = (0, auth_1.getUserId)(req);
        const items = await model_1.default.find({ userId }).sort({ startTime: 1 }).lean();
        res.json({ items });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});
router.post('/', (0, express_validator_1.body)('therapistId').isString().trim().notEmpty(), (0, express_validator_1.body)('startTime').isISO8601(), (0, express_validator_1.body)('endTime').isISO8601(), (0, express_validator_1.body)('notes').optional().isString(), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    try {
        const userId = (0, auth_1.getUserId)(req);
        const { therapistId, startTime, endTime, notes } = req.body;
        const doc = await model_1.default.create({
            userId,
            therapistId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            notes,
        });
        res.status(201).json({ item: doc });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});
router.post('/:id/cancel', (0, express_validator_1.param)('id').isMongoId(), async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    try {
        const userId = (0, auth_1.getUserId)(req);
        const { id } = req.params;
        const updated = await model_1.default.findOneAndUpdate({ _id: id, userId }, { $set: { status: 'cancelled' } }, { new: true });
        if (!updated)
            return res.status(404).json({ error: 'Not found' });
        res.json({ item: updated });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to cancel schedule' });
    }
});
exports.default = router;
