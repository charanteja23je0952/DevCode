import type { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync.js';
import { signup, login, refresh, guest } from './authService.js';
import { ok } from '../../utils/response.js';
import appError from '../../utils/appError.js';
import type { SignupBody, LoginBody } from './authSchema.js';

const isProd = process.env.NODE_ENV === 'production';

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: isProd, 
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: maxAge,
    path: '/',
});

const clearCookieOptions = () => ({
    path: '/',
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProd,
});

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export const signup_post = catchAsync(async (
    req: Request<{}, {}, SignupBody>,
    res: Response
) => {
    const { email, password } = req.body;
    const result = await signup(email, password);
    res.cookie('accessToken', result.accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie('refreshToken', result.refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));
    ok(res, "Account created", {
        id: result.user._id
    }, 201);
});

export const login_post = catchAsync(async (
    req: Request<{}, {}, LoginBody>,
    res: Response
) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.cookie('accessToken', result.accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie('refreshToken', result.refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));
    ok(res, "Login successful", {
        id: result.user._id
    });
});

export const logout = (req: Request, res: Response) => {
    res.clearCookie('accessToken', clearCookieOptions());
    res.clearCookie('refreshToken', clearCookieOptions());
    ok(res, "Logged out");
};

export const refresh_post = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new appError(
            "Refresh token missing",
            401
        );
    }
    const result = await refresh(refreshToken);
    res.cookie('accessToken', result.accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
    ok(res, "Token refreshed", {
        id: result.user._id
    });
});

export const guest_post = catchAsync(async (req: Request, res: Response) => {
    const result = await guest();
    res.cookie('accessToken', result.accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie('refreshToken', result.refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));
    ok(res, "Guest login successful", {
        id: result.user._id
    });
});