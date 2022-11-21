import winston from "winston";
import "winston-daily-rotate-file";
import moment from "moment";
import { createStream } from "rotating-file-stream";
import { LOG_LEVEL } from "./environment";

const logStream = createStream("combined.log", {
    size: "10M",
    interval: "1d",
    path: "logs/",
});

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};

const format = winston.format.combine(
    winston.format.printf(
        (info) =>
            `${info.level.toUpperCase()}: ${moment().format(
                "DD-MMM-YYYY HH:mm:ss"
            )}: ${info.message}`
    )
);

const transports = [
    new winston.transports.DailyRotateFile({
        stream: logStream,
    }),
];

const Logger = winston.createLogger({
    level: LOG_LEVEL,
    levels,
    format,
    transports,
});

export default Logger;
