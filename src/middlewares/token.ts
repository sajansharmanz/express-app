import { NextFunction, Request, Response } from "express";
import Logger from "../configs/logger";
import { InternalServerError, InvalidTokenError } from "../errors";
import TokenService from "../services/token";
import UserService from "../services/user";
import { decodeToken } from "../utils/token";

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        Logger.debug("VerifyToken: Entered");
        const token = req.get("Authorization")?.replace("Bearer ", "");

        if (!token) {
            Logger.debug("VerifyToken: No header token");
            return next(new InvalidTokenError());
        }

        Logger.debug("VerifyToken: Finding token in DB");
        const tokenExists = await TokenService.find(token);

        if (!tokenExists) {
            Logger.debug("VerifyToken: Token not in DB");
            return next(new InvalidTokenError());
        }

        Logger.debug("VerifyToken: Decode token");
        const data = decodeToken(token) as { userId: string; number: number };

        Logger.debug("VerifyToken: Find user");
        const user = await UserService.findById(data.userId);

        if (!user) {
            Logger.debug("VerifyToken: User not found");
            return next(new InvalidTokenError());
        }

        Logger.debug("VerifyToken: Add user and token to request");
        req.user = user;
        req.token = token;

        next();
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
};
