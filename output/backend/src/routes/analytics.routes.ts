import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as analyticsService from '../services/analytics.service';

export default async function analyticsRoutes(fastify: FastifyInstance) {
  // All analytics routes require authentication and admin role
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /dashboard - overview stats
  fastify.get('/dashboard', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const stats = await analyticsService.getDashboardStats();
      return reply.status(200).send(stats);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to get dashboard stats' });
    }
  });

  // GET /room-usage - room utilization metrics
  fastify.get('/room-usage', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const usage = await analyticsService.getRoomUsageStats();
      return reply.status(200).send(usage);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to get room usage stats' });
    }
  });

  // GET /user-activity - user booking patterns
  fastify.get('/user-activity', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const activity = await analyticsService.getUserActivityStats();
      return reply.status(200).send(activity);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to get user activity stats' });
    }
  });
}
