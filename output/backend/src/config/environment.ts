import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  SLOW_DOWN_DELAY_AFTER: z.string().transform(Number).default('50'),
  SLOW_DOWN_DELAY_MS: z.string().transform(Number).default('500'),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform(Boolean).default('true'),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_MAX_SIZE: z.string().default('20m'),
  LOG_FILE_MAX_FILES: z.string().default('14d'),
  
  API_TITLE: z.string().default('Todo List API'),
  API_DESCRIPTION: z.string().default('Secure Todo List API with JWT Authentication'),
  API_VERSION: z.string().default('1.0.0'),
  
  HEALTH_CHECK_ENDPOINT: z.string().default('/health'),
  
  ENABLE_SWAGGER: z.string().transform(Boolean).default('true'),
  ENABLE_RATE_LIMITING: z.string().transform(Boolean).default('true'),
  ENABLE_SLOW_DOWN: z.string().transform(Boolean).default('true'),
  ENABLE_COMPRESSION: z.string().transform(Boolean).default('true'),
  ENABLE_HELMET: z.string().transform(Boolean).default('true'),
});

export type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
