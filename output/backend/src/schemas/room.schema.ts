import { z } from 'zod';

const roomTypeEnum = z.enum(['MEETING', 'CONFERENCE', 'PHONE_BOOTH', 'TRAINING', 'EVENT', 'HUDDLE']);
const roomStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RESERVED']);

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(200),
  description: z.string().max(1000).optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(1000),
  location: z.string().min(1, 'Location is required'),
  floor: z.string().optional(),
  building: z.string().optional(),
  type: roomTypeEnum.optional().default('MEETING'),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  capacity: z.number().int().min(1).max(1000).optional(),
  location: z.string().min(1).optional(),
  floor: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  type: roomTypeEnum.optional(),
  status: roomStatusEnum.optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export const roomQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  type: roomTypeEnum.optional(),
  status: roomStatusEnum.optional(),
  minCapacity: z.coerce.number().int().min(1).optional(),
  maxCapacity: z.coerce.number().int().min(1).optional(),
  floor: z.string().optional(),
  building: z.string().optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomQuery = z.infer<typeof roomQuerySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
