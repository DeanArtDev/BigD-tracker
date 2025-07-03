import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl: url } = req;
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    console.info(`[${method}] ${url} ${res.statusCode} - ${ms}ms`);
  });

  next();
}
