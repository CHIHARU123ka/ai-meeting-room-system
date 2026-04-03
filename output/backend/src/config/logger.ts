import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(
  process.env['LOG_FILE_PATH']
    ? path.dirname(process.env['LOG_FILE_PATH'])
    : './logs',
);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${String(stack)}` : '';
    return `${String(timestamp)} [${level.toUpperCase()}]: ${String(message)}${metaStr}${stackStr}`;
  }),
);

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: logFormat,
  defaultMeta: { service: 'meeting-room-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

export default logger;
