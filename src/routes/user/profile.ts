import { Router } from "express";
import multer from "multer";

import ProfileController from "../../controllers/profile";
import { verifyToken } from "../../middlewares/token";
import ProfileValidator from "../../validators/profile";

const router = Router();
const upload = multer();

router.post(
    "/profile",
    verifyToken,
    ProfileValidator.add,
    ProfileController.add
);

router.get("/profile", verifyToken, ProfileController.find);

router.patch(
    "/profile",
    verifyToken,
    ProfileValidator.update,
    ProfileController.update
);

router.delete("/profile", verifyToken, ProfileController.delete);

router.post(
    "/profile/avatar",
    verifyToken,
    ProfileValidator.avatarHeaderCheck,
    upload.single("avatar"),
    ProfileValidator.avatar,
    ProfileController.addAvatar
);

router.get("/profile/avatar", verifyToken, ProfileController.findAvatar);

router.patch(
    "/profile/avatar",
    verifyToken,
    ProfileValidator.avatarHeaderCheck,
    upload.single("avatar"),
    ProfileValidator.avatar,
    ProfileController.updateAvatar
);

router.delete("/profile/avatar", verifyToken, ProfileController.deleteAvatar);

export { router as profileRouter };
