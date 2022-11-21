import http from "http";
import { Server } from "socket.io";

import { PORT } from "./configs/environment";
import Logger from "./configs/logger";

import { app } from "./app";

import { isDevelopment } from "./utils/environment";

const server = http.createServer(app);
const io = new Server(server);

//io.on("connection", (socket) => {});

server.listen(PORT, () => {
    Logger.debug(`Server started on port ${PORT}`);

    isDevelopment() ? console.log(`Server started on port ${PORT}`) : null;
});
