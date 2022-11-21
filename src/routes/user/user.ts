import { Router } from "express";

import UserController from "../../controllers/user";
import rateLimiter from "../../middlewares/rateLimit";
import { verifyToken } from "../../middlewares/token";
import UserValidator from "../../validators/user";

const router = Router();

router.post(
    "/user/signup",
    rateLimiter,
    UserValidator.signup,
    UserController.signUp
);

router.post(
    "/user/login",
    rateLimiter,
    UserValidator.login,
    UserController.login
);

router.post("/user/logout", verifyToken, UserController.logout);

router.post("/user/logoutAll", verifyToken, UserController.logout);

router.patch(
    "/user/me",
    verifyToken,
    UserValidator.updateMe,
    UserController.updateMe
);

router.get("/user/me", verifyToken, UserController.findMe);

router.delete("/user/me", verifyToken, UserController.deleteMe);

router.post(
    "/user/forgotpassword",
    rateLimiter,
    UserValidator.forgotPassword,
    UserController.forgotPassword
);

router.post(
    "/user/resetpassword",
    rateLimiter,
    UserValidator.resetPassword,
    UserController.resetPassword
);

export { router as userRoutes };
