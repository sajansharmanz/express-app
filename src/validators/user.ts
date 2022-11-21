import { UserStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import validator from "validator";
import Logger from "../configs/logger";

import prisma from "../configs/prisma";

import { InternalServerError, ValidationError } from "../errors";
import { TValidationErrors } from "../types/errors";
import {
    TForgotPasswordRequestBody,
    TResetPasswordRequestBody,
    TSignInRequestBody,
    TSignUpRequestBody,
    TUpdateMeRequestBody,
} from "../types/user";

const { isEmail, isStrongPassword } = validator;

class UserValidator {
    public static signup = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("UserValidator: SignUp: Entered");
        const { email, password, deviceInfo } = req.body as TSignUpRequestBody;
        const errors: TValidationErrors[] = [];

        errors.push(
            ...this.emailValidator(email),
            ...this.passwordValidator(password),
            ...this.deviceInfoValidator(deviceInfo)
        );

        if (errors.length > 0) {
            Logger.debug("UserValidator: SignUp: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        await prisma.user
            .findUnique({
                where: {
                    email,
                },
            })
            .catch((error) => {
                return next(new InternalServerError(error));
            })
            .then((user) => {
                if (user) {
                    Logger.debug(
                        "UserValidator: SignUp: User exists, throwing ValidationError"
                    );
                    return next(
                        new ValidationError([
                            {
                                message: "Email address already exists",
                                field: "email",
                            },
                        ])
                    );
                }

                Logger.debug("UserValidator: SignUp: No issues");
                next();
            });
    };

    public static login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("UserValidator: Login: Entered");
        const { email, password, deviceInfo } = req.body as TSignInRequestBody;
        const errors: TValidationErrors[] = [];

        errors.push(
            ...this.emailValidator(email),
            ...this.passwordValidator(password),
            ...this.deviceInfoValidator(deviceInfo)
        );

        if (errors.length > 0) {
            Logger.debug("UserValidator: Login: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        Logger.debug("UserValidator: Login: No issues");
        next();
    };

    public static updateMe = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("UserValidator: UpdateMe: Entered");
        const { email, password, status } = req.body as TUpdateMeRequestBody;
        const errors: TValidationErrors[] = [];

        Logger.debug("UserValidator: UpdateMe: Email");
        if (email !== undefined) {
            errors.push(...this.emailValidator(email));
        }

        Logger.debug("UserValidator: UpdateMe: Password");
        if (password !== undefined) {
            errors.push(...this.passwordValidator(password));
        }

        Logger.debug("UserValidator: UpdateMe: Status");
        if (status !== undefined) {
            errors.push(...this.statusValidator(status));
        }

        if (errors.length > 0) {
            Logger.debug("UserValidator: UpdateMe: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        await prisma.user
            .findUnique({
                where: {
                    email,
                },
            })
            .catch((error) => {
                return next(new InternalServerError(error));
            })
            .then((user) => {
                if (user) {
                    Logger.debug(
                        "UserValidator: UpdateMe: Email in use, throwing ValidationError"
                    );
                    return next(
                        new ValidationError([
                            {
                                message: "Email address already in use",
                                field: "email",
                            },
                        ])
                    );
                }

                Logger.debug("UserValidator: UpdateMe: No issues");
                next();
            });
    };

    public static forgotPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("UserValidator: ForgotPassword: Entered");

        const { email } = req.body as TForgotPasswordRequestBody;
        const errors: TValidationErrors[] = [];

        Logger.debug("UserValidator: ForgotPassword: Email");
        errors.push(...this.emailValidator(email));

        if (errors.length > 0) {
            Logger.debug(
                "UserValidator: ForgotPassword: Throwing ValidationError"
            );
            return next(new ValidationError(errors));
        }

        await prisma.user
            .findUnique({
                where: {
                    email,
                },
            })
            .catch((error) => {
                return next(new InternalServerError(error));
            })
            .then((user) => {
                if (!user) {
                    Logger.debug(
                        "UserValidator: ForgotPassword: No user found"
                    );
                    return next(
                        new ValidationError([
                            {
                                message: "No user found",
                                field: "email",
                            },
                        ])
                    );
                }

                Logger.debug("UserValidator: ForgotPassword: No issues");
                req.user = user;
                next();
            });
    };

    public static resetPassword = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("UserValidator: ResetPassword: Entered");

        const { password, token } = req.body as TResetPasswordRequestBody;
        const errors: TValidationErrors[] = [];

        Logger.debug("UserValidator: ResetPassword: Password and Token");
        errors.push(
            ...this.passwordValidator(password),
            ...this.tokenValidator(token)
        );

        if (errors.length > 0) {
            Logger.debug(
                "UserValidator: ResetPassword: Throwing ValidationError"
            );
            return next(new ValidationError(errors));
        }

        Logger.debug("UserValidator: ResetPassword: No issues");
        next();
    };

    private static emailValidator = (email: any): TValidationErrors[] => {
        Logger.debug("UserValidator: Email: Entered");
        const errors: TValidationErrors[] = [];
        const field = "email";

        if (!email) {
            Logger.debug("UserValidator: Email: Not provided");
            errors.push({ message: "Email must be provided", field });
        }

        if (typeof email !== "string") {
            Logger.debug("UserValidator: Email: Not a string");
            errors.push({
                message: "Email address must be a string",
                field,
            });

            return errors; // We return here as non-string values throw out other validators
        }

        if (!isEmail(email)) {
            Logger.debug("UserValidator: Email: Not valid email");
            errors.push({ message: "Invalid email address", field });
        }

        return errors;
    };

    private static passwordValidator = (password: any): TValidationErrors[] => {
        Logger.debug("UserValidator: Password: Entered");
        const errors: TValidationErrors[] = [];
        const field = "password";

        if (!password) {
            Logger.debug("UserValidator: Password: Not provided");
            errors.push({ message: "Password must be provided", field });
        }

        if (typeof password !== "string") {
            Logger.debug("UserValidator: Password: Not a string");
            errors.push({ message: "Password must be a string", field });

            return errors;
        }

        if (
            !isStrongPassword(password, {
                minLength: 8,
                minLowercase: 1,
                minNumbers: 1,
                minSymbols: 1,
                minUppercase: 1,
                returnScore: false,
            })
        ) {
            Logger.debug("UserValidator: Password: Not a valid password");
            errors.push({
                message: "Invalid password",
                field,
            });
        }

        return errors;
    };

    private static deviceInfoValidator = (
        deviceInfo: any
    ): TValidationErrors[] => {
        Logger.debug("UserValidator: DeviceInfo: Entered");
        const errors: TValidationErrors[] = [];
        const field = "password";

        if (!deviceInfo) {
            Logger.debug("UserValidator: DeviceInfo: Device info not provided");
            errors.push({ message: "Device info must be provided", field });
        }

        if (!deviceInfo?.model) {
            Logger.debug(
                "UserValidator: DeviceInfo: Device info model not provided"
            );
            errors.push({
                message: "Device info model must be provided",
                field,
            });
        }

        if (!deviceInfo?.platform) {
            Logger.debug(
                "UserValidator: DeviceInfo: Device info model not provided"
            );
            errors.push({
                message: "Device info platform must be provided",
                field,
            });
        }

        if (!deviceInfo?.operatingSystem) {
            Logger.debug(
                "UserValidator: DeviceInfo: Device info os not provided"
            );
            errors.push({
                message: "Device info os must be provided",
                field,
            });
        }

        if (!deviceInfo?.osVersion) {
            Logger.debug(
                "UserValidator: DeviceInfo: Device info osVersion not provided"
            );
            errors.push({
                message: "Device info osVersion must be provided",
                field,
            });
        }

        if (!deviceInfo?.manufacturer) {
            Logger.debug(
                "UserValidator: DeviceInfo: Device info manufacturer not provided"
            );
            errors.push({
                message: "Device info manufacturer must be provided",
                field,
            });
        }

        if (deviceInfo) {
            Object.keys(deviceInfo).forEach((key) => {
                if (typeof deviceInfo[key] !== "string") {
                    Logger.debug(
                        `UserValidator: DeviceInfo: Device info ${key} not a string`
                    );
                    errors.push({
                        message: `Device info ${key} must be a string`,
                    });
                }
            });
        }

        return errors;
    };

    private static statusValidator = (status: any): TValidationErrors[] => {
        Logger.debug("UserValidator: Status: Entered");
        const errors: TValidationErrors[] = [];
        const field = "status";

        if (!status) {
            Logger.debug("UserValidator: Status: Not provided");
            errors.push({ message: "Status must be provided", field });
        }

        if (typeof status !== "string") {
            Logger.debug("UserValidator: Status: Not a string");
            errors.push({ message: "Status must be a string", field });

            return errors;
        }

        const s = status as UserStatus;
        if (!Object.values(UserStatus).includes(s)) {
            Logger.debug("UserValidator: Status: Invalid status");
            errors.push({ message: "Invalid status", field });
        }

        return errors;
    };

    private static tokenValidator = (token: any): TValidationErrors[] => {
        Logger.debug("UserValidator: Token: Entered");
        const errors: TValidationErrors[] = [];
        const field = "token";

        if (!token) {
            Logger.debug("UserValidator: Token: Not provided");
            errors.push({ message: "Token must be provided", field });
        }

        if (typeof token !== "string") {
            Logger.debug("UserValidator: Token: Not a string");
            errors.push({ message: "Token must be a string", field });

            return errors;
        }

        return errors;
    };
}

export default UserValidator;
