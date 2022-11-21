import * as bcryptjs from "bcryptjs";
import Logger from "../configs/logger";

export const hashPassword = async (password: string): Promise<string> => {
    Logger.debug("Hash Password: Entered");
    let hash = "";

    try {
        Logger.debug("Hash Password: Hashing");
        hash = await bcryptjs.hash(password, 8);
    } catch (error: any) {
        Logger.debug("Hash Password: Error hashing");
        throw new Error(error);
    }

    Logger.debug("Hash Password: Returning hash");
    return hash;
};

export const validatePassword = async (
    password: string,
    hashedPassword: string
): Promise<boolean> => {
    Logger.debug("Validate Password: Entered");
    let valid = false;

    try {
        Logger.debug("Validate Password: Validating");
        valid = await bcryptjs.compare(password, hashedPassword);
    } catch (error: any) {
        Logger.debug("Validate Password: Error validating");
        throw new Error(error);
    }

    Logger.debug("Validate Password: Returning validation");
    return valid;
};
