import * as jsonwebtoken from "jsonwebtoken";

import { JWT_SECRET } from "../configs/environment";
import Logger from "../configs/logger";

export const signToken = (data: object): string => {
    Logger.debug("Create Token: Entered");
    if (!JWT_SECRET) {
        Logger.debug("Create Token: No JWT secret defined");
        throw new Error("No JWT Secret has been defined");
    }

    let token: string;

    try {
        Logger.debug("Create Token: Creating");
        token = jsonwebtoken.sign(
            { ...data, iat: Date.now() / 1000 },
            JWT_SECRET
        );
    } catch (error) {
        Logger.debug("Create Token: Error creating token");
        throw new Error("There was a problem generating the JWT Token");
    }

    Logger.debug("Create Token: Returning");
    return token;
};

export const decodeToken = (token: string): jsonwebtoken.JwtPayload => {
    Logger.debug("Verify Token: Entered");
    if (!JWT_SECRET) {
        Logger.debug("Verify Token: No JWT secret defined");
        throw new Error("No JWT Secret has been defined");
    }

    let data: jsonwebtoken.JwtPayload = {};

    try {
        Logger.debug("Verify Token: Verifying");
        data = jsonwebtoken.verify(
            token,
            JWT_SECRET
        ) as jsonwebtoken.JwtPayload;
    } catch (error) {
        Logger.debug("Verify Token: Error verifying token");
        throw new Error("There was a problem verifying the JWT token");
    }

    Logger.debug("Verify Token: Returning");
    return data;
};
