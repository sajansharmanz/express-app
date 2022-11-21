import { NextFunction, Request, Response, Router } from "express";

import {
    AccountLockedError,
    AuthenticationError,
    GeneralError,
    InternalServerError,
    InvalidTokenError,
    PermissionError,
    ValidationError,
} from "../errors";

const router = Router();

router.get(
    "/internalservererror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new InternalServerError("Internal server error"));
    }
);

router.get(
    "/validationerror",
    (req: Request, res: Response, next: NextFunction) => {
        const errors = [{ message: "test1" }, { message: "test2" }];
        return next(new ValidationError(errors));
    }
);

router.get(
    "/authenticationerror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new AuthenticationError());
    }
);

router.get(
    "/accountlockederror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new AccountLockedError());
    }
);

router.get(
    "/invalidtokenerror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new InvalidTokenError());
    }
);

router.get(
    "/permissionerror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new PermissionError());
    }
);

router.get(
    "/generalerror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new GeneralError(500, "General error"));
    }
);

router.get(
    "/randomerror",
    (req: Request, res: Response, next: NextFunction) => {
        return next(new Error("random error"));
    }
);

export { router as dummyRoutes };
