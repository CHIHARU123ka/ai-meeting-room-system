import jwt from 'jsonwebtoken';
import { env } from './environment';
import { JwtPayload, RefreshTokenPayload } from '@/types/auth';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshSecret: env.JWT_REFRESH_SECRET,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  algorithm: 'HS256' as const,
  issuer: 'todo-api',
  audience: 'todo-app',
};

export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

export const generateRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    algorithm: jwtConfig.algorithm,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.secret, {
    algorithms: [jwtConfig.algorithm],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as JwtPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, jwtConfig.refreshSecret, {
    algorithms: [jwtConfig.algorithm],
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  }) as RefreshTokenPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenExpirationTime = (): number => {
  const expiresIn = jwtConfig.expiresIn;
  
  if (typeof expiresIn === 'string') {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000; // 7 days default
    }
  }
  
  return typeof expiresIn === 'number' ? expiresIn * 1000 : 7 * 24 * 60 * 60 * 1000;
};
