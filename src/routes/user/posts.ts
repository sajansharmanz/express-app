import { Router } from "express";
import PostController from "../../controllers/post";
import { verifyToken } from "../../middlewares/token";
import PostValidator from "../../validators/post";

const router = Router();

router.get("/posts", verifyToken, PostController.findAll);

router.get("/posts/:postId", verifyToken, PostController.findById);

router.post("/posts", verifyToken, PostValidator.add, PostController.add);

router.patch(
    "/posts/:postId",
    verifyToken,
    PostValidator.update,
    PostController.update
);

router.delete(
    "/posts/:postId",
    verifyToken,
    PostValidator.delete,
    PostController.delete
);

export { router as postsRouter };
