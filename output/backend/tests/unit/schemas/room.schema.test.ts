import {
  createRoomSchema,
  updateRoomSchema,
  roomQuerySchema,
  availabilityQuerySchema,
} from '@/schemas/room.schema';

describe('createRoomSchema', () => {
  const validInput = {
    name: 'Conference Room A',
    capacity: 10,
    location: 'Building 1, Floor 3',
  };

  it('should accept valid input with required fields only', () => {
    const result = createRoomSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Conference Room A');
      expect(result.data.capacity).toBe(10);
      expect(result.data.location).toBe('Building 1, Floor 3');
      // defaults
      expect(result.data.type).toBe('MEETING');
      expect(result.data.amenities).toEqual([]);
      expect(result.data.images).toEqual([]);
    }
  });

  it('should accept valid input with all optional fields', () => {
    const result = createRoomSchema.safeParse({
      ...validInput,
      description: 'A large room',
      floor: '3F',
      building: 'Main',
      type: 'CONFERENCE',
      amenities: ['whiteboard', 'projector'],
      images: ['img1.jpg'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('CONFERENCE');
      expect(result.data.amenities).toEqual(['whiteboard', 'projector']);
    }
  });

  it('should reject missing name', () => {
    const { name, ...rest } = validInput;
    const result = createRoomSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = createRoomSchema.safeParse({ ...validInput, name: '' });
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 200 characters', () => {
    const result = createRoomSchema.safeParse({ ...validInput, name: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should reject missing capacity', () => {
    const { capacity, ...rest } = validInput;
    const result = createRoomSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject capacity of 0', () => {
    const result = createRoomSchema.safeParse({ ...validInput, capacity: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject capacity over 1000', () => {
    const result = createRoomSchema.safeParse({ ...validInput, capacity: 1001 });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer capacity', () => {
    const result = createRoomSchema.safeParse({ ...validInput, capacity: 5.5 });
    expect(result.success).toBe(false);
  });

  it('should reject missing location', () => {
    const { location, ...rest } = validInput;
    const result = createRoomSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject invalid room type', () => {
    const result = createRoomSchema.safeParse({ ...validInput, type: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should accept all valid room types', () => {
    const types = ['MEETING', 'CONFERENCE', 'PHONE_BOOTH', 'TRAINING', 'EVENT', 'HUDDLE'];
    for (const type of types) {
      const result = createRoomSchema.safeParse({ ...validInput, type });
      expect(result.success).toBe(true);
    }
  });

  it('should reject description longer than 1000 characters', () => {
    const result = createRoomSchema.safeParse({ ...validInput, description: 'a'.repeat(1001) });
    expect(result.success).toBe(false);
  });
});

describe('updateRoomSchema', () => {
  it('should accept partial update with only name', () => {
    const result = updateRoomSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object (no fields required)', () => {
    const result = updateRoomSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept nullable description', () => {
    const result = updateRoomSchema.safeParse({ description: null });
    expect(result.success).toBe(true);
  });

  it('should accept nullable floor and building', () => {
    const result = updateRoomSchema.safeParse({ floor: null, building: null });
    expect(result.success).toBe(true);
  });

  it('should accept status update', () => {
    const statuses = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RESERVED'];
    for (const status of statuses) {
      const result = updateRoomSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid status', () => {
    const result = updateRoomSchema.safeParse({ status: 'DELETED' });
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = updateRoomSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

describe('roomQuerySchema', () => {
  it('should provide default page and limit for empty query', () => {
    const result = roomQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('should accept valid page and limit', () => {
    const result = roomQuerySchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('should coerce string page to number', () => {
    const result = roomQuerySchema.safeParse({ page: '2' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it('should reject page less than 1', () => {
    const result = roomQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('should reject limit over 100', () => {
    const result = roomQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('should accept search, type, and filter params', () => {
    const result = roomQuerySchema.safeParse({
      search: 'conference',
      type: 'MEETING',
      status: 'ACTIVE',
      minCapacity: 5,
      maxCapacity: 50,
      floor: '3F',
      building: 'Main',
    });
    expect(result.success).toBe(true);
  });
});

describe('availabilityQuerySchema', () => {
  it('should accept valid YYYY-MM-DD date', () => {
    const result = availabilityQuerySchema.safeParse({ date: '2025-01-15' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format DD/MM/YYYY', () => {
    const result = availabilityQuerySchema.safeParse({ date: '15/01/2025' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format MM-DD-YYYY', () => {
    const result = availabilityQuerySchema.safeParse({ date: '01-15-2025' });
    expect(result.success).toBe(false);
  });

  it('should reject date with time', () => {
    const result = availabilityQuerySchema.safeParse({ date: '2025-01-15T10:00:00' });
    expect(result.success).toBe(false);
  });

  it('should reject missing date', () => {
    const result = availabilityQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty string', () => {
    const result = availabilityQuerySchema.safeParse({ date: '' });
    expect(result.success).toBe(false);
  });
});
