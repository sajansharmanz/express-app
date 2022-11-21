import { File as PrismaFile, Profile, SkinTone } from "@prisma/client";
import { Request } from "express";

import Logger from "../configs/logger";
import prisma from "../configs/prisma";

import { File } from "../types/file";
import {
    TFindAvatarResponse,
    TProfileUpdateRequestBody,
} from "../types/profile";

class ProfileService {
    public static add = async (
        userId: string,
        firstName: string,
        lastName: string,
        skinTone: string
    ) => {
        try {
            Logger.debug("ProfileService: Add: Entered");

            Logger.debug("ProfileService: Add: Adding");
            return await prisma.profile.create({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    skinTone: skinTone as SkinTone,
                    userId,
                },
            });
        } catch (error: any) {
            Logger.debug("ProfileService: Add: Error");
            throw new Error(error);
        }
    };

    public static update = async (req: Request): Promise<Profile> => {
        try {
            Logger.debug("ProfileService: Update: Entered");

            const { profile } = req;
            const { firstName, lastName, skinTone } =
                req.body as TProfileUpdateRequestBody;

            if (!profile) {
                Logger.debug("ProfileService: Update: No profile");
                throw new Error("Profile not found on request object");
            }

            profile.firstName = firstName ?? profile.firstName;
            profile.lastName = lastName ?? profile.lastName;
            profile.skinTone = (skinTone as SkinTone) ?? profile.skinTone;

            Logger.debug("ProfileService: Update: Updating");
            await prisma.profile.update({
                where: {
                    id: profile.id,
                },
                data: {
                    ...profile,
                },
            });

            return profile;
        } catch (error: any) {
            Logger.debug("ProfileService: Update: Error");
            throw new Error(error);
        }
    };

    public static find = async (userId: string): Promise<Profile | null> => {
        try {
            Logger.debug("ProfileService: Find: Entered");

            Logger.debug("ProfileService: Find: Find");
            return await prisma.profile.findFirst({
                where: {
                    userId,
                },
            });
        } catch (error: any) {
            Logger.debug("ProfileService: Find: Error");
            throw new Error(error);
        }
    };

    public static delete = async (userId: string): Promise<void> => {
        try {
            Logger.debug("ProfileService: Delete: Entered");

            Logger.debug("ProfileService: Delete: Delete");
            await prisma.profile.delete({
                where: {
                    userId,
                },
            });
        } catch (error: any) {
            Logger.debug("ProfileService: Delete: Error");
            throw new Error(error);
        }
    };

    public static addAvatar = async (
        avatar: File,
        profileId?: string,
        userId?: string
    ): Promise<string> => {
        try {
            Logger.debug("ProfileService: AddAvatar: Entered");

            Logger.debug("ProfileService: AddAvatar: Create");

            const base64String = Buffer.from(avatar.buffer).toString("base64");
            const { originalname, encoding, mimetype, size } = avatar;

            let file: PrismaFile | undefined;

            Logger.debug("ProfileService: AddAvatar: Create - Profile ID");
            if (profileId) {
                file = await prisma.file.create({
                    data: {
                        profileId,
                        originalname,
                        mimetype,
                        size,
                        encoding: encoding ?? "",
                        base64String,
                    },
                });
            }

            Logger.debug("ProfileService: AddAvatar: Create - User ID");
            if (userId && !file) {
                file = await prisma.file.create({
                    data: {
                        originalname,
                        mimetype,
                        size,
                        encoding: encoding ?? "",
                        base64String,
                        profile: {
                            create: {
                                userId,
                            },
                        },
                    },
                });
            }

            Logger.debug("ProfileService: AddAvatar: Create - No file");
            if (!file) {
                return "";
            }

            Logger.debug("ProfileService: AddAvatar: Returning response");
            return `data:${file.mimetype};base64,${file.base64String}`;
        } catch (error: any) {
            Logger.debug("ProfileService: AddAvatar: Error");
            throw new Error(error);
        }
    };

    public static findAvatar = async (
        userId: string
    ): Promise<TFindAvatarResponse> => {
        try {
            Logger.debug("ProfileService: FindAvatar: Entered");

            Logger.debug("ProfileService: FindAvatar: Find profile");
            const profile = await prisma.profile.findUnique({
                where: {
                    userId,
                },
            });

            if (!profile) {
                Logger.debug("ProfileService: FindAvatar: No profile");
                return {
                    avatar: "",
                };
            }

            Logger.debug("ProfileService: FindAvatar: Find avatar");
            const file = await prisma.file.findUnique({
                where: {
                    profileId: profile.id,
                },
            });

            if (!file) {
                Logger.debug("ProfileService: FindAvatar: No avatar");
                return {
                    avatar: "",
                };
            }

            Logger.debug("ProfileService: FindAvatar: Profile and Avatar");
            return {
                avatar: `data:${file.mimetype};base64,${file.base64String}`,
            };
        } catch (error: any) {
            Logger.debug("ProfileService: FindAvatar: Error");
            throw new Error(error);
        }
    };

    public static updateAvatar = async (
        profileId: string,
        avatar: File
    ): Promise<string> => {
        try {
            Logger.debug("ProfileService: UpdateAvatar: Entered");

            Logger.debug("ProfileService: UpdateAvatar: Create");

            const base64String = Buffer.from(avatar.buffer).toString("base64");
            const { originalname, encoding, mimetype, size } = avatar;

            const file = await prisma.file.update({
                where: {
                    profileId,
                },
                data: {
                    profileId,
                    originalname,
                    mimetype,
                    size,
                    encoding: encoding ?? "",
                    base64String,
                },
            });

            return `data:${file.mimetype};base64,${file.base64String}`;
        } catch (error: any) {
            Logger.debug("ProfileService: UpdateAvatar: Error");
            throw new Error(error);
        }
    };

    public static deleteAvatar = async (userId: string): Promise<void> => {
        try {
            Logger.debug("ProfileService: DeleteAvatar: Entered");

            Logger.debug("ProfileService: DeleteAvatar: Delete");
            const profile = await prisma.profile.findUnique({
                where: {
                    userId,
                },
            });

            if (!profile) {
                return;
            }

            await prisma.file.deleteMany({
                where: {
                    profileId: profile.id,
                },
            });
        } catch (error: any) {
            Logger.debug("ProfileService: DeleteAvatar: Error");
            throw new Error(error);
        }
    };
}

export default ProfileService;
