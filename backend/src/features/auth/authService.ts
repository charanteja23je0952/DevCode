import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import type { UserDocument } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import appError from '../../utils/appError.js';

export interface authResponce{
    user: UserDocument;
    accessToken: string;
    refreshToken: string;
}

export type JwtIdPayload = {
    id: string;
};

const createAccessToken = (id: string): string => {
    const secret = process.env.ACCESS_SECRET;
    if (!secret) throw new appError('Server configuration error', 500);
    return jwt.sign(
        { id },
        secret,
        {
            expiresIn: '15m'
        }
    );
};

const createRefreshToken = (id: string): string => {
    const secret = process.env.REFRESH_SECRET;
    if (!secret) throw new appError('Server configuration error', 500);
    return jwt.sign(
        { id },
        secret,
        {
            expiresIn: '30d'
        }
    );
};

const signup = async (email: string, password: string): Promise<authResponce> => {
    const user = await User.create({
        email,
        password
    });
    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    return {
        user,
        accessToken,
        refreshToken
    };
};

const login = async (email: string, password: string): Promise<authResponce> => {
    const user = await User.findOne({ email });
    if (!user) throw new appError('Email not registered', 401);
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new appError('Incorrect password', 401);
    const accessToken = createAccessToken(user._id.toString());
    const refreshToken = createRefreshToken(user._id.toString());
    return {
        user,
        accessToken,
        refreshToken
    };
};

const refresh = async (refreshToken: string): Promise<{ accessToken: string; user: UserDocument }> => {
    const secret = process.env.REFRESH_SECRET;
    if (!secret) throw new appError('Server configuration error', 500);
    const payload = jwt.verify(
        refreshToken,
        secret
    ) as JwtIdPayload;
    const user = await User.findById(payload.id);
    if (!user) throw new appError('User not found', 401);
    const accessToken = createAccessToken(payload.id);
    return {
        accessToken,
        user
    };
};

export { signup, login, refresh };
