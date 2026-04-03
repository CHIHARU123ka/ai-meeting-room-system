import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/index';
import { logger } from './config/logger';
import { disconnectDatabase } from './config/database';
import authPlugin from './plugins/auth';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import reservationRoutes from './routes/reservation.routes';
import analyticsRoutes from './routes/analytics.routes';

async function buildServer() {
  const fastify = Fastify({
    logger: false, // Using winston instead
    trustProxy: true,
  });

  // --- Plugins ---

  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: config.isProduction,
  });

  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.window,
  });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'AI Meeting Room API',
        description: 'API for AI-powered meeting room booking system',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Auth plugin (decorators for authenticate / requireAdmin)
  await fastify.register(authPlugin);

  // --- Request logging ---

  fastify.addHook('onRequest', async (request) => {
    logger.info(`${request.method} ${request.url}`, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  });

  fastify.addHook('onResponse', async (request, reply) => {
    logger.info(`${request.method} ${request.url} ${reply.statusCode}`, {
      responseTime: reply.elapsedTime,
    });
  });

  // --- Global error handler ---

  fastify.setErrorHandler(async (error, _request, reply) => {
    logger.error('Unhandled error', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    });

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      error: statusCode === 500 ? 'Internal Server Error' : error.message,
      ...(config.isDevelopment ? { stack: error.stack } : {}),
    });
  });

  // --- Routes ---

  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(roomRoutes, { prefix: '/api/rooms' });
  await fastify.register(reservationRoutes, { prefix: '/api/reservations' });
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

  // Root route
  fastify.get('/', async () => {
    return {
      name: 'AI Meeting Room API',
      version: '1.0.0',
      docs: '/docs',
    };
  });

  return fastify;
}

async function start() {
  let server: Awaited<ReturnType<typeof buildServer>> | undefined;

  try {
    server = await buildServer();

    await server.listen({ port: config.port, host: config.host });
    logger.info(`Server running on http://${config.host}:${config.port}`);
    logger.info(`Swagger docs at http://${config.host}:${config.port}/docs`);
    logger.info(`Environment: ${config.nodeEnv}`);
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    if (server) {
      await server.close();
    }
    await disconnectDatabase();
    logger.info('Server stopped');
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

start();

export { buildServer };
