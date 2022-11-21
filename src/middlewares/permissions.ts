import { NextFunction, Request, Response } from "express";
import Logger from "../configs/logger";
import prisma from "../configs/prisma";
import { InternalServerError, PermissionError } from "../errors";

export const canAccess = async (
    req: Request,
    res: Response,
    next: NextFunction,
    requiredPermission: string
): Promise<void> => {
    try {
        Logger.debug("CanAccess: Entered");

        const { user } = req;

        if (!user) {
            Logger.debug("CanAccess: No user");
            return next(
                new InternalServerError("User not found on request object")
            );
        }

        Logger.debug("CanAccess: Roles and Permissions");
        const roles = await prisma.role.findMany({
            where: {
                users: {
                    some: {
                        id: user.id,
                    },
                },
            },
            include: {
                permissions: true,
            },
        });

        let canAccess = false;

        Logger.debug("CanAccess: Check Roles and Permissions");
        roles.forEach((role) => {
            role.permissions.forEach((permission) => {
                if (permission.name === requiredPermission) {
                    canAccess = true;
                }
            });
        });

        if (!canAccess) {
            Logger.debug("CanAccess: Not allowed access");
            return next(new PermissionError());
        }

        Logger.debug("CanAccess: Allowed access");
        next();
    } catch (error: any) {
        return next(new InternalServerError(error));
    }
};
