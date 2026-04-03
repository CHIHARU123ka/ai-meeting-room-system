import { z } from 'zod';

const reservationStatusEnum = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']);

export const createReservationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  roomId: z.string().min(1, 'Room ID is required'),
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO datetime' }),
  endTime: z.string().datetime({ message: 'endTime must be a valid ISO datetime' }),
  attendees: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
  recurrenceRule: z.string().optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'End time must be after start time', path: ['endTime'] },
);

export const updateReservationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: reservationStatusEnum.optional(),
  attendees: z.array(z.string()).optional(),
});

export const reservationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: reservationStatusEnum.optional(),
  roomId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ReservationQuery = z.infer<typeof reservationQuerySchema>;
