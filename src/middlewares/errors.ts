import { Request, Response, NextFunction } from "express";

import { CustomError, NotFoundError } from "../errors";

import Logger from "../configs/logger";
import multer from "multer";

export const EndpointNotFoundMiddlware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    return next(
        new NotFoundError(`The request ${req.method} ${req.url} was not found`)
    );
};

export const ErrorHandler = (
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): Response => {
    Logger.error(error.stack);

    if (error instanceof CustomError) {
        return res.status(error.statusCode).send({
            errors: error.serializeErrors(),
        });
    }

    if (error instanceof multer.MulterError) {
        if (error.message === "Unexpected field") {
            return res.status(400).send({
                errors: [
                    {
                        message:
                            "An upload field was found but didn't have the name avatar",
                    },
                ],
            });
        }
    }

    return res.status(500).send({
        errors: [{ message: "Something went wrong" }],
    });
};
