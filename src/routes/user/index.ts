import { Router } from "express";

import { profileRouter } from "./profile";
import { userRoutes } from "./user";
import { postsRouter } from "./posts";

const routes: Router[] = [userRoutes, profileRouter, postsRouter];

export { routes as userRoutes };
