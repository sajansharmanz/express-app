/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* istanbul ignore file */

export const DOMAIN_NAME = process.env.DOMAIN_NAME;
export const PLATFORM_NAME = process.env.PLATFORM_NAME;
export const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const LOG_LEVEL = process.env.LOG_LEVEL;
export const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL;
export const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MAX_FAILED_LOGINS = parseInt(process.env.MAX_FAILED_LOGINS!, 10);
export const NODEMAILER_HOST = process.env.NODEMAILER_HOST;
export const NODEMAILER_PORT = parseInt(process.env.NODEMAILER_PORT!, 10);
export const NODEMAILER_USERNAME = process.env.NODEMAILER_USERNAME;
export const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD;
export const NODEMAILER_SEND_FROM = process.env.NODEMAILER_SEND_FROM;
