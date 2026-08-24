import type { Request,Response,NextFunction } from "express";

type AsyncHandler<T extends Request = Request> = (
    req: T,
    res: Response,
    next: NextFunction
) => Promise<void>;

const catchAsync = <T extends Request = Request>(
    fn: AsyncHandler<T>
) => {
    return (
        req: T,
        res: Response,
        next: NextFunction
    ) => {
        fn(req, res, next).catch(next);
    };
};

export default catchAsync;