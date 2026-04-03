import dotenv from 'dotenv';
dotenv.config();

function env(key: string, fallback?: string): string {
  const val = process.env[key];
  if (val !== undefined) return val;
  if (fallback !== undefined) return fallback;
  return '';
}

export const config = {
  port: parseInt(env('PORT', '4000'), 10),
  host: env('HOST', '0.0.0.0'),
  nodeEnv: env('NODE_ENV', 'development'),

  database: {
    url: env('DATABASE_URL', 'postgresql://localhost:5432/meeting_room_db'),
  },

  jwt: {
    secret: env('JWT_SECRET', 'change-me-in-production'),
    expiresIn: env('JWT_EXPIRES_IN', '24h'),
    refreshSecret: env('JWT_REFRESH_SECRET', 'change-me-refresh-in-production'),
    refreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  cors: {
    origin: env('CORS_ORIGIN', 'http://localhost:3000'),
  },

  redis: {
    url: env('REDIS_URL', 'redis://localhost:6379'),
  },

  bcrypt: {
    rounds: parseInt(env('BCRYPT_ROUNDS', '12'), 10),
  },

  rateLimit: {
    max: parseInt(env('RATE_LIMIT_MAX', '100'), 10),
    window: parseInt(env('RATE_LIMIT_WINDOW', '900000'), 10),
  },

  log: {
    level: env('LOG_LEVEL', 'info'),
    filePath: env('LOG_FILE_PATH', './logs/app.log'),
  },

  get isDevelopment() {
    return this.nodeEnv === 'development';
  },

  get isProduction() {
    return this.nodeEnv === 'production';
  },
};
