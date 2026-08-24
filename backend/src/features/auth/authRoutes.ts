import express, { Router } from 'express';
import { signup_post, login_post, logout, refresh_post } from './authController.js';
import validate from '../../middleware/validate.js';
import { signupSchema, loginSchema } from './authSchema.js';

const router: Router = express.Router();
router.post(
    '/signup',
    validate(signupSchema),
    signup_post
);

router.post(
    "/login",
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
