import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createRoomSchema, updateRoomSchema, roomQuerySchema, availabilityQuerySchema } from '../schemas/room.schema';
import * as roomService from '../services/room.service';

export default async function roomRoutes(fastify: FastifyInstance) {
  // GET / - list rooms with filters (public)
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = roomQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const result = await roomService.listRooms(parsed.data);
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to list rooms' });
    }
  });

  // GET /:id - get room by id (public)
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const room = await roomService.getRoomById(request.params.id);
      return reply.status(200).send(room);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to get room' });
    }
  });

  // GET /:id/availability - check room availability for a date (public)
  fastify.get<{ Params: { id: string } }>('/:id/availability', async (request, reply) => {
    const parsed = availabilityQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const result = await roomService.getRoomAvailability(request.params.id, parsed.data.date);
      return reply.status(200).send(result);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to get availability' });
    }
  });

  // POST / - create room (admin only)
  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireAdmin],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createRoomSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const room = await roomService.createRoom(parsed.data, request.user!.userId);
      return reply.status(201).send(room);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to create room' });
    }
  });

  // PUT /:id - update room (admin only)
  fastify.put<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate, fastify.requireAdmin],
  }, async (request, reply) => {
    const parsed = updateRoomSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const room = await roomService.updateRoom(request.params.id, parsed.data);
      return reply.status(200).send(room);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to update room' });
    }
  });

  // DELETE /:id - delete room (admin only)
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate, fastify.requireAdmin],
  }, async (request, reply) => {
    try {
      const result = await roomService.deleteRoom(request.params.id);
      return reply.status(200).send(result);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to delete room' });
    }
  });
}
