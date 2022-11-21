import { SkinTone } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import Logger from "../configs/logger";
import prisma from "../configs/prisma";
import { GeneralError, InternalServerError, ValidationError } from "../errors";
import { TValidationErrors } from "../types/errors";
import { File } from "../types/file";
import {
    TProfileAddRequestBody,
    TProfileUpdateRequestBody,
} from "../types/profile";

class ProfileValidator {
    public static add = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("ProfileValidator: Add: Entered");
        const { firstName, lastName, skinTone } =
            req.body as TProfileAddRequestBody;
        const errors: TValidationErrors[] = [];

        Logger.debug(
            "ProfileValidator: Add: First Name, Last Name and Skin Tone"
        );
        if (!firstName && !lastName && !skinTone) {
            return next(
                new ValidationError([
                    {
                        message:
                            "You must provide either a first name, last name or skin tone",
                    },
                ])
            );
        }

        Logger.debug("ProfileValidator: Add: FirstName");
        if (firstName) {
            errors.push(...this.firstNameValidator(firstName));
        }

        Logger.debug("ProfileValidator: Add: LastName");
        if (lastName) {
            errors.push(...this.lastNameValidator(lastName));
        }

        Logger.debug("ProfileValidator: Add: SkinTone");
        if (skinTone) {
            errors.push(...this.skinToneValidator(skinTone));
        }

        if (errors.length > 0) {
            Logger.debug("ProfileValidator: Add: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        Logger.debug("ProfileValdidator: Add: No Issues");
        next();
    };

    public static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("ProfileValidator: Update: Entered");
        const { firstName, lastName, skinTone } =
            req.body as TProfileUpdateRequestBody;
        const { user } = req;
        const errors: TValidationErrors[] = [];

        Logger.debug(
            "ProfileValidator: Update: First Name, Last Name and Skin Tone"
        );
        if (!firstName && !lastName && !skinTone) {
            return next(
                new ValidationError([
                    {
                        message:
                            "You must provide either a first name, last name or skin tone",
                    },
                ])
            );
        }

        Logger.debug("ProfileValidator: Update: FirstName");
        if (firstName) {
            errors.push(...this.firstNameValidator(firstName));
        }

        Logger.debug("ProfileValidator: Update: LastName");
        if (lastName) {
            errors.push(...this.lastNameValidator(lastName));
        }

        Logger.debug("ProfileValidator: Update: SkinTone");
        if (skinTone) {
            errors.push(...this.skinToneValidator(skinTone));
        }

        if (errors.length > 0) {
            Logger.debug("ProfileValidator: Update: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        Logger.debug("ProfileValidator: Update: Find profile");
        prisma.profile
            .findUnique({
                where: {
                    userId: user?.id,
                },
            })
            .catch((error) => {
                return next(new InternalServerError(error));
            })
            .then((profile) => {
                if (!profile) {
                    Logger.debug("ProfileValidator: Update: No profile");
                    return next(
                        new GeneralError(500, "No profile exists for user")
                    );
                }

                Logger.debug("ProfileValdidator: Update: No Issues");
                req.profile = profile;
                next();
            });
    };

    public static avatarHeaderCheck = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        Logger.debug("ProfileValidator: AvatarHeaderCheck: Entered");

        const contentType = req.get("Content-Type");

        if (!contentType) {
            Logger.debug(
                "ProfileValidator: AvatarHeaderCheck: Error finding content type in headers"
            );
            return next(
                new InternalServerError("Unable to determine content type")
            );
        }

        if (contentType && !contentType.includes("multipart/form-data")) {
            Logger.debug(
                "ProfileValidator: AvatarHeaderCheck: Not multipart/form-data request"
            );
            return next(
                new ValidationError([
                    { message: "Request must be multipart/form-data" },
                ])
            );
        }

        Logger.debug("ProfileValidator: AvatarHeaderCheck: No issues");
        next();
    };

    public static avatar = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("ProfileValidator: Avatar: Entered");
        const errors: TValidationErrors[] = [];
        const { user } = req;
        const { originalname, encoding, mimetype, size, buffer } =
            req.file as unknown as File;

        Logger.debug("ProfileValidator: Avatar: Check file");
        if (!req.file) {
            return next(
                new ValidationError([
                    { message: "No avatar was found in the request" },
                ])
            );
        }

        Logger.debug("ProfileValidator: Avatar: Original name");
        if (!originalname) {
            errors.push({
                message: "Original name not provided",
                field: "originalname",
            });
        }

        if (originalname && typeof originalname !== "string") {
            errors.push({
                message: "Original name must be a string",
                field: "originalname",
            });
        }

        Logger.debug("ProfileValidator: Avatar: Encoding");
        if (encoding && typeof encoding !== "string") {
            errors.push({
                message: "Encoding must be a string",
                field: "encoding",
            });
        }

        Logger.debug("ProfileValidator: Avatar: MimeType");
        if (!mimetype) {
            errors.push({
                message: "MimeType not provided",
                field: "mimetype",
            });
        }

        if (mimetype && typeof mimetype !== "string") {
            errors.push({
                message: "mimetype must be a string",
                field: "mimetype",
            });
        }

        if (
            mimetype !== "image/png" &&
            mimetype !== "image/jpg" &&
            mimetype !== "image/jpeg"
        ) {
            errors.push({
                message: "File type must be .png, .jpg or.jpeg",
                field: "mimetype",
            });
        }

        Logger.debug("ProfileValidator: Avatar: Size");
        if (!size) {
            errors.push({
                message: "Size not provided",
                field: "size",
            });
        }

        if (size && typeof size !== "number") {
            errors.push({
                message: "Size name must be a number",
                field: "size",
            });
        }

        Logger.debug("ProfileValidator: Avatar: Buffer");
        if (!buffer) {
            errors.push({
                message: "Buffer not provided",
                field: "buffer",
            });
        }

        if (buffer && !Buffer.isBuffer(buffer)) {
            errors.push({
                message: "Buffer name must be a buffer",
                field: "buffer",
            });
        }

        if (errors.length > 0) {
            Logger.debug("ProfileValidator: Avatar: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        Logger.debug("ProfileValidator: Avatar: Find profile");
        prisma.profile
            .findUnique({
                where: {
                    userId: user?.id,
                },
            })
            .catch((error) => {
                return next(new InternalServerError(error));
            })
            .then((profile) => {
                if (!profile) {
                    Logger.debug("ProfileValidator: Avatar: No profile");
                    return next();
                }

                Logger.debug("ProfileValidator: Avatar: No issues");
                req.profile = profile;
                next();
            });
    };

    private static firstNameValidator = (
        firstName: any
    ): TValidationErrors[] => {
        Logger.debug("ProfileValidator: FirstName: Entered");
        const errors: TValidationErrors[] = [];
        const field = "firstName";

        if (typeof firstName !== "string") {
            Logger.debug("ProfileValidator: FirstName: Not a string");
            errors.push({ message: "First name must be a string", field });
        }

        return errors;
    };

    private static lastNameValidator = (lastName: any): TValidationErrors[] => {
        Logger.debug("ProfileValidator: LastName: Entered");
        const errors: TValidationErrors[] = [];
        const field = "lastName";

        if (typeof lastName !== "string") {
            Logger.debug("ProfileValidator: LastName: Not a string");
            errors.push({ message: "Last name must be a string", field });
        }

        return errors;
    };

    private static skinToneValidator = (skinTone: any): TValidationErrors[] => {
        Logger.debug("ProfileValidator: SkinTone: Entered");
        const errors: TValidationErrors[] = [];
        const field = "skinTone";

        if (!skinTone) {
            Logger.debug("ProfileValidator: SkinTone: Not provided");
            errors.push({ message: "Skin tone must be provided", field });
        }

        if (typeof skinTone !== "string") {
            Logger.debug("ProfileValidator: SkinTone: Not a string");
            errors.push({ message: "Skin tone must be a string", field });

            return errors;
        }

        const s = skinTone as SkinTone;
        if (!Object.values(SkinTone).includes(s)) {
            Logger.debug("ProfileValidator: SkinTone: Invalid skin tone");
            errors.push({ message: "Invalid skin tone", field });
        }

        return errors;
    };
}

export default ProfileValidator;
