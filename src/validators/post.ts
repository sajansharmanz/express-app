import { NextFunction, Request, Response } from "express";
import Logger from "../configs/logger";
import prisma from "../configs/prisma";
import { GeneralError, PermissionError, ValidationError } from "../errors";
import { TValidationErrors } from "../types/errors";
import {
    TPostAddRequestBody,
    TPostDeleteParams,
    TPostUpdateParams,
    TPostUpdateRequestBody,
} from "../types/post";

class PostValidator {
    public static add = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("PostValidator: Add: Entered");
        const { content } = req.body as TPostAddRequestBody;
        const errors: TValidationErrors[] = [];

        Logger.debug("PostValidator: Add: Content");
        errors.push(...this.contentValidator(content));

        if (errors.length > 0) {
            Logger.debug("PostValidator: Add: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        Logger.debug("PostValidator: Add: No Issues");
        next();
    };

    public static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("PostValidator: Update: Entered");
        const { postId } = req.params as TPostUpdateParams;
        const { user } = req;
        const { content } = req.body as TPostUpdateRequestBody;
        const errors: TValidationErrors[] = [];

        if (!postId) {
            Logger.debug("PostValidator: Update: No post id");
            errors.push({ message: "No postId was found in request" });
        }

        if (!user) {
            Logger.debug("PostValidator: Update: No user");
            errors.push({ message: "User not found on request object" });
        }

        Logger.debug("PostValidator: Update: Content");
        errors.push(...this.contentValidator(content));

        if (errors.length > 0) {
            Logger.debug("PostValidator: Update: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });

        if (!post) {
            Logger.debug("PostValidator: Update: No post found");
            return next(new GeneralError(404, "Post does not exist"));
        }

        if (post.authorId !== user?.id) {
            Logger.debug("PostValidator: Update: User not author of post");
            return next(new PermissionError());
        }

        Logger.debug("PostValidator: Update: No Issues");
        next();
    };

    public static delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        Logger.debug("PostValidator: Delete: Entered");
        const errors: TValidationErrors[] = [];

        const { postId } = req.params as TPostDeleteParams;
        const { user } = req;

        if (!postId) {
            Logger.debug("PostValidator: Delete: No post id");
            errors.push({ message: "No postId was found in request" });
        }

        if (!user) {
            Logger.debug("PostValidator: Delete: No user");
            errors.push({ message: "User not found on request object" });
        }

        if (errors.length > 0) {
            Logger.debug("PostValidator: Delete: Throwing ValidationError");
            return next(new ValidationError(errors));
        }

        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            },
        });

        if (!post) {
            Logger.debug("PostValidator: Delete: No post found");
            return next(new GeneralError(404, "Post does not exist"));
        }

        if (post.authorId !== user?.id) {
            Logger.debug("PostValidator: Delete: User not author of post");
            return next(new PermissionError());
        }

        Logger.debug("PostValidator: Delete: No issues");
        next();
    };

    private static contentValidator = (content: any): TValidationErrors[] => {
        Logger.debug("PostValidator: Content: Entered");
        const errors: TValidationErrors[] = [];
        const field = "content";

        if (!content) {
            Logger.debug("PostValidator: Content: Not provided");
            errors.push({ message: "Content must be provided", field });
        }

        if (typeof content !== "string") {
            Logger.debug("PostValidator: Content: Not a string");
            errors.push({ message: "Content must be a string", field });
        }

        return errors;
    };
}

export default PostValidator;
