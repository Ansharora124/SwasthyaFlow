import type { AuthObject } from '@clerk/express';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthObject | null;
  }
}


