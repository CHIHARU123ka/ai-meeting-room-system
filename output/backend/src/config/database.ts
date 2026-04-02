import { PrismaClient } from '@prisma/client';
import { env, isDevelopment } from './environment';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient({
  log: isDevelopment 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
  errorFormat: isDevelopment ? 'pretty' : 'minimal',
});

// Database connection event handlers
prisma.$on('query', (e) => {
  if (isDevelopment) {
    logger.debug('Database Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  }
});

prisma.$on('info', (e) => {
  logger.info('Database Info', { message: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn('Database Warning', { message: e.message });
});

prisma.$on('error', (e) => {
  logger.error('Database Error', { message: e.message });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed', { error });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection failed', { error });
    throw error;
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};
