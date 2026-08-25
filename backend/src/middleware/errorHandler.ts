import type { ErrorRequestHandler } from "express";
import appError from "../utils/appError.js";
import { fail } from "../utils/response.js";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    if (err instanceof appError) {
        return fail(res, err.message, err.statusCode);
    }
    if (err instanceof Error) {
        if (err.name === "JsonWebTokenError") {
            return fail(res, "Invalid token", 401);
        }
        if (err.name === "TokenExpiredError") {
            return fail(res, "Token expired", 401);
        }
        if (err.name === "ValidationError") {
            const validationError = err as any;
            const errors = Object.values(validationError.errors).map(
                (e: any) => e.message
            );
            return fail(res, errors.join(", "), 400);
        }
        if (err.name === "CastError") {
            return fail(res, "Invalid ID format", 400);
        }
    }
    if(typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
        return fail(res, "Email already exists", 400);
    }
    return fail(res, "Something went wrong", 500);
};

export default errorHandler;