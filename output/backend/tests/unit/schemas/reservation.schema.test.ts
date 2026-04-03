import {
  createReservationSchema,
  updateReservationSchema,
  reservationQuerySchema,
} from '@/schemas/reservation.schema';

describe('createReservationSchema', () => {
  const validInput = {
    title: 'Team Standup',
    roomId: 'room-abc-123',
    startTime: '2025-06-01T09:00:00.000Z',
    endTime: '2025-06-01T10:00:00.000Z',
  };

  it('should accept valid input with required fields', () => {
    const result = createReservationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Team Standup');
      expect(result.data.roomId).toBe('room-abc-123');
      // defaults
      expect(result.data.attendees).toEqual([]);
      expect(result.data.isRecurring).toBe(false);
    }
  });

  it('should accept valid input with all optional fields', () => {
    const result = createReservationSchema.safeParse({
      ...validInput,
      description: 'Daily standup meeting',
      attendees: ['user-1', 'user-2'],
      isRecurring: true,
      recurrenceRule: 'FREQ=DAILY;COUNT=5',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('Daily standup meeting');
      expect(result.data.attendees).toEqual(['user-1', 'user-2']);
      expect(result.data.isRecurring).toBe(true);
      expect(result.data.recurrenceRule).toBe('FREQ=DAILY;COUNT=5');
    }
  });

  it('should reject when endTime is before startTime', () => {
    const result = createReservationSchema.safeParse({
      ...validInput,
      startTime: '2025-06-01T10:00:00.000Z',
      endTime: '2025-06-01T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const endTimeIssue = result.error.issues.find((i) => i.path.includes('endTime'));
      expect(endTimeIssue).toBeDefined();
      expect(endTimeIssue?.message).toBe('End time must be after start time');
    }
  });

  it('should reject when endTime equals startTime', () => {
    const result = createReservationSchema.safeParse({
      ...validInput,
      startTime: '2025-06-01T10:00:00.000Z',
      endTime: '2025-06-01T10:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing title', () => {
    const { title, ...rest } = validInput;
    const result = createReservationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const result = createReservationSchema.safeParse({ ...validInput, title: '' });
    expect(result.success).toBe(false);
  });

  it('should reject title longer than 200 characters', () => {
    const result = createReservationSchema.safeParse({ ...validInput, title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should reject missing roomId', () => {
    const { roomId, ...rest } = validInput;
    const result = createReservationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject empty roomId', () => {
    const result = createReservationSchema.safeParse({ ...validInput, roomId: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid startTime format', () => {
    const result = createReservationSchema.safeParse({
      ...validInput,
      startTime: 'not-a-datetime',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid endTime format', () => {
    const result = createReservationSchema.safeParse({
      ...validInput,
      endTime: '2025/06/01 10:00',
    });
    expect(result.success).toBe(false);
  });

  it('should reject description longer than 1000 characters', () => {
    const result = createReservationSchema.safeParse({
      ...validInput,
      description: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateReservationSchema', () => {
  it('should accept partial update with title only', () => {
    const result = updateReservationSchema.safeParse({ title: 'Updated Title' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated Title');
    }
  });

  it('should accept empty object', () => {
    const result = updateReservationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept status update', () => {
    const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
    for (const status of statuses) {
      const result = updateReservationSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid status', () => {
    const result = updateReservationSchema.safeParse({ status: 'DELETED' });
    expect(result.success).toBe(false);
  });

  it('should accept nullable description', () => {
    const result = updateReservationSchema.safeParse({ description: null });
    expect(result.success).toBe(true);
  });

  it('should accept valid datetime for startTime and endTime', () => {
    const result = updateReservationSchema.safeParse({
      startTime: '2025-06-01T09:00:00.000Z',
      endTime: '2025-06-01T10:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid datetime for startTime', () => {
    const result = updateReservationSchema.safeParse({ startTime: 'not-valid' });
    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const result = updateReservationSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('should accept attendees array', () => {
    const result = updateReservationSchema.safeParse({ attendees: ['user-1', 'user-2'] });
    expect(result.success).toBe(true);
  });
});

describe('reservationQuerySchema', () => {
  it('should provide default page and limit for empty query', () => {
    const result = reservationQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should accept valid page and limit', () => {
    const result = reservationQuerySchema.safeParse({ page: 2, limit: 10 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it('should coerce string values to numbers', () => {
    const result = reservationQuerySchema.safeParse({ page: '3', limit: '15' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(15);
    }
  });

  it('should reject page less than 1', () => {
    const result = reservationQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit over 100', () => {
    const result = reservationQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('should accept status filter', () => {
    const result = reservationQuerySchema.safeParse({ status: 'CONFIRMED' });
    expect(result.success).toBe(true);
  });

  it('should accept roomId filter', () => {
    const result = reservationQuerySchema.safeParse({ roomId: 'room-123' });
    expect(result.success).toBe(true);
  });

  it('should accept date range filters', () => {
    const result = reservationQuerySchema.safeParse({
      startDate: '2025-06-01',
      endDate: '2025-06-30',
    });
    expect(result.success).toBe(true);
  });
});
