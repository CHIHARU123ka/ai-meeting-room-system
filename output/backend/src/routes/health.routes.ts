import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkDatabaseConnection } from '../config/database';

export default async function healthRoutes(fastify: FastifyInstance) {
  // GET /health - basic liveness check
  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  });

  // GET /ready - readiness check including DB connectivity
  fastify.get('/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    const dbHealthy = await checkDatabaseConnection();

    const status = dbHealthy ? 'ready' : 'not_ready';
    const httpStatus = dbHealthy ? 200 : 503;

    return reply.status(httpStatus).send({
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy ? 'connected' : 'disconnected',
      },
    });
  });
}
