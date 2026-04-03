import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import * as authService from '../services/auth.service';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const result = await authService.register(parsed.data);
      return reply.status(201).send(result);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Registration failed' });
    }
  });

  // POST /login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const result = await authService.login(parsed.data);
      return reply.status(200).send(result);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Login failed' });
    }
  });

  // POST /refresh
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = refreshTokenSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const result = await authService.refreshAccessToken(parsed.data.refreshToken);
      return reply.status(200).send(result);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Token refresh failed' });
    }
  });

  // GET /me (authenticated)
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await authService.getProfile(request.user!.userId);
      return reply.status(200).send(user);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to get profile' });
    }
  });

  // POST /logout (authenticated)
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { refreshToken?: string } | undefined;
      await authService.logout(request.user!.userId, body?.refreshToken);
      return reply.status(200).send({ message: 'Logged out successfully' });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Logout failed' });
    }
  });
}
