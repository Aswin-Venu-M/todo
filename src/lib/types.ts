export type TodoStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserSafe {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
}

export interface TodoAttributes {
  id: string;
  title: string;
  description?: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  ownerId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  owner?: UserSafe;
}

export interface BoardAccessAttributes {
  id: string;
  ownerId: string;
  viewerId: string;
  canView: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  owner?: UserSafe;
  viewer?: UserSafe;
}

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

export interface BoardViewData {
  owner: UserSafe;
  isOwner: boolean;
  canView: boolean;
  todos: TodoAttributes[];
}
