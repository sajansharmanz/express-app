import { SkinTone, User, UserIPTracking, UserStatus } from "@prisma/client";
import { Request } from "express";
import { differenceInMinutes } from "date-fns";

import { MAX_FAILED_LOGINS } from "../configs/environment";
import Logger from "../configs/logger";
import prisma from "../configs/prisma";

import {
    TResetPasswordResponse,
    TSignInRequestBody,
    TSignInUserResponse,
    TSignUpRequestBody,
    TSignUpUserResponse,
    TUpdateMeRequestBody,
    TUserForResponse,
} from "../types/user";

import { hashPassword, validatePassword } from "../utils/password";
import { decodeToken, signToken } from "../utils/token";
import { createUserObjectForResponse } from "../utils/user";

import EmailService from "./email";
import TokenService from "./token";
import TrackingService from "./tracking";
import { isLive, isTest } from "../utils/environment";

class UserService {
    public static signup = async (
        req: Request
    ): Promise<TSignUpUserResponse> => {
        try {
            Logger.debug("UserService: SignUp: Entered");
            const { email, password, deviceInfo } =
                req.body as TSignUpRequestBody;

            const hashedPassword = await hashPassword(password);

            Logger.debug("UserService: SignUp: Getting user role");
            const userRole = await prisma.role.findUnique({
                where: {
                    name: "User",
                },
            });

            const roleIdsToConnect = [];
            if (userRole) roleIdsToConnect.push({ id: userRole.id });

            Logger.debug("UserService: SignUp: Creating user");
            const user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    roles: {
                        connect: [...roleIdsToConnect],
                    },
                },
            });

            await prisma.profile.create({
                data: {
                    userId: user.id,
                    skinTone: SkinTone.NONE,
                },
            });

            Logger.debug("UserService: SignUp: Logging IP and Device Info");
            await TrackingService.logIPInfo(req.ip, user.id);
            await TrackingService.logDeviceInfo(deviceInfo, user.id);

            Logger.debug("UserService: SignUp: Sending welcome email");
            await EmailService.sendWelcome({
                toAddress: user.email,
            });

            Logger.debug("UserService: SignUp: Create token");
            const token = signToken({ userId: user.id });

            Logger.debug("UserService: SignUp: Save token");
            await TokenService.save(token, user.id);

            Logger.debug("UserService: SignUp: Clean user object");
            const userForResponse = createUserObjectForResponse(user);

            Logger.debug("UserService: SignUp: Return response object");
            return {
                user: userForResponse,
                token,
            };
        } catch (error: any) {
            Logger.debug("UserService: SignUp: Error");
            throw new Error(error);
        }
    };

    public static login = async (
        req: Request
    ): Promise<TSignInUserResponse> => {
        try {
            Logger.debug("UserService: Login: Entering");
            const { email, password, deviceInfo } =
                req.body as TSignInRequestBody;

            Logger.debug("UserService: Login: Get user");
            const user = await prisma.user.findUnique({
                where: {
                    email: email.toLowerCase(),
                },
            });

            if (!user) {
                Logger.debug("UserService: Login: No user found");

                return {
                    authError: true,
                    locked: false,
                    token: null,
                    user: null,
                };
            }

            if (user.status === UserStatus.LOCKED) {
                Logger.debug("UserService: Login: User is locked");

                return {
                    authError: true,
                    locked: true,
                    token: null,
                    user: null,
                };
            }

            Logger.debug("UserService: Login: Validating password");
            const passwordMatch = await validatePassword(
                password,
                user.password
            );

            let newFailedLoginAttempts = user.failedLoginAttempts;
            let status: UserStatus = UserStatus.ENABLED;

            if (!passwordMatch) {
                Logger.debug("UserService: Login: Passwords don't match");

                Logger.debug(
                    "UserService: Login: Calc new failed login attempts"
                );
                newFailedLoginAttempts = newFailedLoginAttempts + 1;

                if (newFailedLoginAttempts === MAX_FAILED_LOGINS) {
                    Logger.debug(
                        "UserService: Login: Set user status to locked"
                    );
                    status = UserStatus.LOCKED;

                    Logger.debug("UserService: Login: Send locked email");
                    await EmailService.sendLocked(user.email);
                }
            }

            if (passwordMatch) {
                Logger.debug("UserService: Login: Reset failed login attempts");
                newFailedLoginAttempts = 0;
            }

            Logger.debug(
                "UserService: Login: Save failed login attempt and status changes to DB"
            );
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    failedLoginAttempts: newFailedLoginAttempts,
                    status,
                },
            });

            if (!passwordMatch) {
                Logger.debug("UserService: Login: Return response object");
                return {
                    authError: true,
                    locked: status === UserStatus.LOCKED,
                    token: null,
                    user: null,
                };
            }

            Logger.debug("UserService: Login: Logging IP Info and Device Info");
            const newIP = await TrackingService.logIPInfo(req.ip, user.id);
            const newDevice = await TrackingService.logDeviceInfo(
                deviceInfo,
                user.id
            );

            if (newIP && newDevice) {
                Logger.debug(
                    "UserService: Login: Send new ip and device email"
                );
                await EmailService.sendNewIPAndDevice({
                    toAddress: user.email,
                    deviceInfo: newDevice,
                    ipInfo: newIP,
                });
            } else if (newDevice && !newIP) {
                Logger.debug("UserService: Login: Send new device email");
                await EmailService.sendNewDevice({
                    toAddress: user.email,
                    deviceInfo: newDevice,
                });
            } else if (newIP && !newDevice) {
                Logger.debug("UserService: Login: Send new ip email");
                await EmailService.sendNewIP({
                    toAddress: user.email,
                    ipInfo: newIP,
                });
            }

            Logger.debug("UserService: Login: Create token");
            const token = signToken({ userId: user.id });

            Logger.debug("UserService: Login: Save token");
            await TokenService.save(token, user.id);

            Logger.debug("UserService: Login: Clean user object");
            const userForResponse = createUserObjectForResponse(user);

            Logger.debug("UserService: Login: Return response object");
            return {
                user: userForResponse,
                token,
                authError: false,
                locked: false,
            };
        } catch (error: any) {
            Logger.debug("UserService: Login: Error");
            throw new Error(error);
        }
    };

    public static findById = async (userId: string): Promise<User | null> => {
        try {
            Logger.debug("UserService: FindById: Entering");

            Logger.debug("UserService: FindById: Returning");
            return await prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
        } catch (error: any) {
            Logger.debug("UserService: FindById: Error");
            throw new Error(error);
        }
    };

    public static deleteById = async (userId: string): Promise<void> => {
        try {
            Logger.debug("UserService: DeleteById: Entering");

            Logger.debug("UserService: DeleteById: Deleting");
            await prisma.user.delete({
                where: {
                    id: userId,
                },
            });
        } catch (error: any) {
            Logger.debug("UserService: DeleteById: Error");
            throw new Error(error);
        }
    };

    public static updateMe = async (
        req: Request
    ): Promise<TUserForResponse> => {
        try {
            Logger.debug("UserService: UpdateMe: Entering");

            const { user } = req;
            const { email, password, status } =
                req.body as TUpdateMeRequestBody;

            if (!user) {
                Logger.debug(
                    "UserService: UpdateMe: No user on request object"
                );
                throw new Error("User not found on request object");
            }

            user.email = email?.toLowerCase() ?? user.email;
            user.password = password
                ? await hashPassword(password)
                : user.password;
            user.status = (status as UserStatus) ?? user.status;

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    ...user,
                },
            });

            return createUserObjectForResponse(user);
        } catch (error: any) {
            Logger.debug("UserService: UpdateMe: Error");
            throw new Error(error);
        }
    };

    public static forgotPassword = async (
        email: string
    ): Promise<void | string> => {
        try {
            Logger.debug("UserService: ForgotPassword: Entering");

            Logger.debug("UserService: ForgotPassword: Token");
            const token = signToken({ email });

            Logger.debug("UserService: ForgotPassword: Save token");
            await prisma.user.update({
                where: {
                    email,
                },
                data: {
                    passwordResetToken: token,
                },
            });

            Logger.debug("UserService: ForgotPassword: Email");
            await EmailService.sendForgotPassword(email, token);

            if (isTest()) {
                return token;
            }
        } catch (error: any) {
            throw new Error(error);
        }
    };

    public static resetPassword = async (
        password: string,
        token: string
    ): Promise<TResetPasswordResponse> => {
        try {
            Logger.debug("UserService: ResetPassword: Entering");

            Logger.debug("UserService: ResetPassword: Token");
            const { email, iat } = decodeToken(token) as {
                email: string;
                iat: number;
            };

            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (user && user.passwordResetToken !== token) {
                return { invalidToken: true, tokenExpired: false };
            }

            if (differenceInMinutes(new Date(), new Date(iat * 1000)) >= 30) {
                return { invalidToken: false, tokenExpired: true };
            }

            const hashedPassword = await hashPassword(password);

            await prisma.user.update({
                where: {
                    email,
                },
                data: {
                    password: hashedPassword,
                    status: UserStatus.ENABLED,
                    passwordResetToken: null,
                },
            });

            return { invalidToken: false, tokenExpired: false };
        } catch (error: any) {
            throw new Error(error);
        }
    };
}

export default UserService;
