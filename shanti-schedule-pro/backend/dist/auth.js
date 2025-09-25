"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = getUserId;
function getUserId(req) {
    const auth = req.auth;
    if (auth && typeof auth === 'object' && 'userId' in auth) {
        const uid = auth.userId;
        if (typeof uid === 'string' && uid.length > 0)
            return uid;
    }
    return undefined;
}
