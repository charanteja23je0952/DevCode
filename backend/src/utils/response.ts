import type { Response } from 'express';

const ok = (
    res: Response,
    message: string,
    data: any = null,
    status: number = 200
): void => {
    res.status(status).json({
        success: true,
        message,
        data,
    });
};

const fail = (
    res: Response,
    message: string,
    status: number,
    data: any = null
): void => {
    res.status(status).json({
        success: false,
        message,
        data,
    });
};

export { ok, fail };
