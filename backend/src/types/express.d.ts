import type { Types } from 'mongoose';

declare module 'express-serve-static-core' {
    interface Request {
        userId?: Types.ObjectId;
    }
}

export {};