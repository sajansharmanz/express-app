import { UserDevice, UserIPTracking } from "@prisma/client";

export type TEmailBody = {
    to: string[];
    subject: string;
    text?: string;
    html?: string;
};

export type TWelcomeEmailParams = {
    toAddress: string;
};

export type TNewIPEmailParams = {
    toAddress: string;
    ipInfo: UserIPTracking;
};

export type TNewDeviceEmailParams = {
    toAddress: string;
    deviceInfo: UserDevice;
};

export type TNewIPAndDeviceEmailParams = {
    toAddress: string;
    deviceInfo: UserDevice;
    ipInfo: UserIPTracking;
};
