import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { config } from '../config/index';
import { logger } from '../config/logger';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';
import type { JwtPayload } from '../plugins/auth';

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([dhms])$/);
  if (!match) return 86400; // default 24h in seconds
  const amount = parseInt(match[1]!, 10);
  const unit = match[2];
  if (unit === 'd') return amount * 86400;
  if (unit === 'h') return amount * 3600;
  if (unit === 'm') return amount * 60;
  return amount;
}

function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: parseExpiresIn(config.jwt.expiresIn),
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function getRefreshTokenExpiry(): Date {
  const match = config.jwt.refreshExpiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default

  const amount = parseInt(match[1]!, 10);
  const unit = match[2];
  const ms = unit === 'd' ? amount * 86400000
    : unit === 'h' ? amount * 3600000
    : unit === 'm' ? amount * 60000
    : amount * 1000;
  return new Date(Date.now() + ms);
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw { statusCode: 409, message: 'Email already registered' };
  }

  if (input.username) {
    const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
    if (existingUsername) {
      throw { statusCode: 409, message: 'Username already taken' };
    }
  }

  const hashedPassword = await bcrypt.hash(input.password, config.bcrypt.rounds);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      phone: input.phone,
      department: input.department,
      position: input.position,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  const tokenPayload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      status: true,
    },
  });

  if (!user || !user.password) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  if (user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Account is not active' };
  }

  const isValid = await bcrypt.compare(input.password, user.password);
  if (!isValid) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokenPayload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  logger.info('User logged in', { userId: user.id });

  const { password: _pw, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, role: true, status: true } } },
  });

  if (!stored) {
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }

  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw { statusCode: 401, message: 'Refresh token expired' };
  }

  if (stored.user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: 'Account is not active' };
  }

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const tokenPayload: JwtPayload = {
    userId: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: stored.user.id,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      phone: true,
      department: true,
      position: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  return user;
}

export async function logout(userId: string, refreshToken?: string) {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { userId, token: refreshToken } });
  } else {
    // Revoke all refresh tokens for the user
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
  logger.info('User logged out', { userId });
}
