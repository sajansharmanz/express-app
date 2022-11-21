import { NextFunction, Request, Response } from "express";
import Logger from "../configs/logger";
import { InternalServerError } from "../errors";
import ProfileService from "../services/profile";
import { File } from "../types/file";
import { TProfileAddRequestBody } from "../types/profile";

class ProfileController {
    public static add = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { user } = req;
            const { firstName, lastName, skinTone } =
                req.body as TProfileAddRequestBody;

            if (!user) {
                Logger.debug("ProfileController: Add: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("ProfileController: Add: Add profile");
            const profile = await ProfileService.add(
                user.id,
                firstName ?? "",
                lastName ?? "",
                skinTone ?? "NONE"
            );

            Logger.debug("ProfileController: Add: Sending Response");
            return res.status(201).send(profile);
        } catch (error: any) {
            Logger.debug("ProfileController: Add: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: Update: Entered");

            Logger.debug("ProfileController: Update: Update profile");
            const profile = await ProfileService.update(req);

            Logger.debug("ProfileController: Update: Sending Response");
            return res.status(200).send(profile);
        } catch (error: any) {
            Logger.debug("ProfileController: Update: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static find = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: Find: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("ProfileController: Add: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("ProfileController: Find: Find");
            const profile = await ProfileService.find(user.id);

            Logger.debug("ProfileController: Find: Sending Response");
            return res.status(200).send(profile);
        } catch (error: any) {
            Logger.debug("ProfileController: Find: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: Delete: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("ProfileController: Delete: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("ProfileController: Delete: Delete");
            await ProfileService.delete(user.id);

            Logger.debug("ProfileController: Delete: Sending Response");
            return res.status(204).send();
        } catch (error: any) {
            Logger.debug("ProfileController: Delete: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static addAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: AddAvatar: Entered");

            const avatar = req.file as File;
            const { profile, user } = req;

            const base64String = await ProfileService.addAvatar(
                avatar,
                profile?.id,
                user?.id
            );

            res.status(200).send({
                avatar: base64String,
            });
        } catch (error: any) {
            Logger.debug("ProfileController: AddAvatar: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static findAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: FindAvatar: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("ProfileController: FindAvatar: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("ProfileService: FindAvatar: Find avatar");
            const { avatar } = await ProfileService.findAvatar(user.id);

            Logger.debug("ProfileController: FindAvatar: Sending Response");
            return res.status(200).send({
                avatar,
            });
        } catch (error: any) {
            Logger.debug("ProfileController: FindAvatar: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static updateAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: UpdateAvatar: Entered");

            const avatar = req.file as File;
            const { profile } = req;

            if (!profile) {
                Logger.debug("ProfileController: UpdateAvatar: No profile");
                return next(
                    new InternalServerError(
                        "Profile not found on request object"
                    )
                );
            }

            Logger.debug("ProfileController: UpdateAvatar: Update Avatar");
            const base64String = await ProfileService.updateAvatar(
                profile.id,
                avatar
            );

            Logger.debug("ProfileController: UpdateAvatar: Sending Response");
            return res.status(200).send({
                avatar: base64String,
            });
        } catch (error: any) {
            Logger.debug("ProfileController: UpdateAvatar: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static deleteAvatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("ProfileController: DeleteAvatar: Entered");

            const { user } = req;

            if (!user) {
                Logger.debug("ProfileController: DeleteAvatar: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("ProfileController: DeleteAvatar: Delete");
            await ProfileService.deleteAvatar(user.id);

            Logger.debug("ProfileController: DeleteAvatar: Sending Response");
            return res.status(204).send();
        } catch (error: any) {
            Logger.debug("ProfileController: DeleteAvatar: Server Error");
            return next(new InternalServerError(error));
        }
    };
}

export default ProfileController;
