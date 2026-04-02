export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface TodoWithUser extends Todo {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
