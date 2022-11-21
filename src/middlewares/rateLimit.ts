import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { isTest } from "../utils/environment";

const rateLimiter = isTest()
    ? (req: Request, res: Response, next: NextFunction) => next()
    : rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
      });

export default rateLimiter;
