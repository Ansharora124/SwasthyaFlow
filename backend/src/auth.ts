import type { Request } from 'express';

export function getUserId(req: Request): string | undefined {
  const auth = (req as any).auth;
  if (auth && typeof auth === 'object' && 'userId' in auth) {
    const uid = (auth as any).userId;
    if (typeof uid === 'string' && uid.length > 0) return uid;
  }
  return undefined;
}


