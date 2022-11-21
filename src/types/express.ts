import { Profile, User } from "@prisma/client";

declare module "express-serve-static-core" {
    interface Request {
        user?: User;
        token?: string;
        profile?: Profile;
    }
}
