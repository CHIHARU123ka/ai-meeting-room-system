import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { CreateReservationInput, UpdateReservationInput, ReservationQuery } from '../schemas/reservation.schema';

async function checkConflict(roomId: string, startTime: Date, endTime: Date, excludeId?: string) {
  const where: Prisma.ReservationWhereInput = {
    roomId,
    status: { in: ['CONFIRMED', 'PENDING'] },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const conflict = await prisma.reservation.findFirst({ where });
  return conflict;
}

export async function listReservations(userId: string, query: ReservationQuery) {
  const { page, limit, status, roomId, startDate, endDate } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ReservationWhereInput = { userId };

  if (status) where.status = status;
  if (roomId) where.roomId = roomId;
  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate);
    if (endDate) where.startTime.lte = new Date(endDate);
  }

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      include: {
        room: { select: { id: true, name: true, location: true, floor: true } },
      },
      orderBy: { startTime: 'desc' },
    }),
    prisma.reservation.count({ where }),
  ]);

  return {
    data: reservations,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getReservationById(id: string, userId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      room: { select: { id: true, name: true, location: true, floor: true, capacity: true, amenities: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!reservation) {
    throw { statusCode: 404, message: 'Reservation not found' };
  }

  if (reservation.userId !== userId) {
    throw { statusCode: 403, message: 'You can only view your own reservations' };
  }

  return reservation;
}

export async function createReservation(input: CreateReservationInput, userId: string) {
  // Verify room exists and is active
  const room = await prisma.room.findUnique({ where: { id: input.roomId } });
  if (!room) {
    throw { statusCode: 404, message: 'Room not found' };
  }
  if (room.status !== 'ACTIVE') {
    throw { statusCode: 400, message: 'Room is not available for booking' };
  }

  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  // Cannot book in the past
  if (startTime < new Date()) {
    throw { statusCode: 400, message: 'Cannot create reservations in the past' };
  }

  // Check for time conflicts
  const conflict = await checkConflict(input.roomId, startTime, endTime);
  if (conflict) {
    throw {
      statusCode: 409,
      message: 'Time slot conflicts with an existing reservation',
      conflictWith: { id: conflict.id, startTime: conflict.startTime, endTime: conflict.endTime },
    };
  }

  const reservation = await prisma.reservation.create({
    data: {
      title: input.title,
      description: input.description,
      roomId: input.roomId,
      userId,
      startTime,
      endTime,
      attendees: input.attendees,
      isRecurring: input.isRecurring,
      recurrenceRule: input.recurrenceRule,
    },
    include: {
      room: { select: { id: true, name: true, location: true } },
    },
  });

  logger.info('Reservation created', { reservationId: reservation.id, userId, roomId: input.roomId });

  return reservation;
}

export async function updateReservation(id: string, input: UpdateReservationInput, userId: string) {
  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Reservation not found' };
  }
  if (existing.userId !== userId) {
    throw { statusCode: 403, message: 'You can only update your own reservations' };
  }
  if (existing.status === 'CANCELLED' || existing.status === 'COMPLETED') {
    throw { statusCode: 400, message: `Cannot update a ${existing.status.toLowerCase()} reservation` };
  }

  // If times are being changed, check for conflicts
  const newStart = input.startTime ? new Date(input.startTime) : existing.startTime;
  const newEnd = input.endTime ? new Date(input.endTime) : existing.endTime;

  if (input.startTime || input.endTime) {
    if (newEnd <= newStart) {
      throw { statusCode: 400, message: 'End time must be after start time' };
    }

    const conflict = await checkConflict(existing.roomId, newStart, newEnd, id);
    if (conflict) {
      throw {
        statusCode: 409,
        message: 'Updated time conflicts with an existing reservation',
      };
    }
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      startTime: input.startTime ? newStart : undefined,
      endTime: input.endTime ? newEnd : undefined,
      status: input.status,
      attendees: input.attendees,
    },
    include: {
      room: { select: { id: true, name: true, location: true } },
    },
  });

  logger.info('Reservation updated', { reservationId: id, userId });

  return reservation;
}

export async function deleteReservation(id: string, userId: string) {
  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Reservation not found' };
  }
  if (existing.userId !== userId) {
    throw { statusCode: 403, message: 'You can only cancel your own reservations' };
  }

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  logger.info('Reservation cancelled', { reservationId: id, userId });

  return reservation;
}

export async function getUpcomingReservations(userId: string) {
  const reservations = await prisma.reservation.findMany({
    where: {
      userId,
      startTime: { gt: new Date() },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    include: {
      room: { select: { id: true, name: true, location: true, floor: true } },
    },
    orderBy: { startTime: 'asc' },
    take: 10,
  });

  return reservations;
}
