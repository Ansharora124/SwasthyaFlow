"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("@clerk/express");
const auth_1 = require("./auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Basic security and parsing
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use((0, cors_1.default)({ origin: allowedOrigin, credentials: true }));
// Clerk
app.use((0, express_2.clerkMiddleware)());
// Health
app.get('/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});
// Protected test route
app.get('/api/me', (0, express_2.requireAuth)(), (req, res) => {
    res.json({ userId: (0, auth_1.getUserId)(req) });
});
// Schedule routes
const routes_1 = __importDefault(require("./schedules/routes"));
app.use('/api/schedules', (0, express_2.requireAuth)(), routes_1.default);
// Start
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || '';
async function start() {
    if (!MONGODB_URI) {
        console.error('Missing MONGODB_URI');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`API listening on :${PORT}`));
    }
    catch (err) {
        console.error('Failed to start server', err);
        process.exit(1);
    }
}
start();
