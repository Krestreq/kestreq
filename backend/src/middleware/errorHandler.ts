import { Request, Response, NextFunction } from "express";

/** Request logging middleware */
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

/** Error handling middleware */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    success: false,
    status: 500,
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
};

/** Not found middleware */
export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: "Route not found",
    timestamp: new Date().toISOString(),
  });
};
