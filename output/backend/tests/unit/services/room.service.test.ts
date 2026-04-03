const mockPrismaRoom = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockPrismaReservation = {
  findMany: jest.fn(),
  count: jest.fn(),
};

jest.mock('../../../src/config/database', () => ({
  prisma: {
    room: mockPrismaRoom,
    reservation: mockPrismaReservation,
  },
}));

jest.mock('../../../src/config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import * as roomService from '../../../src/services/room.service';

describe('RoomService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sampleRoom = {
    id: 'room-1',
    name: 'Innovation Room A',
    description: 'Large meeting room with projector',
    capacity: 10,
    location: 'Building A, Floor 3',
    floor: '3F',
    building: 'A',
    type: 'MEETING',
    status: 'ACTIVE',
    amenities: ['wifi', 'whiteboard'],
    images: [],
    metadata: null,
    createdById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('listRooms', () => {
    it('should return paginated rooms', async () => {
      mockPrismaRoom.findMany.mockResolvedValue([sampleRoom]);
      mockPrismaRoom.count.mockResolvedValue(1);

      const result = await roomService.listRooms({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by search', async () => {
      mockPrismaRoom.findMany.mockResolvedValue([]);
      mockPrismaRoom.count.mockResolvedValue(0);

      await roomService.listRooms({ page: 1, limit: 10, search: 'Innovation' });

      expect(mockPrismaRoom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: 'Innovation' }) }),
            ]),
          }),
        })
      );
    });

    it('should filter by capacity range', async () => {
      mockPrismaRoom.findMany.mockResolvedValue([sampleRoom]);
      mockPrismaRoom.count.mockResolvedValue(1);

      await roomService.listRooms({ page: 1, limit: 10, minCapacity: 5, maxCapacity: 15 });

      expect(mockPrismaRoom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            capacity: { gte: 5, lte: 15 },
          }),
        })
      );
    });
  });

  describe('getRoomById', () => {
    it('should return a room by ID', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(sampleRoom);

      const result = await roomService.getRoomById('room-1');

      expect(result.name).toBe('Innovation Room A');
    });

    it('should throw 404 for non-existent room', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(null);

      await expect(roomService.getRoomById('non-existent')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const input = {
        name: 'New Room',
        capacity: 6,
        location: 'Building B',
      };

      mockPrismaRoom.create.mockResolvedValue({
        ...sampleRoom,
        ...input,
        id: 'room-new',
      });

      const result = await roomService.createRoom(input as any, 'user-1');

      expect(result.name).toBe('New Room');
      expect(mockPrismaRoom.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateRoom', () => {
    it('should update a room', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(sampleRoom);
      mockPrismaRoom.update.mockResolvedValue({
        ...sampleRoom,
        name: 'Updated Room',
      });

      const result = await roomService.updateRoom('room-1', { name: 'Updated Room' });

      expect(result.name).toBe('Updated Room');
    });

    it('should throw 404 for non-existent room', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(null);

      await expect(
        roomService.updateRoom('non-existent', { name: 'Test' })
      ).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });
  });

  describe('deleteRoom', () => {
    it('should delete a room with no upcoming reservations', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(sampleRoom);
      mockPrismaReservation.count.mockResolvedValue(0);
      mockPrismaRoom.delete.mockResolvedValue(sampleRoom);

      const result = await roomService.deleteRoom('room-1');

      expect(result.message).toBe('Room deleted successfully');
    });

    it('should throw 404 for non-existent room', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(null);

      await expect(roomService.deleteRoom('non-existent')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('should reject deletion when room has upcoming reservations', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(sampleRoom);
      mockPrismaReservation.count.mockResolvedValue(3);

      await expect(roomService.deleteRoom('room-1')).rejects.toEqual(
        expect.objectContaining({ statusCode: 409 })
      );
    });
  });

  describe('getRoomAvailability', () => {
    it('should throw 404 for non-existent room', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(null);

      await expect(
        roomService.getRoomAvailability('non-existent', '2026-04-03')
      ).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 })
      );
    });

    it('should return availability slots', async () => {
      mockPrismaRoom.findUnique.mockResolvedValue(sampleRoom);
      mockPrismaReservation.findMany.mockResolvedValue([]);

      const result = await roomService.getRoomAvailability('room-1', '2026-04-03');

      expect(result).toHaveProperty('room');
      expect(result).toHaveProperty('slots');
      expect(result.slots.length).toBe(12); // 8:00 to 20:00 = 12 hours
      expect(result.slots.every((s: any) => s.available)).toBe(true);
    });
  });
});
