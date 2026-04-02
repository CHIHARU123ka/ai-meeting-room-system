export interface User {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  todoCount: number;
  completedTodoCount: number;
}
