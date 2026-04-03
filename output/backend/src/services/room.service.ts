import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import type { CreateRoomInput, UpdateRoomInput, RoomQuery } from '../schemas/room.schema';

export async function listRooms(query: RoomQuery) {
  const { page, limit, search, type, status, minCapacity, maxCapacity, floor, building } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.RoomWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (type) where.type = type;
  if (status) where.status = status;
  if (floor) where.floor = floor;
  if (building) where.building = building;
  if (minCapacity || maxCapacity) {
    where.capacity = {};
    if (minCapacity) where.capacity.gte = minCapacity;
    if (maxCapacity) where.capacity.lte = maxCapacity;
  }

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      include: {
        equipment: true,
        _count: { select: { reservations: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.room.count({ where }),
  ]);

  return {
    data: rooms,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRoomById(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      equipment: true,
      sensors: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { reservations: true } },
    },
  });

  if (!room) {
    throw { statusCode: 404, message: 'Room not found' };
  }

  return room;
}

export async function createRoom(input: CreateRoomInput, createdById: string) {
  const room = await prisma.room.create({
    data: {
      ...input,
      createdById,
    },
    include: { equipment: true },
  });

  return room;
}

export async function updateRoom(id: string, input: UpdateRoomInput) {
  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Room not found' };
  }

  const room = await prisma.room.update({
    where: { id },
    data: input,
    include: { equipment: true },
  });

  return room;
}

export async function deleteRoom(id: string) {
  const existing = await prisma.room.findUnique({ where: { id } });
  if (!existing) {
    throw { statusCode: 404, message: 'Room not found' };
  }

  // Check for future reservations
  const futureReservations = await prisma.reservation.count({
    where: {
      roomId: id,
      endTime: { gt: new Date() },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
  });

  if (futureReservations > 0) {
    throw {
      statusCode: 409,
      message: `Cannot delete room with ${futureReservations} upcoming reservation(s)`,
    };
  }

  await prisma.room.delete({ where: { id } });
  return { message: 'Room deleted successfully' };
}

export async function getRoomAvailability(roomId: string, date: string) {
  const existing = await prisma.room.findUnique({ where: { id: roomId } });
  if (!existing) {
    throw { statusCode: 404, message: 'Room not found' };
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const reservations = await prisma.reservation.findMany({
    where: {
      roomId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
    },
    orderBy: { startTime: 'asc' },
  });

  // Build available time slots (business hours 8:00-20:00)
  const slots: Array<{ start: string; end: string; available: boolean }> = [];
  const businessStart = 8;
  const businessEnd = 20;

  for (let hour = businessStart; hour < businessEnd; hour++) {
    const slotStart = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00.000Z`);
    const slotEnd = new Date(`${date}T${String(hour + 1).padStart(2, '0')}:00:00.000Z`);

    const isBooked = reservations.some(
      (r) => r.startTime < slotEnd && r.endTime > slotStart,
    );

    slots.push({
      start: slotStart.toISOString(),
      end: slotEnd.toISOString(),
      available: !isBooked,
    });
  }

  return { room: existing, date, reservations, slots };
}
