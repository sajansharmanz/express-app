import { NextFunction, Request, Response } from "express";

import Logger from "../configs/logger";
import { InternalServerError, ValidationError } from "../errors";
import PostService from "../services/post";
import {
    TPostAddRequestBody,
    TPostDeleteParams,
    TPostFindByIdParams,
    TPostUpdateParams,
} from "../types/post";

class PostController {
    public static findAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("PostController: FindAll: Entered");

            const posts = await PostService.findAll();

            Logger.debug("PostController: FindAll: Sending Response");
            return res.status(200).send(posts);
        } catch (error: any) {
            Logger.debug("PostController: FindAll: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static findById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("PostController: FindById: Entered");

            const { postId } = req.params as TPostFindByIdParams;

            if (!postId) {
                Logger.debug("PostController: FindById: No Post Id");
                return next(
                    new ValidationError([
                        { message: "No postId was found in request" },
                    ])
                );
            }

            Logger.debug("PostController: FindById: Find");
            const post = await PostService.findById(postId);

            Logger.debug("PostController: FindById: Sending Response");
            return res.status(200).send(post);
        } catch (error: any) {
            Logger.debug("PostController: FindAll: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static add = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("PostController: Add: Entered");

            const { content } = req.body as TPostAddRequestBody;
            const { user } = req;

            if (!user) {
                Logger.debug("PostController: Add: No user");
                return next(
                    new InternalServerError("User not found on request object")
                );
            }

            Logger.debug("PostController: Add: Create");
            const post = await PostService.add(content, user.id);

            Logger.debug("PostController: Add: Sending Response");
            return res.status(201).send(post);
        } catch (error: any) {
            Logger.debug("PostController: Add: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("PostController: Update: Entered");

            const { postId } = req.params as TPostUpdateParams;
            const { content } = req.body as TPostAddRequestBody;

            Logger.debug("PostController: Add: Update");
            const post = await PostService.update(postId, content);

            Logger.debug("PostController: Add: Sending Response");
            return res.status(200).send(post);
        } catch (error: any) {
            Logger.debug("PostController: Add: Server Error");
            return next(new InternalServerError(error));
        }
    };

    public static delete = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            Logger.debug("PostController: Delete: Entered");

            const { postId } = req.params as TPostDeleteParams;

            Logger.debug("PostController: Delete: Find");

            await PostService.delete(postId);

            Logger.debug("PostController: Delete: Sending Response");
            return res.status(204).send();
        } catch (error: any) {
            Logger.debug("PostController: Delete: Server Error");
            return next(new InternalServerError(error));
        }
    };
}

export default PostController;
