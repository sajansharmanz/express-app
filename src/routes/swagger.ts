import yaml from "js-yaml";
import fs from "fs";
import { Router } from "express";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";

import Logger from "../configs/logger";

let swaggerDocument = null;

try {
    swaggerDocument = yaml.load(
        fs.readFileSync("./src/configs/swagger.yaml", "utf-8")
    );
} catch (error) {
    /* istanbul ignore next */
    Logger.error(error);
}

const router = Router();

const options: SwaggerUiOptions = {
    explorer: false,
    swaggerOptions: {
        authAction: {
            JWT: {
                name: "JWT",
                schema: {
                    type: "apiKey",
                    in: "header",
                    name: "Authorization",
                    description: "",
                },
                value: "Bearer <my own JWT token>",
            },
        },
    },
};

if (swaggerDocument) {
    router.use("/swagger", swaggerUi.serve);
    router.get("/swagger", swaggerUi.setup(swaggerDocument, options));
}

export { router as swaggerRoutes };
