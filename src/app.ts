import compression from "compression";
import express, { json } from "express";
import helmet from "helmet";

import cors from "./middlewares/cors";
import { EndpointNotFoundMiddlware, ErrorHandler } from "./middlewares/errors";
import httpLogger from "./middlewares/httpLogger";
import rateLimiter from "./middlewares/rateLimit";

import { isLive } from "./utils/environment";

import { userRoutes } from "./routes/user";
import { adminRoutes } from "./routes/admin";
import { dummyRoutes } from "./routes/dummy";
import { swaggerRoutes } from "./routes/swagger";

const app = express();

app.use(json());
app.use(compression());
app.use(helmet());

app.use(cors);
app.use(rateLimiter);
app.use(httpLogger);

if (userRoutes.length > 0) {
    app.use(userRoutes);
}

if (adminRoutes.length > 0) {
    app.use("/admin", adminRoutes);
}

if (!isLive()) {
    app.use(dummyRoutes);
}

app.use(swaggerRoutes);

app.use(EndpointNotFoundMiddlware);
app.use(ErrorHandler);

export { app };
