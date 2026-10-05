import type { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${path} ${res.statusCode} ${duration}ms`);
  });

  next();
};
