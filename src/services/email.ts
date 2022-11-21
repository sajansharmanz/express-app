import NodemailerService from "./nodemailer";

import {
    TNewDeviceEmailParams,
    TNewIPAndDeviceEmailParams,
    TNewIPEmailParams,
    TWelcomeEmailParams,
} from "../types/email";

class EmailService {
    public static sendWelcome = async (params: TWelcomeEmailParams) => {
        await NodemailerService.sendWelcome(params);
    };

    public static sendNewIP = async (params: TNewIPEmailParams) => {
        await NodemailerService.sendNewIP(params);
    };

    public static sendNewDevice = async (params: TNewDeviceEmailParams) => {
        await NodemailerService.sendNewDevice(params);
    };

    public static sendNewIPAndDevice = async (
        params: TNewIPAndDeviceEmailParams
    ) => {
        await NodemailerService.sendNewIPAndDevice(params);
    };

    public static sendLocked = async (toAddress: string) => {
        await NodemailerService.sendLocked(toAddress);
    };

    public static sendForgotPassword = async (email: string, token: string) => {
        await NodemailerService.sendForgotPassword(email, token);
    };
}

export default EmailService;
