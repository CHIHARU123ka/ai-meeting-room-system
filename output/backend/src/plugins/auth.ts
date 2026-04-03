import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { prisma } from '../config/database';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('user', undefined);

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, status: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        return reply.status(401).send({ error: 'User not found or inactive' });
      }

      request.user = decoded;
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
  });

  fastify.decorate('requireAdmin', async function (request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }
    if (request.user.role !== 'ADMIN' && request.user.role !== 'SUPER_ADMIN') {
      return reply.status(403).send({ error: 'Admin access required' });
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, { name: 'auth' });
