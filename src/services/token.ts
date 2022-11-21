import Logger from "../configs/logger";
import prisma from "../configs/prisma";

class TokenService {
    public static save = async (token: string, userId: string) => {
        try {
            Logger.debug("TokenService: Save: Entered");

            Logger.debug("TokenService: Save: Saving");
            await prisma.token.create({
                data: {
                    token,
                    userId,
                },
            });
        } catch (error: any) {
            Logger.debug("TokenService: Save: Error");
            throw new Error(error);
        }
    };

    public static find = async (token: string) => {
        try {
            Logger.debug("TokenService: Find: Entered");

            Logger.debug("TokenService: Find: Returning");
            return await prisma.token.findUnique({
                where: {
                    token,
                },
            });
        } catch (error: any) {
            Logger.debug("TokenService: Find: Error");
            throw new Error(error);
        }
    };

    public static delete = async (token: string) => {
        try {
            Logger.debug("TokenService: Delete: Entered");

            Logger.debug("TokenService: Delete: Deleting");
            await prisma.token.delete({
                where: {
                    token,
                },
            });
        } catch (error: any) {
            Logger.debug("TokenService: Delete: Error");
            throw new Error(error);
        }
    };

    public static deleteAll = async (userId: string) => {
        try {
            Logger.debug("TokenService: DeleteAll: Entered");

            Logger.debug("TokenService: DeleteAll: Deleting");
            await prisma.token.deleteMany({
                where: {
                    userId,
                },
            });
        } catch (error: any) {
            Logger.debug("TokenService: DeleteAll: Error");
            throw new Error(error);
        }
    };
}

export default TokenService;
