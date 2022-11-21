import { NextFunction, Request, Response } from "express";
import Logger from "../configs/logger";

import {
    AccountLockedError,
    AuthenticationError,
    InternalServerError,
    ValidationError,
} from "../errors";
import TokenService from "../services/token";

import UserService from "../services/user";
import { TResetPasswordRequestBody } from "../types/user";
import { isTest } from "../utils/environment";
import { createUserObjectForResponse } from "../utils/user";

class UserController {
    public static signUp = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: SignUp: Entered");
            const { user, token } = await UserService.signup(req);

            Logger.debug("UserController: SignUp: Sending Response");
            return res.status(201).send({ user, token });
        } catch (error: any) {
            Logger.debug("UserController: SignUp: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: Login: Entered");
            const { user, token, authError, locked } = await UserService.login(
                req
            );

            if (authError) {
                if (locked) {
                    Logger.debug("UserController: Login: Auth error - locked");
                    return next(new AccountLockedError());
                }

                Logger.debug("UserController: Login: Auth error");
                return next(new AuthenticationError());
            }

            Logger.debug("UserController: Login: Sending Response");
            return res.status(200).send({ user, token });
        } catch (error: any) {
            Logger.debug("UserController: Login: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static logout = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: Logout: Entered");

            const { token } = req;

            if (!token) {
                Logger.debug("UserController: Logout: No token");
                return next(
                    new InternalServerError("Token not found on request object")
                );
            }

            Logger.debug("UserController: Logout: Delete token");
            await TokenService.delete(token);

            Logger.debug("UserController: Logout: Sending Response");
            res.status(204).send();
        } catch (error: any) {
            Logger.debug("UserController: Logout: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static logoutAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: LogoutAll: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("UserController: LogoutAll: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("UserController: LogoutAll: Delete all tokens");
            await TokenService.deleteAll(user.id);

            Logger.debug("UserController: LogoutAll: Sending successful");
            res.status(204).send();
        } catch (error: any) {
            Logger.debug("UserController: LogoutAll: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static findMe = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: FindMe: Entered");

            const { user, token } = req;

            if (!user) {
                Logger.debug("UserController: FindMe: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            if (!token) {
                Logger.debug("UserController: FindMe: No token");
                return next(
                    new InternalServerError("Token not found on request object")
                );
            }

            Logger.debug("UserController: FindMe: Sending Response");
            return res
                .status(200)
                .send({ user: createUserObjectForResponse(user), token });
        } catch (error: any) {
            Logger.debug("UserController: FindMe: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static deleteMe = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: DeleteMe: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("UserController: DeleteMe: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("UserController: DeleteMe: Delete user");
            await UserService.deleteById(user.id);

            Logger.debug("UserController: DeleteMe: Sending Response");
            return res.status(204).send();
        } catch (error: any) {
            Logger.debug("UserController: DeleteMe: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static updateMe = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: UpdateMe: Entered");

            const { token } = req;

            if (!token) {
                Logger.debug("UserController: UpdateMe: No token");
                return next(
                    new InternalServerError("Token not found on request object")
                );
            }

            Logger.debug("UserController: UpdateMe: Update user");
            const user = await UserService.updateMe(req);

            Logger.debug("UserController: UpdateMe: Sending Response");
            return res.status(200).send({ user, token });
        } catch (error: any) {
            Logger.debug("UserController: UpdateMe: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static forgotPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: ForgotPassword: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("UserController: ForgotPassword: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("UserController: ForgotPassword: Forgot Password");
            const token = await UserService.forgotPassword(user.email);

            Logger.debug("UserController: ForgotPassword: Sending Response");
            if (isTest()) {
                return res.status(200).send({
                    token,
                });
            }

            return res.status(204).send();
        } catch (error: any) {
            Logger.debug("UserController: ForgotPassword: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static resetPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("UserController: ResetPassword: Entered");

            const { password, token } = req.body as TResetPasswordRequestBody;

            const { invalidToken, tokenExpired } =
                await UserService.resetPassword(password, token);

            if (invalidToken) {
                return next(
                    new ValidationError([
                        { message: "Invalid token", field: "token" },
                    ])
                );
            }

            if (tokenExpired) {
                return next(
                    new ValidationError([
                        { message: "Token expired", field: "token" },
                    ])
                );
            }

            Logger.debug("UserController: ResetPassword: Sending Response");
            return res.status(204).send();
        } catch (error: any) {
            Logger.debug("UserController: ResetPassword: Server Error");
            return next(new InternalServerError(error));
        }
    };
}

export default UserController;
