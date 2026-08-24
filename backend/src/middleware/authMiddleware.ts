import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import appError from '../utils/appError.js';
import { Types } from 'mongoose';

const require_auth = catchAsync(async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) return next(new appError('Authentication required', 401));
    const secret = process.env.ACCESS_SECRET;
    if (!secret) return next(new appError('Server configuration error', 500));
    const decoded = jwt.verify(token, secret) as any;
    req.userId = new Types.ObjectId(decoded.id);
    next();
});
export { require_auth };
