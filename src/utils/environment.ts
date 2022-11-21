import { ENV } from "../configs/environment";

export const isDevelopment = (): boolean => ENV === "development";
export const isLive = (): boolean => ENV === "production";
export const isTest = (): boolean => ENV === "test";
