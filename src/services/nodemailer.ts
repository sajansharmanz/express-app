import { createTransport, createTestAccount } from "nodemailer";
import {
    NODEMAILER_HOST,
    NODEMAILER_PASSWORD,
    NODEMAILER_PORT,
    NODEMAILER_SEND_FROM,
    NODEMAILER_USERNAME,
    PLATFORM_NAME,
} from "../configs/environment";
import {
    TNewDeviceEmailParams,
    TNewIPAndDeviceEmailParams,
    TNewIPEmailParams,
    TWelcomeEmailParams,
} from "../types/email";
import { generateWelcomeEmailTemplate } from "../templates/email/welcome";
import { isTest } from "../utils/environment";
import { generateNewIPEmailTemplate } from "../templates/email/newIP";
import { generateNewDeviceEmailTemplate } from "../templates/email/newDevice";
import { generateNewIPAndDeviceEmailTemplate } from "../templates/email/newIPAndDevice";
import { generateAccountLockedTemplate } from "../templates/email/accountLocked";
import Logger from "../configs/logger";
import { generateForgotPasswordTemplate } from "../templates/email/forgotPassword";

class NodemailerService {
    private static createTransport = async () => {
        const testAcc = await createTestAccount();
        const host = isTest() ? "smtp.ethereal.email" : NODEMAILER_HOST;
        const port = isTest() ? 587 : NODEMAILER_PORT;
        const secure = isTest() ? false : NODEMAILER_PORT === 465;
        const user = isTest() ? testAcc.user : NODEMAILER_USERNAME;
        const pass = isTest() ? testAcc.pass : NODEMAILER_PASSWORD;

        return createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        });
    };

    public static sendWelcome = async (params: TWelcomeEmailParams) => {
        Logger.debug("NodemailerService: SendWelcome: Entered");
        try {
            Logger.debug("NodemailerService: SendWelcome: Create transport");
            const transport = await this.createTransport();

            const { toAddress } = params;

            Logger.debug("NodemailerService: SendWelcome: Generate template");
            const html = generateWelcomeEmailTemplate();

            Logger.debug("NodemailerService: SendWelcome: Send email");
            await transport.sendMail({
                from: NODEMAILER_SEND_FROM,
                to: toAddress,
                subject: `Welcome To ${PLATFORM_NAME}`,
                html,
            });
        } catch (error: any) {
            Logger.debug("NodemailerService: SendWelcome: Error sending email");
            throw new Error(error);
        }
    };

    public static sendNewIP = async (params: TNewIPEmailParams) => {
        try {
            Logger.debug("NodemailerService: SendNewIP: Entered");

            Logger.debug("NodemailerService: SendNewIP: Creating transport");
            const transport = await this.createTransport();
            const { toAddress, ipInfo } = params;

            Logger.debug("NodemailerService: SendNewIP: Generate template");
            const html = generateNewIPEmailTemplate(ipInfo);

            Logger.debug("NodemailerService: SendNewIP: Send email");
            await transport.sendMail({
                from: NODEMAILER_SEND_FROM,
                to: toAddress,
                subject: `New login identified`,
                html,
            });
        } catch (error: any) {
            Logger.debug("NodemailerService: SendNewIP: Error sending email");
            throw new Error(error);
        }
    };

    public static sendNewDevice = async (params: TNewDeviceEmailParams) => {
        try {
            Logger.debug("NodemailerService: SendNewDevice: Entered");

            Logger.debug("NodemailerService: SendNewDevice: Create transport");
            const transport = await this.createTransport();
            const { toAddress, deviceInfo } = params;

            Logger.debug("NodemailerService: SendNewDevice: Generate template");
            const html = generateNewDeviceEmailTemplate(deviceInfo);

            Logger.debug("NodemailerService: SendNewDevice: Send email");
            await transport.sendMail({
                from: NODEMAILER_SEND_FROM,
                to: toAddress,
                subject: `New login identified`,
                html,
            });
        } catch (error: any) {
            Logger.debug(
                "NodemailerService: SendNewDevice: Error sending email"
            );
            throw new Error(error);
        }
    };

    public static sendNewIPAndDevice = async (
        params: TNewIPAndDeviceEmailParams
    ) => {
        try {
            Logger.debug("NodemailerService: SendNewIPAndDevice: Entered");

            Logger.debug(
                "NodemailerService: SendNewIPAndDevice: Creating transport"
            );
            const transport = await this.createTransport();
            const { toAddress, deviceInfo, ipInfo } = params;

            Logger.debug(
                "NodemailerService: SendNewIPAndDevice: Generate template"
            );
            const html = generateNewIPAndDeviceEmailTemplate(
                deviceInfo,
                ipInfo
            );

            Logger.debug("NodemailerService: SendNewIPAndDevice: Send email");
            await transport.sendMail({
                from: NODEMAILER_SEND_FROM,
                to: toAddress,
                subject: `New login identified`,
                html,
            });
        } catch (error: any) {
            Logger.debug(
                "NodemailerService: SendNewIPAndDevice: Error sending email"
            );
            throw new Error(error);
        }
    };

    public static sendLocked = async (toAddress: string) => {
        try {
            Logger.debug("NodemailerService: SendLocked: Entered");

            Logger.debug("NodemailerService: SendLocked: Create transport");
            const transport = await this.createTransport();

            Logger.debug("NodemailerService: SendLocked: Generate template");
            const html = generateAccountLockedTemplate();

            Logger.debug("NodemailerService: SendLocked: Send email");
            await transport.sendMail({
                from: NODEMAILER_SEND_FROM,
                to: toAddress,
                subject: `Account Locked`,
                html,
            });
        } catch (error: any) {
            Logger.debug("NodemailerService: SendLocked: Error sending email");
            throw new Error(error);
        }
    };

    public static sendForgotPassword = async (
        toAddress: string,
        token: string
    ) => {
        try {
            Logger.debug("NodemailerService: SendForgotPassword: Entered");

            Logger.debug(
                "NodemailerService: SendForgotPassword: Create transport"
            );
            const transport = await this.createTransport();

            Logger.debug(
                "NodemailerService: SendForgotPassword: Generate template"
            );
            const html = generateForgotPasswordTemplate(token);

            Logger.debug("NodemailerService: SendForgotPassword: Send email");
            await transport.sendMail({
                from: NODEMAILER_SEND_FROM,
                to: toAddress,
                subject: `Forgot Password`,
                html,
            });
        } catch (error: any) {
            Logger.debug(
                "NodemailerService: SendForgotPassword: Error sending email"
            );
            throw new Error(error);
        }
    };
}

export default NodemailerService;
