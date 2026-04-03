import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { prisma } from '../config/database';
import type { JwtPayload } from '../plugins/auth';

/**
 * Standalone JWT verification function for use outside of Fastify hooks.
 * Verifies the token, checks the user exists and is active, returns the payload.
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, status: true },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new Error('User not found or inactive');
  }

  return decoded;
}

/**
 * Extract bearer token from authorization header.
 */
export function extractBearerToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Optional auth: decorates request.user if a valid token is present, but does not reject.
 */
export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  const token = extractBearerToken(request);
  if (!token) return;

  try {
    const decoded = await verifyToken(token);
    request.user = decoded;
  } catch {
    // Token invalid or expired - continue without user
  }
}
