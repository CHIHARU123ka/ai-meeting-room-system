import { registerSchema, loginSchema, refreshTokenSchema } from '@/schemas/auth.schema';

describe('registerSchema', () => {
  const validInput = {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'Taro',
    lastName: 'Yamada',
  };

  it('should accept valid input with required fields only', () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.firstName).toBe('Taro');
      expect(result.data.lastName).toBe('Yamada');
    }
  });

  it('should accept valid input with all optional fields', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      username: 'taro_y',
      phone: '090-1234-5678',
      department: 'Engineering',
      position: 'Manager',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.username).toBe('taro_y');
      expect(result.data.phone).toBe('090-1234-5678');
      expect(result.data.department).toBe('Engineering');
      expect(result.data.position).toBe('Manager');
    }
  });

  it('should reject missing email', () => {
    const { email, ...rest } = validInput;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const { password, ...rest } = validInput;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject missing firstName', () => {
    const { firstName, ...rest } = validInput;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject missing lastName', () => {
    const { lastName, ...rest } = validInput;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({ ...validInput, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('should reject short password (< 8 chars)', () => {
    const result = registerSchema.safeParse({ ...validInput, password: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
    }
  });

  it('should accept password exactly 8 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, password: '12345678' });
    expect(result.success).toBe(true);
  });

  it('should reject empty firstName', () => {
    const result = registerSchema.safeParse({ ...validInput, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject username shorter than 3 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('should reject firstName longer than 100 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, firstName: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('should accept valid login input', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('password123');
    }
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'bad-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required');
    }
  });

  it('should reject missing email', () => {
    const result = loginSchema.safeParse({ password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(false);
  });

  it('should reject empty object', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('refreshTokenSchema', () => {
  it('should accept valid refresh token', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: 'some-token-value' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.refreshToken).toBe('some-token-value');
    }
  });

  it('should reject empty refresh token', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Refresh token is required');
    }
  });

  it('should reject missing refreshToken field', () => {
    const result = refreshTokenSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject non-string refreshToken', () => {
    const result = refreshTokenSchema.safeParse({ refreshToken: 12345 });
    expect(result.success).toBe(false);
  });
});
