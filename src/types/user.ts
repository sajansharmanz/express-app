import { UserStatus } from "@prisma/client";
import { TDeviceInfo } from "./tracking";

export type TSignUpRequestBody = {
    email: string;
    password: string;
    deviceInfo: TDeviceInfo;
};

export type TSignInRequestBody = TSignUpRequestBody;

export type TUserForResponse = {
    id: string;
    email: string;
    failedLoginAttempts: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

export type TSignUpUserResponse = {
    user: TUserForResponse;
    token: string;
};

export type TSignInUserResponse = {
    user: TUserForResponse | null;
    token: string | null;
    authError: boolean;
    locked: boolean;
};

export type TUpdateMeRequestBody = {
    email?: string;
    password?: string;
    status?: UserStatus;
};

export type TForgotPasswordRequestBody = {
    email: string;
};

export type TResetPasswordRequestBody = {
    password: string;
    token: string;
};

export type TResetPasswordResponse = {
    invalidToken: boolean;
    tokenExpired: boolean;
};
