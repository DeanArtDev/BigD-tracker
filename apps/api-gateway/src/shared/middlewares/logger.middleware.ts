import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl: url } = req;
  const logger = new Logger('LoggerMiddleware');
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    logger.log(`[${method}] ${url} ${res.statusCode} - ${ms}ms`);
  });

  next();
}
