import { Request } from 'express';
import { JwtPayload } from './auth';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    reset: Date;
  };
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
