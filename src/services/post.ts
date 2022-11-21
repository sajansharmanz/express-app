import { Post, PostStatus } from "@prisma/client";

import Logger from "../configs/logger";
import prisma from "../configs/prisma";

class PostService {
    public static findAll = async (): Promise<Post[]> => {
        try {
            Logger.debug("PostService: FindAll: Entered");

            Logger.debug("PostService: FindAll: Find All");
            return await prisma.post.findMany({
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    versions: {
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });
        } catch (error: any) {
            Logger.debug("PostService: FindAll: Error");
            throw new Error(error);
        }
    };

    public static findById = async (id: string): Promise<Post | null> => {
        try {
            Logger.debug("PostService: FindById: Entered");

            Logger.debug("PostService: FindById: Find");
            return await prisma.post.findUnique({
                where: {
                    id,
                },
                include: {
                    versions: {
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });
        } catch (error: any) {
            Logger.debug("PostService: FindById: Error");
            throw new Error(error);
        }
    };

    public static add = async (
        content: string,
        userId: string
    ): Promise<Post> => {
        try {
            Logger.debug("PostService: Add: Entered");

            Logger.debug("PostService: Add: Create");
            return await prisma.post.create({
                data: {
                    authorId: userId,
                    status: PostStatus.PUBLISHED,
                    versions: {
                        create: {
                            content,
                        },
                    },
                },
                include: {
                    versions: {
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });
        } catch (error: any) {
            Logger.debug("PostService: Add: Error");
            throw new Error(error);
        }
    };

    public static update = async (
        postId: string,
        content: string
    ): Promise<Post> => {
        try {
            Logger.debug("PostService: Update: Entered");

            Logger.debug("PostService: Update: Update");
            return await prisma.post.update({
                where: {
                    id: postId,
                },
                data: {
                    versions: {
                        create: {
                            content,
                        },
                    },
                },
                include: {
                    versions: {
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });
        } catch (error: any) {
            Logger.debug("PostService: Update: Error");
            throw new Error(error);
        }
    };

    public static delete = async (postId: string): Promise<void> => {
        try {
            Logger.debug("PostService: Delete: Entered");

            Logger.debug("PostService: Delete: Delete");
            await prisma.post.delete({
                where: {
                    id: postId,
                },
            });
        } catch (error: any) {
            Logger.debug("PostService: Delete: Error");
            throw new Error(error);
        }
    };
}

export default PostService;
