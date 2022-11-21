/* eslint-disable @typescript-eslint/ban-ts-comment */
import { User } from "@prisma/client";
import Logger from "../configs/logger";

import { TUserForResponse } from "../types/user";

export const createUserObjectForResponse = (user: User): TUserForResponse => {
    Logger.debug("CleanUserObjectForResponse: Entered");

    //@ts-ignore
    delete user.password;

    //@ts-ignore
    delete user.passwordResetToken;

    Logger.debug("CleanUserObjectForResponse: Returning");
    return user;
};
