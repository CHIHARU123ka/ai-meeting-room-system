import {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  getInitials,
  getRelativeTime,
  parseJwt,
  isTokenExpired,
} from '@/lib/utils';

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'hidden', 'visible');
    expect(result).toBe('base visible');
  });

  it('should merge tailwind conflicts (last wins)', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toBe('foo bar');
  });
});

describe('formatDate', () => {
  it('should format a Date object in Japanese locale', () => {
    const result = formatDate(new Date('2025-01-15T00:00:00'));
    // Japanese locale: "2025年1月15日"
    expect(result).toContain('2025');
    expect(result).toContain('1');
    expect(result).toContain('15');
  });

  it('should format a date string', () => {
    const result = formatDate('2025-12-25T00:00:00');
    expect(result).toContain('2025');
    expect(result).toContain('12');
    expect(result).toContain('25');
  });
});

describe('formatTime', () => {
  it('should format time in HH:MM format', () => {
    const result = formatTime(new Date('2025-01-15T14:30:00'));
    expect(result).toContain('14');
    expect(result).toContain('30');
  });

  it('should format time from string', () => {
    const result = formatTime('2025-01-15T09:05:00');
    expect(result).toContain('09');
    expect(result).toContain('05');
  });
});

describe('formatDateTime', () => {
  it('should format date and time together', () => {
    const result = formatDateTime(new Date('2025-01-15T14:30:00'));
    expect(result).toContain('2025');
    expect(result).toContain('14');
    expect(result).toContain('30');
  });

  it('should format from string input', () => {
    const result = formatDateTime('2025-06-01T09:00:00');
    expect(result).toContain('2025');
    expect(result).toContain('09');
    expect(result).toContain('00');
  });
});

describe('formatDuration', () => {
  it('should format minutes only', () => {
    expect(formatDuration(30)).toBe('30分');
  });

  it('should format hours only', () => {
    expect(formatDuration(60)).toBe('1時間');
    expect(formatDuration(120)).toBe('2時間');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1時間30分');
    expect(formatDuration(150)).toBe('2時間30分');
  });

  it('should format 0 minutes', () => {
    expect(formatDuration(0)).toBe('0分');
  });
});

describe('getInitials', () => {
  it('should return initials for two-word name', () => {
    expect(getInitials('Taro Yamada')).toBe('TY');
  });

  it('should return first two initials for three-word name', () => {
    expect(getInitials('John Paul Jones')).toBe('JP');
  });

  it('should return single initial for single word', () => {
    expect(getInitials('Admin')).toBe('A');
  });

  it('should uppercase the initials', () => {
    expect(getInitials('taro yamada')).toBe('TY');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return "たった今" for just now', () => {
    const result = getRelativeTime(new Date('2025-06-15T11:59:30.000Z'));
    expect(result).toBe('たった今');
  });

  it('should return minutes ago', () => {
    const result = getRelativeTime(new Date('2025-06-15T11:55:00.000Z'));
    expect(result).toBe('5分前');
  });

  it('should return hours ago', () => {
    const result = getRelativeTime(new Date('2025-06-15T09:00:00.000Z'));
    expect(result).toBe('3時間前');
  });

  it('should return days ago within a week', () => {
    const result = getRelativeTime(new Date('2025-06-13T12:00:00.000Z'));
    expect(result).toBe('2日前');
  });

  it('should return formatted date for over a week', () => {
    const result = getRelativeTime(new Date('2025-06-01T12:00:00.000Z'));
    // Falls back to formatDate (Japanese locale)
    expect(result).toContain('2025');
  });
});

describe('parseJwt', () => {
  // Helper: create a minimal JWT token with given payload
  function makeToken(payload: object): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
  }

  it('should parse a valid JWT payload', () => {
    const token = makeToken({ sub: 'user-1', email: 'a@b.com', exp: 9999999999 });
    const result = parseJwt(token);
    expect(result).not.toBeNull();
    expect(result.sub).toBe('user-1');
    expect(result.email).toBe('a@b.com');
  });

  it('should return null for invalid token', () => {
    expect(parseJwt('not.a.valid.token')).toBeNull();
    expect(parseJwt('')).toBeNull();
    expect(parseJwt('abc')).toBeNull();
  });
});

describe('isTokenExpired', () => {
  function makeToken(payload: object): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
  }

  it('should return false for a token with future expiry', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeToken({ exp: futureExp });
    expect(isTokenExpired(token)).toBe(false);
  });

  it('should return true for a token with past expiry', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const token = makeToken({ exp: pastExp });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return true for a token without exp claim', () => {
    const token = makeToken({ sub: 'user-1' });
    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return true for an invalid token', () => {
    expect(isTokenExpired('garbage-token')).toBe(true);
  });
});
