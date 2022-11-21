import morgan from "morgan";
import { createStream } from "rotating-file-stream";

const logStream = createStream("http.log", {
    size: "10M",
    interval: "1d",
    path: "logs/",
});

const format = `:remote-addr - :remote-user :date[web] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"`;

const httpLogger = morgan(format, { stream: logStream });

export default httpLogger;
