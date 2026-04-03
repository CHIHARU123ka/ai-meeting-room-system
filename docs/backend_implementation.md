設計書に基づき、バックエンドAPIを完全実装いたします。セキュリティを重視したFastifyベースの実装を提供します。

=== package.json ===
```json
{
  "name": "ai-meeting-room-backend",
  "version": "1.0.0",
  "description": "AI-powered meeting room management system backend",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write src/**/*.ts",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seeds/index.ts",
    "db:studio": "prisma studio",
    "docker:build": "docker build -t ai-meeting-room-backend .",
    "docker:run": "docker-compose up -d"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^7.2.4",
    "@fastify/multipart": "^8.0.0",
    "@fastify/rate-limit": "^9.1.0",
    "@fastify/redis": "^6.1.1",
    "@fastify/swagger": "^8.14.0",
    "@fastify/swagger-ui": "^2.1.0",
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "bull": "^4.12.2",
    "fastify": "^4.25.2",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.8",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "winston": "^3.11.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/bull": "^4.10.0",
    "@types/jest": "^29.5.11",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.6",
    "@types/nodemailer": "^6.4.14",
    "@types/passport": "^1.0.16",
    "@types/passport-google-oauth20": "^2.0.14",
    "@types/passport-jwt": "^3.0.13",
    "@types/passport-local": "^1.0.38",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "prettier": "^3.1.1",
    "prisma": "^5.7.1",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

=== .env.example ===
```env
# Application
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
API_VERSION=v1

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/meeting_room_db?schema=public"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
REDIS_DB=0

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Encryption
BCRYPT_ROUNDS=12
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# CORS
CORS_ORIGIN="http://localhost:3000"
CORS_CREDENTIALS=true

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@meetingroom.com"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="meeting-room-files"
S3_PRESIGNED_URL_EXPIRES=3600

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/v1/auth/google/callback"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_CALLBACK_URL="http://localhost:3001/api/v1/auth/microsoft/callback"

# External APIs
GOOGLE_CALENDAR_API_KEY="your-google-calendar-api-key"
MICROSOFT_GRAPH_API_KEY="your-microsoft-graph-api-key"
SLACK_BOT_TOKEN="your-slack-bot-token"
TEAMS_WEBHOOK_URL="your-teams-webhook-url"

# AI Service
AI_SERVICE_URL="http://localhost:8000"
AI_SERVICE_API_KEY="your-ai-service-api-key"

# IoT Integration
IOT_MQTT_BROKER="mqtt://localhost:1883"
IOT_MQTT_USERNAME="iot-user"
IOT_MQTT_PASSWORD="iot-password"

# Monitoring
LOG_LEVEL="info"
LOG_FILE_PATH="./logs/app.log"
ENABLE_REQUEST_LOGGING=true

# Security
HELMET_CSP_ENABLED=true
HELMET_HSTS_ENABLED=true
TRUSTED_PROXIES="127.0.0.1"

# Feature Flags
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_IOT_INTEGRATION=true
ENABLE_CALENDAR_SYNC=true
ENABLE_NOTIFICATIONS=true
ENABLE_ANALYTICS=true

# Background Jobs
QUEUE_REDIS_URL="redis://localhost:6379"
QUEUE_CONCURRENCY=5
QUEUE_RETRY_ATTEMPTS=3
QUEUE_RETRY_DELAY=5000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"
UPLOAD_PATH="./uploads"

# Cache
CACHE_TTL=3600
CACHE_MAX_KEYS=1000

# Health Check
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_INTERVAL=30000
```

=== tsconfig.json ===
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@/config/*": ["./config/*"],
      "@/controllers/*": ["./controllers/*"],
      "@/services/*": ["./services/*"],
      "@/repositories/*": ["./repositories/*"],
      "@/middleware/*": ["./middleware/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/schemas/*": ["./schemas/*"]
    }
  },
  "include": [
    "src/**/*",
    "prisma/seeds/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}
```

=== prisma/schema.prisma ===
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(cuid())
  email             String   @unique
  username          String?  @unique
  firstName         String
  lastName          String
  password          String?
  avatar            String?
  phone             String?
  department        String?
  position          String?
  role              UserRole @default(USER)
  status            UserStatus @default(ACTIVE)
  emailVerified     Boolean  @default(false)
  emailVerifiedAt   DateTime?
  lastLoginAt       DateTime?
  preferences       Json?
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  reservations      Reservation[]
  createdRooms      Room[]        @relation("RoomCreator")
  auditLogs         AuditLog[]
  notifications     Notification[]
  socialLogins      SocialLogin[]
  refreshTokens     RefreshToken[]

  @@map("users")
}

model SocialLogin {
  id         String   @id @default(cuid())
  userId     String
  provider   String
  providerId String
  email      String?
  metadata   Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerId])
  @@map("social_logins")
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

model Room {
  id          String     @id @default(cuid())
  name        String
  description String?
  capacity    Int
  location    String
  floor       String?
  building    String?
  type        RoomType   @default(MEETING)
  status      RoomStatus @default(ACTIVE)
  amenities   String[]
  images      String[]
  metadata    Json?
  createdById String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  // Relations
  createdBy     User          @relation("RoomCreator", fields: [createdById], references: [id])
  reservations  Reservation[]
  equipment     Equipment[]
  sensors       IoTSensor[]

  @@map("rooms")
}

model Equipment {
  id          String          @id @default(cuid())
  roomId      String
  name        String
  type        EquipmentType
  status      EquipmentStatus @default(AVAILABLE)
  description String?
  metadata    Json?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@map("equipment")
}

model IoTSensor {
  id          String     @id @default(cuid())
  roomId      String
  sensorId    String     @unique
  type        SensorType
  status      SensorStatus @default(ACTIVE)
  lastReading Json?
  lastReadingAt DateTime?
  metadata    Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@map("iot_sensors")
}

model Reservation {
  id          String            @id @default(cuid())
  title       String
  description String?
  roomId      String
  userId      String
  startTime   DateTime
  endTime     DateTime
  status      ReservationStatus @default(CONFIRMED)
  attendees   String[]
  isRecurring Boolean           @default(false)
  recurrenceRule String?
  parentId    String?
  externalId  String?
  source      String?           @default("INTERNAL")
  metadata    Json?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Relations
  room         Room           @relation(fields: [roomId], references: [id])
  user         User           @relation(fields: [userId], references: [id])
  parent       Reservation?   @relation("RecurringReservation", fields: [parentId], references: [id])
  children     Reservation[]  @relation("RecurringReservation")
  notifications Notification[]

  @@map("reservations")
}

model Notification {
  id            String             @id @default(cuid())
  userId        String
  reservationId String?
  type          NotificationType
  title         String
  message       String
  status        NotificationStatus @default(PENDING)
  scheduledAt   DateTime?
  sentAt        DateTime?
  metadata      Json?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  reservation Reservation? @relation(fields: [reservationId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  resource  String
  resourceId String?
  oldValues Json?
  newValues Json?
  ipAddress String?
  userAgent String?
  metadata  Json?
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}

model Analytics {
  id          String      @id @default(cuid())
  type        AnalyticsType
  date        DateTime
  roomId      String?
  userId      String?
  value       Float
  metadata    Json?
  createdAt   DateTime    @default(now())

  @@unique([type, date, roomId, userId])
  @@map("analytics")
}

// Enums
enum UserRole {
  SUPER_ADMIN
  ADMIN
  MANAGER
  USER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

enum RoomType {
  MEETING
  CONFERENCE
  PHONE_BOOTH
  TRAINING
  EVENT
  HUDDLE
}

enum RoomStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
  RESERVED
}

enum EquipmentType {
  PROJECTOR
  TV
  WHITEBOARD
  PHONE
  CAMERA
  MICROPHONE
  SPEAKER
  COMPUTER
  OTHER
}

enum EquipmentStatus {
  AVAILABLE
  IN_USE
  MAINTENANCE
  BROKEN
}

enum SensorType {
  OCCUPANCY
  TEMPERATURE
  HUMIDITY
  LIGHT
  NOISE
  AIR_QUALITY
  MOTION
}

enum SensorStatus {
  ACTIVE
  INACTIVE
  ERROR
  MAINTENANCE
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

enum NotificationType {
  RESERVATION_CONFIRMED
  RESERVATION_CANCELLED
  RESERVATION_REMINDER
  ROOM_AVAILABLE
  SYSTEM_MAINTENANCE
  CUSTOM
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

enum AnalyticsType {
  ROOM_USAGE
  USER_ACTIVITY
  BOOKING_RATE
  CANCELLATION_RATE
  NO_SHOW_RATE
  EFFICIENCY_SCORE
  OCCUPANCY_RATE
}
```

=== src/config/env.ts ===
```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  DATABASE_TIMEOUT: z.coerce.number().default(30000),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Encryption
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  ENCRYPTION_KEY: z.string().length(32),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string().email(),

  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_PRESIGNED_URL_EXPIRES: z.coerce.number().default(3600),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CALLBACK_URL: z.string().url().optional(),

  // External APIs
  GOOGLE_CALENDAR_API_KEY: z.string().optional(),
  MICROSOFT_GRAPH_API_KEY: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  TEAMS_WEBHOOK_URL: z.string().url().optional(),

  // AI Service
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_API_KEY: z.string().optional(),

  // IoT
  IOT_MQTT_BROKER: z.string().url().optional(),
  IOT_MQTT_USERNAME: z.string().optional(),
  IOT_MQTT_PASSWORD: z.string().optional(),

  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),

  // Security
  HELMET_CSP_ENABLED: z.coerce.boolean().default(true),
  HELMET_HSTS_ENABLED: z.coerce.boolean().default(true),
  TRUSTED_PROXIES: z.string().default('127.0.0.1'),

  // Feature Flags
  ENABLE_AI_RECOMMENDATIONS: z.coerce.boolean().default(true),
  ENABLE_IOT_INTEGRATION: z.coerce.boolean().default(true),
  ENABLE_CALENDAR_SYNC: z.coerce.boolean().default(true),
  ENABLE_NOTIFICATIONS: z.coerce.boolean().default(true),
  ENABLE_ANALYTICS: z.coerce.boolean().default(true),

  // Background Jobs
  QUEUE_REDIS_URL: z.string().url(),
  QUEUE_CONCURRENCY: z.coerce.number().default(5),
  QUEUE_RETRY_ATTEMPTS: z.coerce.number().default(3),
  QUEUE_RETRY_DELAY: z.coerce.number().default(5000),

  // File Upload
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,application/pdf'),
  UPLOAD_PATH: z.string().default('./uploads'),

  // Cache
  CACHE_TTL: z.coerce.number().default(3600),
  CACHE_MAX_KEYS: z.coerce.number().default(1000),

  // Health Check
  HEALTH_CHECK_TIMEOUT: z.coerce.number().default(5000),
  HEALTH_CHECK_INTERVAL: z.coerce.number().default(30000),
});

export type EnvConfig = z.infer<typeof envSchema>;

let env: EnvConfig;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };
```

=== src/config/database.ts ===
```typescript
import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '@/utils/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

// Database middleware for logging
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  if (env.NODE_ENV === 'development') {
    logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }
  
  return result;
});
```

=== src/config/redis.ts ===
```typescript
import Redis from 'ioredis';
import { env } from './env';
import { logger } from '@/utils/logger';

class RedisClient {
  private client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis(env.REDIS_URL, {
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.client.on('ready', () => {
      logger.info('Redis is ready to receive commands');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
    }
  }

  getClient(): Redis {
    return this.client;
  }

  isHealthy(): boolean {
    return this.isConnected && this.client.status === 'ready';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cache methods
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hdel(key, field);
      return result > 0;
    } catch (error) {
      logger.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  async sadd(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sadd(key, member);
      return result > 0;
    } catch (error) {
      logger.error(`Redis SADD error for key ${key}, member ${member}:`, error);
      return false;
    }
  }

  async srem(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.srem(key, member);
      return result > 0;
    } catch (error) {
      logger.error(`Redis SREM error for key ${key}, member ${member}:`, error);
      return false;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      logger.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }
}

export const redis = new RedisClient();
```

=== src/config/logger.ts ===
```typescript
import winston from 'winston';
import { env } from './env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),