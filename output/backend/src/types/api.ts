export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterQuery {
  search?: string;
  completed?: boolean;
  startDate?: string;
  endDate?: string;
}

export type QueryParams = PaginationQuery & SortQuery & FilterQuery;

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}
