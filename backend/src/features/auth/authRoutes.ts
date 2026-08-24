import express, { Router } from 'express';
import { signup_post, login_post, logout, refresh_post } from './authController.js';
import validate from '../../middleware/validate.js';
import { signupSchema, loginSchema } from './authSchema.js';
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        message: 'Too many attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router: Router = express.Router();
router.post(
    '/signup',
    authLimiter,
    validate(signupSchema),
    signup_post
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    login_post
);

router.post(
    '/logout',
    logout
);

router.post(
    '/refresh',
    refresh_post
);

export default router;
