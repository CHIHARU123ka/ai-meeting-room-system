import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createReservationSchema, updateReservationSchema, reservationQuerySchema } from '../schemas/reservation.schema';
import * as reservationService from '../services/reservation.service';

export default async function reservationRoutes(fastify: FastifyInstance) {
  // All reservation routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);

  // GET / - list user's reservations
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = reservationQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const result = await reservationService.listReservations(request.user!.userId, parsed.data);
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to list reservations' });
    }
  });

  // GET /upcoming - upcoming reservations for user
  fastify.get('/upcoming', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const reservations = await reservationService.getUpcomingReservations(request.user!.userId);
      return reply.status(200).send(reservations);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message || 'Failed to get upcoming reservations' });
    }
  });

  // GET /:id - get reservation by id
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const reservation = await reservationService.getReservationById(request.params.id, request.user!.userId);
      return reply.status(200).send(reservation);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to get reservation' });
    }
  });

  // POST / - create reservation
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createReservationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const reservation = await reservationService.createReservation(parsed.data, request.user!.userId);
      return reply.status(201).send(reservation);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({
        error: err.message || 'Failed to create reservation',
        ...(err.conflictWith ? { conflictWith: err.conflictWith } : {}),
      });
    }
  });

  // PUT /:id - update reservation
  fastify.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = updateReservationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parsed.error.flatten() });
    }

    try {
      const reservation = await reservationService.updateReservation(request.params.id, parsed.data, request.user!.userId);
      return reply.status(200).send(reservation);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to update reservation' });
    }
  });

  // DELETE /:id - cancel reservation
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    try {
      const reservation = await reservationService.deleteReservation(request.params.id, request.user!.userId);
      return reply.status(200).send(reservation);
    } catch (err: any) {
      const status = err.statusCode || 500;
      return reply.status(status).send({ error: err.message || 'Failed to cancel reservation' });
    }
  });
}
